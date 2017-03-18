var http 				= require('http');
var https 				= require('https');
var cheerio 			= require('cheerio');
var fs 					= require('fs'); //TODO: is this needed anymore?

var authenticate        = require('./authenticate');
var dal         		= require('../data_access/dal');

var methods = {};

const OperationHelper =require('apac').OperationHelper;
var helper=new OperationHelper({
	awsId: 'AKIAJ3YH7GEDD7KSRQNA',
	awsSecret: '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',
	assocId: 'pqHU6FtV+X/LhCVSGwxlgzC5hfXJiaaVw8RszTgK'
});

//query amazon the book's info with its isbn
function fetch(isbn,response,callback){	
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





methods.getBookCover = function(request, response, connection)
{

	//call back when cover is fetched
	var getCoverCallbackFunction = function(data)
	{
		response.contentType('application/json');
		response.json(data);

	}
	
	var afterCheckTokenCallback = function(internalUserId)
	{
		
		//Get the parameters from the request query string
		var isbn_13 = request.params.isbn;	
		
		fetch(isbn_13,response,function(err,data){
			console.log(data);
			getCoverCallbackFunction(data);
		});

	}	
	
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}

//TODO: need to handle the HTML scraping better for classes that have textbook options from a set.
methods.getMyBooks = function(request, response, connection)
{
	//Get the parameters from the request query string
	var providedUserId = request.params.userId;
	var productionOrStubBooks = request.params.productionOrStubBooks;
			
	//Declare variables that will be set and used throughout this request.		
	var booksArray = [];
	
	//Define the function that will be called after each call to UTD Coursebook.
	var getBooksForClassCallbackFunction = function(numOfClasses, classNum, className, classbooks)
	{
		booksArray.push({classNumber: classNum, className: className, classbooks: classbooks});
		if(booksArray.length >= numOfClasses)
		{
			response.contentType('application/json');
			response.json(booksArray);
		}
	}
				
	//Define a function tht will be called after the checkToken() function has finished validating the authorization token.
	var afterCheckTokenCallback = function(internalUserId){
		var get_dummyUserEnrollment_by_internalUserId_callback = function(err, classRows, fields)
		{
			if (!err)
			{	
				//If there were no rows found, then just return and empty array.
				if(classRows.length === 0)
				{
					response.contentType('application/json');
					response.json({});
				}
				else //Else, loop through each class and fetch the books for that class, and add them to the response.
				{
					for (var i in classRows) 
					{
						var classNumber = classRows[i].enrolledClass + '.' + classRows[i].semester;
						var className = classRows[i].enrolledClassName;
						//If the dummy flag has been set, then just return fake books. Otherwise, carry on and actually make calls to coursebook.
						if(productionOrStubBooks === 'stub')
						{
							var fakeBooksArray = [];
							fakeBooksArray.push(
							{
								bookName: 'STARTING OUT WITH C++ FROM CNTRL (LOOSEPGS)(W/OUT ACCESS)', 
								bookEdition: 'PH 8th Edition 2015', 
								bookAuthor: 'GADDIS',
								bookISBN: '9780133778816',
								book_required_recommended: 'Required Text'
							});
							getBooksForClassCallbackFunction(classRows.length, classNumber, className, fakeBooksArray);
						}
						else
						{
							getBooksForClass(classRows.length, classNumber, className, getBooksForClassCallbackFunction);
						}
					}
				}
			}
			else
			{
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal Server Error. Please try again later.'});
			}
		}
		
		dal.get_dummyUserEnrollment_by_internalUserId(connection, get_dummyUserEnrollment_by_internalUserId_callback, internalUserId);
	}
	authenticate.checkToken(request, response, afterCheckTokenCallback);
}


function parseBookHTML(html)
{
	var arr = [];
	var $ = cheerio.load(html);
	$('td.textbook').each(function(){
        var data = $(this);
		var title = $(".booktitle", data).text();
		var edition = $($(".author", data)[3]).text();
		var author = $($(".author", data)[0]).children().eq(0).text();
		var isbn = $(".isbn", data).children().first().text();
		var recommended = $($(".author", data)[1]).text();
		
		arr.push({
			bookName: title,
			bookEdition: edition,
			bookAuthor: author,
			bookISBN: isbn,
			book_required_recommended: recommended
		});
	})
	
	return JSON.stringify(arr, null, 4);
}

function getBooksForClass(numOfClasses, classNumber, className, callbackFunction) 
{
	var coursebookCookie;
	var optionsForGet = 
	{
		host: 'coursebook.utdallas.edu'
	};

	var callbackForGet = function(resp) 
	{
		//Get the value of ptgsessid from the set-cookie header of the response.
		var setCookieHeader = String(resp.headers["set-cookie"]);
		var ptgsessid = setCookieHeader.split(";")[0];
		coursebookCookie = ptgsessid.split("=")[1];

		//Use this ptgsessid value to send an HTTP POST to get required textbooks.
		var dataForPost = 'id='+classNumber+'&div=r-2childcontent';
		var optionsForPost = 
		{
			host: 'coursebook.utdallas.edu',
			path: '/clips/clip-textbooks.zog',
			method: 'POST',
			headers: 
			{
				'Content-Type' : 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(dataForPost),
				'Cookie':'PTGSESSID='+coursebookCookie+';'
			}
		};
		
		var callbackForPost = function(resp)
		{
			//Define a string, onto which we will append the chunks of response data until we get to the 'end', and then we will parse the string
			//to get the formatted results.
			var str = '';
			resp.setEncoding('utf8');
			resp.on('data', function (chunk) 
			{
				str += chunk;
			});
			resp.on('end', function () 
			{
				var formattedResults = parseBookHTML(str);
				callbackFunction(numOfClasses, classNumber, className, formattedResults);
			});
		}
	
		//Send the HTTP POST
		var post_req = https.request(optionsForPost, callbackForPost) ;
		post_req.write(dataForPost);
		post_req.end();
	}

	//Send the HTTP GET
	var get_req = http.request(optionsForGet, callbackForGet);
	get_req.end();
};


module.exports = methods;
