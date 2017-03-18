var moment 						= require('moment');

var dal         				= require('../data_access/dal');
var authenticate         		= require('./authenticate');

var methods = {};

methods.buyBook = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		//Get the parameters from the body of the HTTP POST message
		var providedForSaleId = request.body.forSaleId;
		
		//Declare variables that will be set and used throughout this request.
		var buyerId = internalUserId;
		var buyerNickname;
		var convId;
		var sellerId;
		var bookTitle;
		var dateTimeOfTransaction = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
		
		
		function insert_Transaction_callback(err,result)
		{
			if (err) 
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else
			{
				response.send({success: true, msg: 'Book has put on hold.', transactionId: result.insertId});
			}
		}
		
		function createTransaction()
		{
			dal.insert_Transaction(connection, insert_Transaction_callback, buyerId, dateTimeOfTransaction, convId, providedForSaleId)
		}
		
		function insert_Message_callback(err,result)
		{
			if (err) 
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else
			{
				//Successfully sent an automated message from buyer to seller.
				//Now, need to create a new transaction.
				createTransaction();
			}
		}
		
		function sendAutomatedMessageFromBuyerToSeller()
		{
			dal.insert_Message(connection, insert_Message_callback, sellerId, buyerId, buyerNickname + " wants to buy your book " + bookTitle + "!", convId)
		}
		
		function setConversationId(conversationId)
		{
			convId = conversationId;
			sendAutomatedMessageFromBuyerToSeller();		
		}
		
		function createConversation_callback(conversationId, err)
		{
			if (err) 
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else
			{
				setConversationId(conversationId);
			}
		}
		
		function generateConversation()
		{
			dal.createConversation(connection, createConversation_callback, internalUserId, sellerId);
		}
		
		function get_conversation_by_recipients_callback(err, rows, fields)
		{
			if (err)
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else if(rows.length === 0)
			{ 
				generateConversation();
			}
			else
			{
				//The query returned a previously existing Conversation record between these two users.
				//Get the conversation ID and send it alont to setConversationId().
				setConversationId(rows[0].iD);
			}
		}
		
		function checkIfConversationAlreadyExists()
		{
			dal.get_conversation_by_recipients(connection, get_conversation_by_recipients_callback, internalUserId, sellerId);
		}
		
		function get_User_by_internalUserId_callback(err, rows, fields)
		{
			if (err)
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else if(rows.length === 0)
			{ 
				response.status(500).send({success: false, msg: 'Error. Could not fetch buyer nickname.'});
			}
			else
			{
				buyerNickname = rows[0].nickname;
				
				//Now that we have the nickname of the buyer, next step is to check if a conversation between the buyer and seller already exists.
				checkIfConversationAlreadyExists();
			}
		}
		
		function getBuyerNickname()
		{
			dal.get_User_by_internalUserId(connection, get_User_by_internalUserId_callback, buyerId);
		}
		
		function get_transactions_by_ForSaleId_callback(err, rows, fields)
		{
			if (err)
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			
			else
			{
				//Loop through the transactions associated with this For Sale entry and check each status.
				for (var i in rows) 
				{
					//If the transaction row's status is either pending or completed, then return an error to the client.
					if(rows[i].status === 0 || rows[i].status === 2)
					{
						response.status(400).send({success: false, msg: 'The specified For Sale entry already has a transaction associated with it.'});
					}
				}
				
				//If we made it this far, then none of the transactions have a status of pending or completed.
				//Now that we have verified that there is not already a transaction for this For Sale entry, next step is to get the nickname of the buyer 
				//so that an automated message can be sent form buyer to seller.
				getBuyerNickname();
				
			}
		}
		
		function checkThatTransactionDoesNotAlreadyExist()
		{
			dal.get_transactions_by_ForSaleId(connection, get_transactions_by_ForSaleId_callback, providedForSaleId);
		}
		
		function get_forSaleEntries_by_iD_callback(err, rows, fields)
		{
			if (err)
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else if(rows.length === 0)
			{ 
				response.status(400).send({success: false, msg: 'No For Sale Entries with this iD exist.'});
			}
			else
			{
				sellerId = rows[0].seller_InternalUserId;
				bookTitle = rows[0].title;
				
				if(sellerId === buyerId)
				{
					response.status(400).send({success: false, msg: 'Buyer is the same as seller.'});
				}
				else
				{
					//Now that we have know there is an existing For Sale Entry, next step is to make sure that there are no transactions tied to it.
					checkThatTransactionDoesNotAlreadyExist();
				}
			}
		}
		
		dal.get_forSaleEntries_by_iD(connection, get_forSaleEntries_by_iD_callback, providedForSaleId);
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.getOpenTransactionsByUser = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		//Get the parameters from the HTTP GET request
		var providedUserId = request.params.userId;
		
		function get_open_transactions_by_internalUserId_callback(err,rows,fields)
		{
			if (!err)
			{
				var transactionsArray = [];
				for (var i in rows)
					{
						var transactions = convertTransactionsRowToJson(rows[i]);
						transactionsArray.push(transactions);
					}
				response.send(transactionsArray);
			}
			else
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
		}
		dal.get_open_transactions_by_internalUserId(connection, get_open_transactions_by_internalUserId_callback, providedUserId);
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.getTransactionById = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		var providedTransactionId = parseInt(request.params.transactionId);
		
		//Insert code here to select from the Transaction table where the transaction ID is providedTransactionId.
		function get_possibleTransactionsById_callback(err, rows, fields)
		{
			if (!err)
			{
				response.json(rows);
			}
			else
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
	}
	
	dal.get_possibleTransactionsById(connection, get_possibleTransactionsById_callback,providedTransactionId);
	//response.send({iD: '3', buyerOrSeller: 'seller', buyer_Nickname: 'Daren C', buyer_InternalUserId: '2', transactionDateTime: '2017-02-22 00:02:40', satus: 'Pending', conversationId: 1, title: 'Software Engineering for Dummies', author: 'Wallace Wang', ISBN: '9780470108543', price: '32.67'});
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.getPossibleTransactionStatuses = function(request, response, connection)
{
	function get_possibleTransactionStatuses_callback(err, rows, fields)
	{
		if (!err)
		{
			response.json(rows);
		}
		else
		{
			console.log(err);
			response.status(500).send({success: false, msg: 'Internal error.'});
		}
	}
	
	dal.get_possibleTransactionStatuses(connection, get_possibleTransactionStatuses_callback);
}

