var moment 						= require('moment');

var dal         				= require('../data_access/dal');
var authenticate         		= require('./authenticate');

var methods = {};

methods.getForSaleEntriesByIsbn = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		var providedIsbn = request.params.isbn;
		
		function get_forSaleEntries_by_isbn_callback(err, rows, fields)
		{
			if (!err)
			{
				var forSaleEntriesArray = [];
				for (var i in rows)
				{
					var forSaleEntry = convertForSaleEntryRowToJson(rows[i]);
					forSaleEntriesArray.push(forSaleEntry);
				}
				response.send(forSaleEntriesArray);
			}
			else
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
		}
		
		dal.get_open_forSaleEntries_by_isbn(connection, get_forSaleEntries_by_isbn_callback, providedIsbn);
	}
			
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}
 
methods.getForSaleEntriesByUser = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		//Get the parameters from the HTTP GET request
		var providedUserId = request.params.userId;

		//Declare variables that will be set and used throughout this request.		
		var forSaleEntriesArray = [];
		
		function get_pending_forSaleEntries_by_internalUserId_callback(err, rows, fields)
		{
			if (!err)
			{
				//Loop through the records that were returned to the database and load them into the response array.
				for (var i in rows)
				{
					var forSaleEntry = convertForSaleEntryRowToJson(rows[i]);
					forSaleEntriesArray.push(forSaleEntry);
				}
				
				//Now that we have finished loading response array, send it to the client.
				response.send(forSaleEntriesArray);
			}
			else
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
		}
		
		function getOpenTransactionsForThisUser()
		{
			dal.get_pending_forSaleEntries_by_internalUserId(connection, get_pending_forSaleEntries_by_internalUserId_callback, providedUserId);
		}
		
		function get_open_forSaleEntries_by_internalUserId_callback(err, rows, fields)
		{
			if (!err)
			{
				//Loop through the records that were returned to the database and load them into the response array.
				for (var i in rows)
				{
					var forSaleEntry = convertForSaleEntryRowToJson(rows[i]);
					forSaleEntriesArray.push(forSaleEntry);
				}
				
				//We have loaded up the For Sale Entries array with transactions that do not have a transaction associated with them.
				//Now, we need to fetch the For Sale Entries that do have transactions associated with them.
				getOpenTransactionsForThisUser();
				
			}
			else
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal error.'});
			}
		}
		
		dal.get_open_forSaleEntries_by_internalUserId(connection, get_open_forSaleEntries_by_internalUserId_callback, providedUserId);
	}
			
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.getPossibleConditionTypes = function(request, response, connection)
{
	function get_possibleConditionTypes_callback(err, rows, fields)
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
	
	dal.get_possibleConditionTypes(connection, get_possibleConditionTypes_callback);
}

methods.postBookForSale = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		//Get the parameters from the body of the HTTP POST message
		var providedInternalUserId = parseInt(internalUserId);
		var providedTitle = request.body.title;
		var providedIsbn = request.body.isbn;
		var providedAuthor = request.body.author;
		var providedPrice = parseFloat(request.body.price);
		var providedCondition = parseInt(request.body.condition);
		var providedDescription = request.body.description;

		function insert_forSaleEntriesCallback(err,result)
		{
			if(!err)
			{
				response.send({success: true, msg: 'Book has been posted for sale.', forSaleId: result.insertId}); 
			}	
			else
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Problem posting your book. Please try again.'});
			}
		}
		
		//Insert the record into the database.
		dal.insert_forSaleEntries(connection, insert_forSaleEntriesCallback, providedInternalUserId, providedTitle, providedIsbn, providedAuthor, providedPrice, providedDescription, providedCondition)
	}
			
	authenticate.checkToken(request, response, afterCheckTokenCallback)
}

function convertForSaleEntryRowToJson(row)
{
	return {forSaleId: row.forSaleId, datePosted: row.postedDateTime, status: row.status, transactionId: row.transactionId, isbn: row.isbn, author: row.author, title: row.title, price: row.price, description: row.description, condition: row.bookCondition, conditionDescription: row.bookConditionDescription, seller_nickname: row.nickname};
}

module.exports = methods;