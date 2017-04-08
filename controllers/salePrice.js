var authenticate         		= require('./authenticate');
var dal         				= require('../data_access/dal');
var http 						= require('http');
var amazon 						= require('amazon-product-api');
var apacAdapter			= require('../third_party_adapters/apacAdapter');
var methods = {};
var promise = require('promise');

const OperationHelper =require('apac').OperationHelper;
var helper=new OperationHelper({
	awsId: 'AKIAJ3YH7GEDD7KSRQNA',
	awsSecret: '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',
	assocId: 'pqHU6FtV+X/LhCVSGwxlgzC5hfXJiaaVw8RszTgK'
});


methods.getThirdPartySalePrice = function(request, response, connection)
{	
	//call back when price is fetched
	var getThirdPartySalePriceCallbackFunction = function(ListPrice,DetailPageURL)
	{
		console.log('in callback!!');
		console.log("ListPrice: " + ListPrice);
		console.log("DetailPageURL: " + DetailPageURL);
		response.contentType('application/json');
		response.json({'price': ListPrice, 'source': 'Amazon', 'link':DetailPageURL});

	}
	
	function afterCheckTokenCallback(internalUserId)
	{
		//Get the parameters from the request query string
		var isbn_13 = request.params.isbn;	

		apacAdapter.fetchListPrice(isbn_13,response,function(err,data){
			getThirdPartySalePriceCallbackFunction(data.price,data.link);
		});
			
	}
	authenticate.checkToken(request, response, afterCheckTokenCallback);
	
}

methods.getSuggestedSalePrice = function(request, response, connection)
{
	var res;
	var isbn;
	var lowestLocalPrice=999999;
	var lowest3rdPartyPrice;
	var isbn_13 = request.params.isbn;
	isbn=isbn_13;
	//	call back when price is fetched
	var promise1 = new Promise(function (resolve, reject) {
		
		dal.get_open_forSaleEntries_by_isbn(connection, function(err,rows,fields){
		
			console.log("lowest 3rd party: "+lowest3rdPartyPrice);
			if (!err)
			{
				//many rows
				for(var i=0;i<rows.length;i++){
					lowestLocalPrice=Math.min(lowestLocalPrice,rows[i].price);
				}
				
			}
			console.log("lowest local "+lowestLocalPrice);
		},isbn_13);
		
		if (err) reject(err);
		    else resolve(res);
		});
	
	var promise2 = new Promise(function (resolve, reject) {
		apacAdapter.fetchLowestPrice(isbn_13,response,function(err,data){
			//get local price for isbn	
			//console.log("data:"+data);
			res=data;
			if(res.lowestprice==="N/A")
				lowest3rdPartyPrice=999999;
			else
				lowest3rdPartyPrice=parseFloat(res.lowestprice.substring(1));
			if (err) reject(err);
		    else resolve(data);
		});
		});
	
	var getSuggestSalePriceCallbackFunction = function(price,isbn_org,cheaperSeller)
	{
		response.contentType('application/json');
		response.json({'suggestSalePrice': price,'isbn': isbn_org, 'reason': cheaperSeller+' has lowest offer'});		
	}
	
	
	var get_lowest_price_by_isbn_callback = function(err)
	{
		var cheaperSeller;
		if(lowestLocalPrice>lowest3rdPartyPrice){
			lowestPrice=lowest3rdPartyPrice;
			cheaperSeller="Third Party Seller";
		}else{
			lowestPrice=lowestLocalPrice;
			cheaperSeller="UTD Seller";
		}
		console.log("lowest all "+lowestPrice);
		console.log("Cheaper seller "+cheaperSeller);
		var outputprice;
		if(lowestPrice==999999)
			outputprice='N/A'
		else
			outputprice="$"+lowestPrice;
		console.log("output"+outputprice);
		getSuggestSalePriceCallbackFunction(outputprice,isbn,cheaperSeller);
	}
	
	function afterCheckTokenCallback(internalUserId)
	{
		
		promise.all([promise1,promise2])
		.then(get_lowest_price_by_isbn_callback(null));
	
	}
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

module.exports = methods;