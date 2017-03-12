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
					forSaleEntriesArray.push({forSaleId: rows[i].forSaleId, isbn: rows[i].isbn, author: rows[i].author, price: rows[i].price, description: rows[i].description, condition: rows[i].bookCondition});
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
					forSaleEntriesArray.push({forSaleId: rows[i].forSaleId, isbn: rows[i].isbn, author: rows[i].author, price: rows[i].price, description: rows[i].description, condition: rows[i].bookCondition});
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

//TODO: In addition to the "book has been posted for sale" message, also return the For Sale ID of the new record.
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
				response.send({success: true, msg: 'Book has been posted for sale.'}); 
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

module.exports = methods;