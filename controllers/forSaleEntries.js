var moment 						= require('moment');

var dal         				= require('../data_access/dal');
var authenticate         		= require('./authenticate');

var methods = {};

//TODO: in addition to returning condition code, need to also return the condition description - "Like New", etc.
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
		
		dal.get_forSaleEntries_by_isbn(connection, get_forSaleEntries_by_isbn_callback, providedIsbn);
	}
			
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.getForSaleEntriesByUser = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		var providedUserId = request.params.userId;
		
		function get_forSaleEntries_by_internalUserId_callback(err, rows, fields)
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
		
		dal.get_forSaleEntries_by_internalUserId(connection, get_forSaleEntries_by_internalUserId_callback, providedUserId);
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
	return {forSaleId: row.forSaleId, isbn: row.isbn, author: row.author, price: row.price, description: row.description, condition: row.bookCondition, conditionDescription: row.bookConditionDescription, seller_nickname: row.nickname};
}

module.exports = methods;