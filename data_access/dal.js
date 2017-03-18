var moment 						= require('moment');

var methods = {};

methods.get_User_by_netId = function(connection, callbackFunction, netId)
{
	connection.query("SELECT * from User where netID = '" + netId + "'", callbackFunction);
}

methods.get_User_by_internalUserId = function(connection, callbackFunction, internalUserId)
{
	connection.query("SELECT * from User where internalUserId = '" + internalUserId + "'", callbackFunction);
}

methods.get_dummyUserEnrollment_by_internalUserId = function(connection, callbackFunction, internalUserId)
{
	connection.query("SELECT * from dummy_User_Enrollment where internalUserId = '" + internalUserId + "'", callbackFunction)
}

//TODO: I think this can return duplicate records if we have one for sale entry with 2 or more cancelled transactions. Need to test this and resolve it if needed.
var forSaleEntrySelectString = "SELECT a.iD as forSaleId, DATE_FORMAT(a.postedDateTime,'%Y-%m-%d %H:%i:%S') as postedDateTime, 'For Sale' as 'status', a.isbn, a.author, a.title, a.price, a.description, a.bookCondition, d.description as 'bookConditionDescription',c.nickname, ";
var openForSaleEntrySelectString = "'For Sale' as 'status' ";
var pendingForSaleEntrySelectString = "'On Hold' as 'status', b.iD as transactionId ";
var forSaleEntryFrom = "from ForSale a left outer join Transactions b on a.iD=b.forSaleId left outer join User c on a.seller_InternalUserId=c.internalUserId left outer join condition_type d on a.bookCondition=d.id where ";
methods.get_open_forSaleEntries_by_isbn = function(connection, callbackFunction, isbn)
{
	//This will get For Sale entries for the given ISBN that have either no associated transactions, or only cancelled transactions.
	var queryString = forSaleEntrySelectString + openForSaleEntrySelectString + forSaleEntryFrom + "a.ISBN = '" + isbn + "' and (b.status is null or b.status = '2')";
	connection.query(queryString, callbackFunction);
}	

methods.get_open_forSaleEntries_by_internalUserId = function(connection, callbackFunction, internalUserId)
{
	//This will get For Sale entries for the given user id that have either no associated transactions, or only cancelled transactions.
	var queryString = forSaleEntrySelectString + openForSaleEntrySelectString + forSaleEntryFrom + "a.seller_InternalUserId = '" + internalUserId + "' and (b.status is null or b.status = '2')"
	connection.query(queryString, callbackFunction);
}

methods.get_pending_forSaleEntries_by_internalUserId = function(connection, callbackFunction, internalUserId)
{
	//This will get For Sale entries for the given user id that have a pending transaction associated with it.
	var queryString = forSaleEntrySelectString + pendingForSaleEntrySelectString + forSaleEntryFrom + "a.seller_InternalUserId = '" + internalUserId + "' and b.status = '0'"
	connection.query(queryString, callbackFunction);
}

methods.get_forSaleEntries_by_iD = function(connection, callbackFunction, iD)
{
	connection.query("SELECT * from ForSale where iD = '" + iD + "'", callbackFunction);
}

methods.get_possibleConditionTypes = function(connection, callbackFunction)
{
	connection.query("select * from condition_type", callbackFunction);
}

methods.insert_forSaleEntries = function(connection, callbackFunction, providedInternalUserId, providedTitle, providedIsbn, providedAuthor, providedPrice, providedDescription, providedCondition)
{
	var dateTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
	var rowToInsert = {seller_InternalUserId:providedInternalUserId,postedDateTime:dateTime,title:providedTitle,ISBN:providedIsbn,author:providedAuthor,price:providedPrice,description:providedDescription,bookCondition:providedCondition};
	connection.query("Insert into ForSale SET ?", rowToInsert, callbackFunction);
}

methods.get_transactions_by_ForSaleId = function(connection, callbackFunction, forSaleId)
{
	connection.query("SELECT * from Transactions where forSaleId = " + forSaleId, callbackFunction);
}

methods.get_open_transactions_by_internalUserId = function(connection,callbackFunction,providedUserId)
{
	var queryString = "SELECT * from Transactions a left outer join ForSale b on a.forSaleId=b.iD where a.status <> 1 and (a.buyer_InternalUserId = " + providedUserId + " or b.seller_InternalUserId = " + providedUserId + ")";
	connection.query(queryString, callbackFunction);
}

