var authenticate         		= require('./authenticate');
var dal         				= require('../data_access/dal');
var http 						= require('http');
var amazon 						= require('amazon-product-api');
var methods = {};



//9780133778816

const OperationHelper =require('apac').OperationHelper;
var helper=new OperationHelper({
	awsId: 'AKIAJ3YH7GEDD7KSRQNA',
	awsSecret: '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',
	assocId: 'pqHU6FtV+X/LhCVSGwxlgzC5hfXJiaaVw8RszTgK'
});

//query amazon the book's info with its isbn

function fetch(isbn,response,callback){	
	var res = new Object();
	  helper.execute('ItemLookup', {
		    'SearchIndex': 'Books',
		    'ItemId': isbn,
		    'ResponseGroup': 'ItemAttributes,Offers,Images',
		    'IdType': 'ISBN'
		  }).then((response) => {
			  var itemCount=0;
			  var tmp=response.result.ItemLookupResponse.Items;
				var listprice='N/A';
				var lowestprice='N/A';
			  for(var myKey in tmp){				  
				  	if(myKey=='Item'){	
				  		console.log("ok:"+myKey);
				  		var itemCount=tmp[myKey].length;
				  		if(itemCount>1){
				  		    for(var j=0;j<itemCount;j++){
					  	    	var type_of_book=tmp[myKey][j].ItemAttributes.Binding;
					  	    	if(type_of_book!=='Kindle Edition'){
					  	    		
					  	    		if(tmp[myKey][j].ItemAttributes.ListPrice!==undefined){
					  	    			listprice=tmp[myKey][j].ItemAttributes.ListPrice.FormattedPrice;
					  	    		}
					  	    		if(tmp[myKey][j].OfferSummary!==undefined && tmp[myKey][j].OfferSummary.LowestNewPrice!==undefined){
					  	    			lowestprice=tmp[myKey][j].OfferSummary.LowestNewPrice.FormattedPrice;
					  	    		}else if(tmp[myKey][j].OfferSummary!==undefined &&  tmp[myKey][j].OfferSummary.LowestUsedPrice!==undefined){
					  	    			lowestprice=tmp[myKey][j].OfferSummary.LowestUsedPrice.FormattedPrice;
					  	    		}	
					  	    		if(listprice==='N/A' && lowestprice==='N/A')
					  	    			continue;
					  	    		if(listprice==='N/A')
					  	    			listprice=lowestprice;
					  	    		res['price']=listprice;
					  	    		res['lowestprice']=lowestprice;
					  	    		res['link']=tmp[myKey][j].DetailPageURL;		  	    							  	    							  	    							  	    							  	    	
					  	    		callback(null,res);
					  	    		return;
					  	    	}
					  	    }	
				  		}else{
				  			console.log("ok:"+myKey);
				  			console.log("ok");
				  			if(type_of_book!=='Kindle Edition'){
				  	    		console.log(tmp[myKey].ItemAttributes.Title);				  	    		
			
				  	    		if(tmp[myKey].ItemAttributes.ListPrice!==undefined){
				  	    			listprice=tmp[myKey].ItemAttributes.ListPrice.FormattedPrice;
				  	    		}
				  	    		if(tmp[myKey].OfferSummary!==undefined && tmp[myKey].OfferSummary.LowestNewPrice!==undefined){
				  	    			lowestprice==tmp[myKey].OfferSummary.LowestNewPrice.FormattedPrice;
				  	    		}else if(tmp[myKey].OfferSummary!==undefined && tmp[myKey].OfferSummary.LowestUsedPrice!==undefined){
				  	    			lowestprice==tmp[myKey].OfferSummary.LowestUsedPrice.FormattedPrice;
				  	    		}		
				  	    		if(listprice==='N/A' && lowestprice==='N/A')
				  	    			continue;
				  	    		if(listprice==='N/A')
				  	    			listprice=lowestprice;
				  	    		res['price']=listprice;
				  	    		res['link']=tmp[myKey].DetailPageURL;	
				  	    		res['lowestprice']=lowestprice;
				  	    		callback(null,res);
				  	    		return;
				  	    	}
				  			
				  		}
				  				  						  	  
				  	}
				  				
			  }	  			 			  			 
			 
		  }).catch((err) => {
		      console.error("Something went wrong! ", err);
		  });

}

