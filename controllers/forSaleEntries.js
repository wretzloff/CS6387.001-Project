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
				response.json(rows);
			}
			else
			{
				console.log(err);
				response.send({success: false, msg: 'Internal error.'});
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
				response.json(rows);
			}
			else
			{
				console.log(err);
				response.send({success: false, msg: 'Internal error.'});
			}
		}
		
		dal.get_forSaleEntries_by_internalUserId(connection, get_forSaleEntries_by_internalUserId_callback, providedUserId);
	}
			
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.postBookForSale = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		//Get the parameters from the body of the HTTP POST message
		var providedInternalUserId = parseInt(internalUserId);
		var providedIsbn = request.body.isbn;
		var providedAuthor = request.body.author;
		var providedPrice = parseFloat(request.body.price);
		var providedCondition = parseInt(request.body.condition);
		var providedDescription = request.body.description;
		var providedDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
		var providedStatus = 0;
		console.log(providedInternalUserId);
		console.log(providedIsbn);
		console.log(providedAuthor);
		console.log(providedPrice);
		console.log(providedCondition);
		console.log(providedDescription);
		console.log(providedDate);
		console.log(providedStatus);
		
		
		var rowToInsert = {seller_InternalUserId:providedInternalUserId,postedDateTime:providedDate,ISBN:providedIsbn,author:providedAuthor,price:providedPrice,description:providedDescription,bookCondition:providedCondition,status:providedStatus};
		function post_forSaleEntriesCallback(err,result)
		{
			if(!err)
			{
				response.send({success: true, msg: 'Book has been posted for sale.'}); 
			}	
			else
			{
				response.send({success: false, msg: 'Problem posting your book. Please try again.'});
			}
		}
		
		//Insert the record into the database.
		dal.post_forSaleEntries(connection, post_forSaleEntriesCallback, rowToInsert)
	}
			
	authenticate.checkToken(request, response, afterCheckTokenCallback)
}

module.exports = methods;