methods.get_transaction_by_Id = function(connection, callbackFunction, transactionId)
{
	connection.query("SELECT * from Transactions a left outer join ForSale b ON a.forSaleId=b.iD WHERE a.iD = " + transactionId, callbackFunction);
}

methods.insert_Transaction = function(connection, callbackFunction, buyer, dateTime, convId, forSaleEntry)
{
	var rowToInsert = {buyer_InternalUserId:buyer, transactionDateTime: dateTime, status: 0, conversationId: convId, forSaleId: forSaleEntry};
	connection.query("Insert into Transactions SET ?", rowToInsert, callbackFunction);
}

methods.update_transactionStatus_by_iD = function(connection, callbackFunction, transactionId, status)
{
	connection.query("UPDATE Transactions SET Status =" + status + " WHERE iD = " + transactionId, callbackFunction);
}

methods.get_possibleTransactionStatuses = function(connection, callbackFunction)
{
	connection.query("select * from transactionStatus_type", callbackFunction);
}

methods.get_possibleTransactionsById = function(connection, callbackFunction, iD)
{
	connection.query("SELECT iD,buyer_InternalUserId,DATE_FORMAT(transactionDateTime,'%Y-%m-%d %H:%i:%S') as transactionDateTime,status,conversationId,forSaleId from Transactions where iD = '" + iD + "'", callbackFunction);
}

methods.get_conversation_by_iD = function(connection, callbackFunction, conversationId)
{
	//conversationId can be either a single integer or an array of integers. Either way, it will get automatically transalated properly into the query.
	connection.query("select * from User_Converation_Assoc assoc join User usr on assoc.internalUserId=usr.internalUserId where conversationId in (" + conversationId + ")", callbackFunction);
}

methods.get_conversations_by_internalUserId = function(connection, callbackFunction, internalUserId)
{
	connection.query("select distinct conversationId from User_Converation_Assoc  where internalUserId = " + internalUserId, callbackFunction);
}

methods.get_conversation_by_recipients = function(connection, callbackFunction, recipient1, recipient2)
{
	connection.query("select * from Conversation conv where exists (select * from User_Converation_Assoc where conversationId = conv.iD and internalUserId = " + recipient1 + ") and exists (select * from User_Converation_Assoc where conversationId = conv.iD and internalUserId = " + recipient2 + ")", callbackFunction);
}

//Inserts a record into the conversation table, and then inserts an association to this new conversation for each of the two recipients.
methods.createConversation = function(connection, callbackFunction, recipient1, recipient2)
{
	
	function insertNewConversationRecordCallback(err,result)
	{
		var conversationId = result.insertId;
		
		//After the Conversation record has been created, we need to insert two records into to the conversation-user association table, so
		//that both users are linked to the conversation.
		var values = [
			[recipient1, conversationId],
			[recipient2, conversationId]
		];
		
		connection.query("INSERT INTO User_Converation_Assoc (internalUserId, conversationId) VALUES ?", [values], function(err) 
		{
			callbackFunction(conversationId, err);
		});
	}
	
	var insertRecord = {iD: 'NULL'};
	connection.query("Insert into Conversation SET ?", insertRecord, insertNewConversationRecordCallback);
}

methods.get_messages_by_conversationId = function(connection, callbackFunction, conversationId)
{
	connection.query("select * from Message where conversationId = " + conversationId + " order by messageDateTime asc", callbackFunction);
}

methods.get_unreadMessages_by_conversationIdAndInternalUserId = function(connection, callbackFunction, conversationId, internalUserId)
{
	connection.query("select conversationId, to_internalUserId, count(*) as 'numUnreadMessages' from Message where unread = 1 and conversationId = " + conversationId + " and to_InternalUserId = " + internalUserId + " group by conversationId, to_internalUserId", callbackFunction);
}

methods.insert_Message = function(connection, callbackFunction, to, from, content, convId)
{
	var dateTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
	var rowToInsert = {to_InternalUserId:to,from_InternalUserId:from, messageDateTime: dateTime, messageContent: content, unread: 1, conversationId: convId};
	connection.query("Insert into Message SET ?", rowToInsert, callbackFunction);
}

methods.update_messagesAsRead_by_messageIdAndUserId = function(connection, callbackFunction, userId, conversationId, messageId)
{
	connection.query("UPDATE Message SET unread = 0 where to_InternalUserId = " + userId + " and conversationId = " + conversationId + " and id <= " + messageId, callbackFunction);
}

module.exports = methods;