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




module.exports = methods;

