var authenticate         		= require('./authenticate');
var http 				= require('http');
var methods = {};

methods.getThirdPartySalePrice = function(request, response, connection)
{	
	//call back when price is fetched
	var getThirdPartySalePriceCallbackFunction = function(ListPrice,DetailPageURL)
	{
		response.contentType('application/json');
		console.log("listprice",ListPrice);
		response.json({'price': ListPrice, source: 'Amazon', 'link':DetailPageURL});

	}
	
	function afterCheckTokenCallback(internalUserId)
	{
		//isbn should be 13digits now
		var isbn_13 = request.params.isbn;
		//Insert code here get a third party sale price...................
		//The url we want is: 'ec2-52-33-152-105.us-west-2.compute.amazonaws.com'
		var options = {
		  host: 'ec2-52-33-152-105.us-west-2.compute.amazonaws.com',
		  port:3000,
		  path: '/books/'+isbn_13
		};
		//call back when get response from price server
		callback = function(response) {
			  var body='';
			  response.on('data', function (chunk) {
				  body += chunk;
			  });
			  response.on('end', function () {
				  var jsonBody = JSON.parse(body)[isbn_13];	
				  console.log(jsonBody.ListPrice);				  
				  getThirdPartySalePriceCallbackFunction(jsonBody.ListPrice,jsonBody.DetailPageURL);
			  });			  
			  
		}
		http.request(options, callback).end();
		
		
	}
	authenticate.checkToken(request, response, afterCheckTokenCallback);
	
}

methods.getSuggestedSalePrice = function(request, response, connection)
{
	//call back when price is fetched
	var getSuggestSalePriceCallbackFunction = function(price,isbn_org,DetailPageURL)
	{
		response.contentType('application/json');
		response.json({isbn: isbn_org, suggestSalePrice: price, reason: 'This is the lowest offer'});

	}
	function afterCheckTokenCallback(internalUserId)
	{
		//isbn should be 13digits now
		var isbn_13 = request.params.isbn;
		//Insert code here get a third party sale price...................
		//The url we want is: 'ec2-52-33-152-105.us-west-2.compute.amazonaws.com'
		var options = {
		  host: 'ec2-52-33-152-105.us-west-2.compute.amazonaws.com',
		  port:3000,
		  path: '/books/'+isbn_13
		};
		//call back when get response from price server
		callback = function(response) {
			  var body='';
			  response.on('data', function (chunk) {
				  body += chunk;
			  });
			  response.on('end', function () {
				  var jsonBody = JSON.parse(body)[isbn_13];	
				  console.log(jsonBody.ListPrice);				  
				  getSuggestSalePriceCallbackFunction(jsonBody.ListPrice,isbn_13);
			  });			  
			  
		}
		http.request(options, callback).end();
	}
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

module.exports = methods;