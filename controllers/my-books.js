var http 				= require('http');
var https 				= require('https');
var cheerio 			= require('cheerio');

var authenticate        = require('./authenticate');
var dal         		= require('../data_access/dal');
var apacAdapter			= require('../third_party_adapters/apacAdapter');

var methods = {};

methods.getBookCover = function(request, response, connection)
{
	var afterFetchCallback = function(err, data)
	{
		if (err)
		{	
			console.log(err);
			response.status(500).send({success: false, msg: 'Query to AWS Server Error. Please try again later.'});
		}
		else
		{
			response.contentType('application/json');
			response.json(data);
		}		
	}
	
	var afterCheckTokenCallback = function(internalUserId)
	{
		//Get the parameters from the request query string
		var isbn_13 = request.params.isbn;	
		
		apacAdapter.fetch(isbn_13,response, afterFetchCallback);
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
			if (err)
			{	
				console.log(err);
				response.status(500).send({success: false, msg: 'Internal Server Error. Please try again later.'});
			}
			else
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
	
	return arr;
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