/* TODO:
	dynamically grab the numbers we need, pulling them from the DB into an enum or somesuch
 */
methods.markTransactionComplete = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		//Get the parameters from the body of the HTTP POST message
		var providedTransactionId = request.params.transactionId;
		
		//Declare variables that will be set and used throughout this request.
		var targetStatus;
		
		function update_transactionStatus_by_iD_callback(err, rows, fields)
		{
			if(!err)
			{
			response.send({success: true, msg: 'Transaction has been marked ' + targetStatus + '.'});
			}
			else
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
		}
		
		function checkIfTransactionIsInValidState(buyerId, sellerId, status)
		{
			if(internalUserId === buyerId)
				{//If the requester is the buyer
					switch(status)
					{
						case 0: //Pending
							targetStatus = 'Completed by Buyer';
							dal.update_transactionStatus_by_iD(connection, update_transactionStatus_by_iD_callback, providedTransactionId, 3);
							break;
						case 4: //Completed by Seller
							targetStatus = 'Completed';
							dal.update_transactionStatus_by_iD(connection, update_transactionStatus_by_iD_callback, providedTransactionId, 1);
							break;
						default:
							response.status(400).send({success: false, msg: 'Transaction was not in Pending or Completed By Seller status'});
							break;
					}
				}
				else if(internalUserId === sellerId)
				{//If the requester is the seller
					switch(status)
					{
						case 0: //Pending
							targetStatus = 'Completed by Seller';
							dal.update_transactionStatus_by_iD(connection, update_transactionStatus_by_iD_callback, providedTransactionId, 4);
							break;
						case 3: //Completed by Buyer
							targetStatus = 'Completed';
							dal.update_transactionStatus_by_iD(connection, update_transactionStatus_by_iD_callback, providedTransactionId, 1);
							break;
						default:
							response.status(400).send({success: false, msg: 'Transaction was not in Pending or Completed By Buyer status'});
							break;
					}
				}
		}
		
		function checkIfRequesterIsPartOfThisTransaction(buyerId, sellerId, status)
		{
			if(internalUserId !== buyerId && internalUserId !== sellerId)
			{
				response.status(403).send({success: false, msg: 'User is not party to the specified transaction.'});
			}
			else
			{
				//We've determined that user making this request is involved in the transaction. Next step is to make sure the transaction
				//is in a valid state prior to making this change.
				checkIfTransactionIsInValidState(buyerId, sellerId, status);
			}
		}
		
		function get_transaction_by_Id_callback(err, rows, fields)
		{
			if (err)
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else if(rows.length === 0)
			{ 
				response.status(400).send({success: false, msg: 'This transaction does not exist.'});
			}
			else
			{
				//We've determined that this transaction exists. Next step is to ensure that the user making this request is actually involved in this transaction.
				checkIfRequesterIsPartOfThisTransaction(rows[0].buyer_InternalUserId, rows[0].seller_InternalUserId, rows[0].status);
			}
		}
		
		
		dal.get_transaction_by_Id(connection, get_transaction_by_Id_callback, providedTransactionId);
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

//TODO: need to implement this
methods.markTransactionCancelled = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		var providedTransactionId = request.params.transactionId;
		console.log(providedTransactionId);
		
		//Insert code here to mark the specified Transaction record as cancelled......
		console.log('Insert code here to mark the specified Transaction record as cancelled......');
		response.send({success: true, msg: 'Transaction has been cancelled.'});
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}
function convertTransactionsRowToJson(row)
{
return {nickname:row.nickname,netId:row.netId,transactionId:row.transactionId,isbn:row.isbn,author:row.author,price:row.price,description:row.description,bookCondition:row.bookCondition,bookConditionDescription:row.bookConditionDescription,buyer_InternalUserId: row.buyer_InternalUserId, transactionDateTime: row.transactionDateTime, transactionStatus: row.status, conversationId: row.conversationId, forSaleId: row.forSaleId};
}
module.exports = methods;