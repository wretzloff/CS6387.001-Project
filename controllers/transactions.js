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
					
					//If the transaction row's status is not cancelled, then we already have an open transaction for this item, so return an error to the client.
					if(rows[i].status !== 2)
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

methods.getTransactionsByUser = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		function get_transactions_by_internalUserId_callback(err,rows,fields)
		{
			if (err)
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else
			{
				var transactionsArray = [];
				for (var i in rows)
				{
					var transaction = convertTransactionRowToJson(rows[i], internalUserId);
					transactionsArray.push(transaction);
				}
				response.send(transactionsArray);
			}
		}
		dal.get_transactions_by_internalUserId(connection, get_transactions_by_internalUserId_callback, internalUserId);
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.getTransactionById = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		//Get the parameters from the request query string
		var providedTransactionId = parseInt(request.params.transactionId);
		
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
				//Get the first (and only) row. This is what we'll return to the client.
				var transactionBuyer = rows[0].buyer_InternalUserId;
				var transactionSeller = rows[0].seller_InternalUserId;
				if(internalUserId === transactionBuyer || internalUserId === transactionSeller)
				{
					var transactionJsonRow = convertTransactionRowToJson(rows[0], internalUserId);
					response.json(transactionJsonRow);
				}
				else
				{
					response.status(403).send({success: false, msg: 'User is not party to the specified transaction.'});
				}
				
			}
		}
	
		dal.get_transaction_by_Id(connection, get_transaction_by_Id_callback,providedTransactionId);
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.getPossibleTransactionStatuses = function(request, response, connection)
{
	function get_possibleTransactionStatuses_callback(err, rows, fields)
	{
		if (err)
		{
			console.log(err);
			response.status(500).send({success: false, msg: 'Internal error.'});
		}
		else
		{
			response.json(rows);
		}
	}
	
	dal.get_possibleTransactionStatuses(connection, get_possibleTransactionStatuses_callback);
}

methods.markTransactionComplete = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		//Get the parameters from the request body
		var providedTransactionId = request.params.transactionId;
		
		//Declare variables that will be set and used throughout this request.
		var targetStatus;
		
		function update_transactionStatus_by_iD_callback(err, rows, fields)
		{
			if(err)
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
			else
			{
				response.send({success: true, msg: 'Transaction has been marked ' + targetStatus + '.'});
			}
		}
		
		function checkIfTransactionIsInValidState(buyerId, sellerId, status)
		{
			if(internalUserId === buyerId)
				{//If the requester is the buyer
					switch(status)
					{
						case 0: //Current status is Pending
							targetStatus = 'Completed by Buyer';
							dal.update_transactionStatus_by_iD(connection, update_transactionStatus_by_iD_callback, providedTransactionId, 3);
							break;
						case 4: //Current status is Completed by Seller
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
						case 0: //Current status is Pending
							targetStatus = 'Completed by Seller';
							dal.update_transactionStatus_by_iD(connection, update_transactionStatus_by_iD_callback, providedTransactionId, 4);
							break;
						case 3: //Current status is Completed by Buyer
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
		//Get the parameters from the request query string
		var providedTransactionId = request.params.transactionId;
		
		//Insert code here to mark the specified Transaction record as cancelled......
		console.log('Insert code here to mark the specified Transaction record as cancelled......');
		response.send({success: true, msg: 'Transaction has been cancelled.'});
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

function convertTransactionRowToJson(row, internalUserId)
{
	var jsonRow = {};
	jsonRow.transactionId = row.transactionId;
	
	if(internalUserId === row.buyer_InternalUserId)
	{
		jsonRow.buyerOrSeller = 'buyer';
		jsonRow.seller_Nickname =  row.seller_nickname;
		jsonRow.seller_InternalUserId = row.seller_InternalUserId;
	}
	else if (internalUserId === row.seller_InternalUserId)
	{
		jsonRow.buyerOrSeller = 'seller';
		jsonRow.buyer_Nickname = row.buyer_nickname;
		jsonRow.buyer_InternalUserId = row.buyer_InternalUserId;
	}
	
	jsonRow.transactionDateTime = row.formattedPostedDateTime;
	jsonRow.status = row.description;
	jsonRow.conversationId = row.conversationId;
	jsonRow.title = row.title;
	jsonRow.isbn = row.isbn;
	jsonRow.author = row.author;
	jsonRow.ISBN = row.ISBN;
	jsonRow.description = row.bookDescription;
	jsonRow.conditionDescription = row.conditionDescription;
	jsonRow.price = row.price;
	return jsonRow;
}

module.exports = methods;