function fetchLowestPrice(isbn,response,callback){	
	var res = new Object();
	  helper.execute('ItemLookup', {
		    'SearchIndex': 'Books',
		    'ItemId': isbn,
		    'ResponseGroup': 'ItemAttributes,Offers,Images',
		    'IdType': 'ISBN'
		  }).then((response) => {
			  var itemCount=0;
			  var tmp=response.result.ItemLookupResponse.Items;
				
				var min=999999;
			  for(var myKey in tmp){				  
				  	if(myKey=='Item'){	
				  		console.log("ok:"+myKey);
				  		var itemCount=tmp[myKey].length;
				  		if(itemCount>1){
				  		    for(var j=0;j<itemCount;j++){
								var lowestprice=999999;
					  	    	var type_of_book=tmp[myKey][j].ItemAttributes.Binding;
					  	    	if(type_of_book!=='Kindle Edition'){
					  	    		if(tmp[myKey][j].OfferSummary!==undefined && tmp[myKey][j].OfferSummary.LowestNewPrice!==undefined){
					  	    			lowestprice=Math.min(lowestprice,parseFloat(tmp[myKey][j].OfferSummary.LowestNewPrice.FormattedPrice.substring(1)));
					  	    		}
					  	    		if(tmp[myKey][j].OfferSummary!==undefined &&  tmp[myKey][j].OfferSummary.LowestUsedPrice!==undefined){
					  	    			lowestprice=Math.min(lowestprice,parseFloat(tmp[myKey][j].OfferSummary.LowestUsedPrice.FormattedPrice.substring(1)));
					  	    		}	
					  	    		min=Math.min(min,lowestprice);
					  	    	}
					  	    }	
				  		}else{
				  			var lowestprice=999999;
				  			if(type_of_book!=='Kindle Edition'){
				  	    		console.log(tmp[myKey].ItemAttributes.Title);				  	    		
				  	    		if(tmp[myKey].OfferSummary!==undefined && tmp[myKey].OfferSummary.LowestNewPrice!==undefined){
				  	    			lowestprice=Math.min(lowestprice,parseFloat(tmp[myKey].OfferSummary.LowestNewPrice.FormattedPrice.substring(1)));
				  	    		}
				  	    		if(tmp[myKey].OfferSummary!==undefined && tmp[myKey].OfferSummary.LowestUsedPrice!==undefined){
				  	    			lowestprice=Math.min(lowestprice,parseFloat(tmp[myKey].OfferSummary.LowestUsedPrice.FormattedPrice.substring(1)));
				  	    		}						  	    		
				  	    		min=Math.min(min,lowestprice);				  	    		
				  	    	}
				  			
				  		}
				  		var outputprice="N/A";
				  		if(min!=999999)
				  			outputprice="$"+min;
				  		console.log("lowest price: "+outputprice);
				   		res['lowestprice']=outputprice;	  	    							  	    							  	    							  	    							  	    	
		  	    		callback(null,res);
		  	    		return;
				  	}
				  				
			  }	  			 			  			 
			 
		  }).catch((err) => {
		      console.error("Something went wrong! ", err);
		  });

}


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
		//isbn should be 13 digits
		var isbn_13 = request.params.isbn;	

		fetch(isbn_13,response,function(err,data){
			getThirdPartySalePriceCallbackFunction(data.price,data.link);
		});
			
	}
	authenticate.checkToken(request, response, afterCheckTokenCallback);
	
}

methods.getSuggestedSalePrice = function(request, response, connection)
{
	var res;
	var isbn;
	//	call back when price is fetched
	var getSuggestSalePriceCallbackFunction = function(price,isbn_org,cheaperSeller)
	{
		response.contentType('application/json');
		response.json({'suggestSalePrice': price,'isbn': isbn_org, 'reason': cheaperSeller+' has lowest offer'});		
	}
	
	
	var get_lowest_price_by_isbn_callback = function(err,rows,fields)
	{
		var lowestLocalPrice=999999;
		var lowest3rdPartyPrice;
		if(res.lowestprice==="N/A")
			lowest3rdPartyPrice=999999;
		else
			lowest3rdPartyPrice=parseFloat(res.lowestprice.substring(1));
		console.log("lowest 3rd party: "+lowest3rdPartyPrice);
		if (!err)
		{
			//many rows
			for(var i=0;i<rows.length;i++){
				lowestLocalPrice=Math.min(lowestLocalPrice,rows[i].price);
			}
			
		}
		console.log("lowest local "+lowestLocalPrice);
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
		//isbn should be 13digits now
		var isbn_13 = request.params.isbn;
		isbn=isbn_13;
		fetchLowestPrice(isbn_13,response,function(err,data){
			//get local price for isbn	
			console.log("data:"+data.price);
			res=data;
			dal.get_forSaleEntries_by_isbn(connection, get_lowest_price_by_isbn_callback,isbn_13);
		});
	}
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

module.exports = methods;
