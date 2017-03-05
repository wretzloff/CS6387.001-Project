var methods = {};

methods.get_User_by_netId = function(connection, callbackFunction, netId)
{
	connection.query("SELECT * from User where netID = '" + netId + "'", callbackFunction);
}

methods.get_dummyUserEnrollment_by_internalUserId = function(connection, callbackFunction, internalUserId)
{
	connection.query("SELECT * from dummy_User_Enrollment where internalUserId = '" + internalUserId + "'", callbackFunction)
}

methods.get_forSaleEntries_by_isbn = function(connection, callbackFunction, isbn)
{
	connection.query("SELECT a.iD as forSaleId, a.isbn,a.author,a.price,a.description,a.bookCondition from ForSale a left outer join Transactions b on a.iD=b.forSaleId where a.ISBN = '" + isbn + "' and (b.status is null or b.status = '2')", callbackFunction);
}

methods.get_forSaleEntries_by_internalUserId = function(connection, callbackFunction, internalUserId)
{
	connection.query("SELECT iD as forSaleId, isbn,author,price,description,bookCondition from ForSale where seller_InternalUserId = '" + internalUserId + "' and status = 0", callbackFunction);
}

methods.get_forSaleEntries_by_iD = function(connection, callbackFunction, iD)
{
	connection.query("SELECT * from ForSale where iD = '" + iD + "'", callbackFunction);
}

methods.get_possibleConditionTypes = function(connection, callbackFunction)
{
	connection.query("select * from condition_type", callbackFunction);
}

methods.post_forSaleEntries = function(connection, callbackFunction, rowToInsert)
{
	connection.query("Insert into ForSale SET ?", rowToInsert, callbackFunction);
}

methods.get_possibleTransactionStatuses = function(connection, callbackFunction)
{
	connection.query("select * from transactionStatus_type", callbackFunction);
}

methods.createConversation = function(connection, callbackFunction, recipient1, recipient2)
{
	
	function insertNewConversationRecordCallback(err,result)
	{
		//After the Conversation record has been created, we need to insert 
		callbackFunction(result.insertId, recipient1, recipient2);
	}
	
	function insertNewConversationRecord()
	{
		var insertRecord = {iD: 'NULL'};
		connection.query("Insert into Conversation SET ?", insertRecord, insertNewConversationRecordCallback);
	}
	
	function checkIfConversationAlreadyExistsCallback(err, rows, fields)
	{
		if (err)
		{
			console.log(err);
			response.send({success: false, msg: 'Internal error.'});
		}
		else if(rows.length === 0)
		{
			//There are no results, so this means there is no existing conversation between these two users. So we need to create one.
			insertNewConversationRecord();
		}
		else
		{
			//The query returned a previously existing Conversation record between these two users, so just send the ID of that conversation to the callback function.
			console.log("recipient1: " + recipient1 + " recipient2: " + recipient2);
			callbackFunction(rows[0].iD, recipient1, recipient2);
		}
	}
	
	//First, run a query to see if a conversation between these two recipients already exists.
	console.log("Checking for conversation btween users " + recipient1 + " and " + recipient2);
	connection.query("select * from Conversation conv where exists (select * from User_Converation_Assoc where conversationId = conv.iD and internalUserId = " + recipient1 + ") and exists (select * from User_Converation_Assoc where conversationId = conv.iD and internalUserId = " + recipient2 + ")", checkIfConversationAlreadyExistsCallback);
}

module.exports = methods;