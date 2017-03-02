var authenticate         		= require('./authenticate');

var methods = {};

methods.getForSaleEntriesByIsbn = function(request, response, connection)
{
	function forSaleEntriesCallbackFunction(internalUserId)
	{
		var providedIsbn = request.params.isbn;
		connection.query("SELECT iD as forSaleId, isbn,author,price,description,bookCondition from ForSale where ISBN = '" + providedIsbn + "' and status = 0", function(err, rows, fields) 
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
		});
	}
			
	authenticate.checkToken(request, response, forSaleEntriesCallbackFunction);
}

methods.getForSaleEntriesByUser = function(request, response, connection)
{
	function forSaleEntriesCallbackFunction(internalUserId)
	{
		var providedUserId = request.params.userId;
		connection.query("SELECT iD as forSaleId, isbn,author,price,description,bookCondition from ForSale where seller_InternalUserId = '" + providedUserId + "' and status = 0", function(err, rows, fields) 
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
		});
	}
			
	authenticate.checkToken(request, response, forSaleEntriesCallbackFunction);
}

methods.postBookForSale = function(request, response, connection)
{
	function forSaleEntriesPostCallbackFunction(internalUserId)
	{
		//Get the parameters from the body of the HTTP POST message
		var providedIsbn = request.body.isbn;
		var providedAuthor = request.body.author;
		var providedPrice = request.body.price;
		var providedCondition = request.body.condition;
		var proidedDescription = request.body.description;
		console.log(providedIsbn);
		console.log(providedAuthor);
		console.log(providedPrice);
		console.log(providedCondition);
		console.log(proidedDescription);
		
		//Insert code here to create an entry in the ForSale database table...................
		console.log('Insert code here to create an entry in the ForSale database table...................');
		response.send({success: true, msg: 'Book has been posted for sale.'});
	}
	
	authenticate.checkToken(request, response, forSaleEntriesPostCallbackFunction)
}

module.exports = methods;