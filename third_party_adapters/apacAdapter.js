var methods = {};

const OperationHelper =require('apac').OperationHelper;
var helper=new OperationHelper({
	awsId: 'AKIAJ3YH7GEDD7KSRQNA',
	awsSecret: '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',
	assocId: 'pqHU6FtV+X/LhCVSGwxlgzC5hfXJiaaVw8RszTgK'
});


//query amazon the book's info with its isbn
methods.fetch = function fetch(isbn,response,callback){	
	var res = {};
	  helper.execute('ItemLookup', {
		    'SearchIndex': 'Books',
		    'ItemId': isbn,
		    'ResponseGroup': 'ItemAttributes,Offers,Images',
		    'IdType': 'ISBN'
		  }).then((response) => {
			  var itemCount=0;
			  var tmp=response.result.ItemLookupResponse.Items;
			  //console.log("Raw response body: ", tmp);
				var listprice='N/A';
				var lowestprice='N/A';
				var imageType=["SmallImage","MediumImage","LargeImage"];
			  for(var myKey in tmp){				  
				  	if(myKey=='Item'){	
				  		var itemCount=tmp[myKey].length;
				  		if(itemCount>1){
				  		    for(var j=0;j<itemCount;j++){
					  	    	var type_of_book=tmp[myKey][j].ItemAttributes.Binding;
					  	    	//console.log("item "+j+" :"+tmp[myKey][j]);
					  	    	if(type_of_book!=='Kindle Edition'){					  	    
					  	    		for(var i=0;i<imageType.length;i++){
					  	    			var tmpImage={};
					  	    			//console.log("image:"+imageType[i]);
					  	    			//console.log("item:"+tmp[myKey][j]);
					  	    			var currImage=tmp[myKey][j][imageType[i]];
					  	    			tmpImage["URL"]=currImage["URL"];
					  	    			tmpImage["units"]=currImage["Height"]["Units"];
					  	    			tmpImage["height"]=currImage["Height"]["_"];
					  	    			tmpImage["width"]=currImage["Width"]["_"];
					  	    			res[imageType[i]]=tmpImage;
					  	    		}					  	    	
					  	    		if(res['SmallImage']!=undefined){
					  	    			console.log("res:"+res);
					  	    			callback(null,res);
						  	    		return;
					  	    		}	
					  	    	}
					  	    }	
				  		}else{
				  			if(type_of_book!=='Kindle Edition'){
				  				for(var i=0;i<imageType.length;i++){
				  					var tmpImage={};
				  	    			//console.log("image:"+imageType[i]);
				  	    			//console.log("item:"+tmp[myKey][j]);
				  	    			var currImage=tmp[myKey][imageType[i]];
				  	    			tmpImage["URL"]=currImage["URL"];
				  	    			tmpImage["units"]=currImage["Height"]["Units"];
				  	    			tmpImage["height"]=currImage["Height"]["_"];
				  	    			tmpImage["width"]=currImage["Width"]["_"];
				  	    			res[imageType[i]]=tmpImage;	
				  	    		}								  
				  	    		if(res['SmallImage']!=undefined){
				  	    			console.log("res:"+res);
				  	    			callback(null,res);
					  	    		return;
				  	    		}	
				  	    	}
				  			
				  		}					
				  	}
				  				
			  }	 
			  callback(null,res);
	    		return;
			 
		  }).catch((err) => {
		      console.error("Something went wrong! ", err);
		  });
}


methods.fetchLowestPrice =function fetchLowestPrice(isbn,response,callback){	
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



//query amazon the book's info with its isbn
methods.fetchListPrice =function fetchListPrice(isbn,response,callback){	
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

module.exports = methods;

