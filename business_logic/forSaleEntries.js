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

module.exports = methods;