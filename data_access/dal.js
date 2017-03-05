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

methods.post_forSaleEntries = function(connection, callbackFunction, rowToInsert)
{
	connection.query('Insert into ForSale SET ?', rowToInsert, callbackFunction);
}

methods.get_possibleTransactionStatuses = function(connection, callbackFunction)
{
	connection.query('select * from transactionStatus_type', callbackFunction);
}


module.exports = methods;