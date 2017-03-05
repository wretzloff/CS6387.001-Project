var authenticate         		= require('./authenticate');

var methods = {};

methods.getThirdPartySalePrice = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		var providedIsbn = request.params.isbn;
		console.log(providedIsbn);
		
		//Insert code here get a third party sale price...................
		console.log('Insert code here get a third party sale price...................');
		var thirdPartyPriceInfo = [];
		thirdPartyPriceInfo.push({price: '51.48', source: 'Amazon', link: 'https://www.amazon.com/Starting-Control-Structures-through-Objects/dp/0133778819/ref=sr_1_1?ie=UTF8&qid=1487534860&sr=8-1&keywords=9780133778816'});
		response.send(thirdPartyPriceInfo);
	}
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

methods.getSuggestedSalePrice = function(request, response, connection)
{
	function afterCheckTokenCallback(internalUserId)
	{
		var providedIsbn = request.params.isbn;
		console.log(providedIsbn);
		
		//Insert code here to calculate the suggest sale price...................
		console.log('Insert code here to calculate the suggest sale price...................');
		response.json({isbn: providedIsbn, suggestSalePrice: '51.46', reason: 'The lowest price currently listed is $51.46.'});
	}
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

module.exports = methods;