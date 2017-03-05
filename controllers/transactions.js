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
		var convId;
		var sellerId;
		
		
		function insert_Message_callback(err,result)
		{
			if (err) 
			{
				console.log(err);
				response.send({success: false, msg: 'Internal error.'});
			}
			else
			{
				response.send("Message sent from buyer (" + buyerId + ") to seller (" + sellerId + ") that the book has been bought. This endpoint is still under construction.");
			}
		}
		
		function sendAutomatedMessageFromBuyerToSeller()
		{
			var dateTimeOfMessage = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
			dal.insert_Message(connection, insert_Message_callback, sellerId, buyerId, dateTimeOfMessage, '_ wants to buy your book _ !', convId)
		}
		
		function createConversation_callback(conversationId)
		{
			convId = conversationId;
			sendAutomatedMessageFromBuyerToSeller();		
		}
		
		
		
		function get_forSaleEntries_by_iD_callback(err, rows, fields)
		{
			if (err)
			{
				console.log(err);
				response.send({success: false, msg: 'Internal error.'});
			}
			else if(rows.length === 0)
			{
				response.send({success: false, msg: 'Error. No For Sale Entries with this iD exist.'});
			}
			else
			{
				sellerId = rows[0].seller_InternalUserId;
				dal.createConversation(connection, createConversation_callback, internalUserId, sellerId);
			}
		}
		
		dal.get_forSaleEntries_by_iD(connection, get_forSaleEntries_by_iD_callback, providedForSaleId);
		//1. Get the ForSaleEntry record from the database so we know who the seller is.
		// select * from ForSale where iD = providedForSaleId
		//2. Check if a row already exists in the Conversation table between these two users.
		//select * from Conversation conv where exists (select * from User_Converation_Assoc where conversationId = conv.iD and internalUserId = internalUserId) and exists (select * from User_Converation_Assoc where conversationId = conv.iD and internalUserId = seller_InternalUserId)
		//3. If the conversation does not already exist, create one.
		//INSERT INTO  Conversation (iD) VALUES (NULL);
		//INSERT INTO User_Converation_Assoc (internalUserId, conversationId) VALUES (internalUserId, result.insertId)
		//INSERT INTO User_Converation_Assoc (internalUserId, conversationId) VALUES (seller_InternalUserId, result.insertId)
		//4. Now that we have a Conversation to tie it to, create a Transaction.
		//INSERT INTO  Transactions (iD , buyer_InternalUserId , transactionDateTime , status , conversationId , forSaleId) VALUES (NULL ,  '2', NOW( ) ,  '0',  '4',  '2');
		//5. Now, the system needs to send an automated message from the buyer to the seller.
		//INSERT INTO Message ( iD ,  to_InternalUserId, from_InternalUserId, messageDateTime, messageContent, read_unread, conversationId) VALUES (NULL, '1', '2', NOW(), 'Will R wants to buy your book "Applying UML and Patterns"! ', 'unread', '4');
		
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.getTransactionsByUser = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		//Insert code here to select all Transactions for this internalUserId where the transaction status is 0 (for Pending).
		//Join the Transaction table to the ForSale table to get information about the book being bought/sold, like the book title, author, price, etc.
		var transactionsArray = [];
		transactionsArray.push({iD: '3', buyerOrSeller: 'seller', buyer_Nickname: 'Daren C', buyer_InternalUserId: '2', transactionDateTime: '2017-02-22 00:02:40', title: 'Software Engineering for Dummies', author: 'Wallace Wang', ISBN: '9780470108543', price: '32.67'});
		transactionsArray.push({iD: '8', buyerOrSeller: 'buyer', seller_Nickname: 'Jonathan R', seller_InternalUserId: '5', transactionDateTime: '2017-02-24 00:07:41', title: 'Intermediate Algebra', author: 'Alan S. Tussy', ISBN: '9781111567675', price: '88.00'});
		response.send(transactionsArray);
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.getTransactionById = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		var providedTransactionId = request.params.transactionId;
		console.log(providedTransactionId);
		
		//Insert code here to select from the Transaction table where the transaction ID is providedTransactionId.
		//...
		
		response.send({iD: '3', buyerOrSeller: 'seller', buyer_Nickname: 'Daren C', buyer_InternalUserId: '2', transactionDateTime: '2017-02-22 00:02:40', title: 'Software Engineering for Dummies', author: 'Wallace Wang', ISBN: '9780470108543', price: '32.67'});
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
			response.send({success: false, msg: 'Internal error.'});
		}
	}
	
	dal.get_possibleTransactionStatuses(connection, get_possibleTransactionStatuses_callback);
}

methods.markTransactionComplete = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		var providedTransactionId = request.params.transactionId;
		console.log(providedTransactionId);
		
		//Insert code here to mark the specified Transaction record as complete......
		console.log('Insert code here to mark the specified Transaction record as complete......');
		response.send({success: true, msg: 'Transaction has been marked complete.'});
	}
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

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

module.exports = methods;