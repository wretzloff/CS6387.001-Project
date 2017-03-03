var http 				= require('http');
var https 				= require('https');
var cheerio 			= require('cheerio');

var authenticate        = require('./authenticate');
var dal         		= require('../data_access/dal');

var methods = {};

methods.getMyBooks = function(request, response, connection)
{
	//Get the userId provided in the query string. Technically, we don't even need this, because when we decode the authorization token,  
			//that gives us the internalUserId. We'll use that, since it's more secure.
			var providedUserId = request.params.userId;
			var productionOrStubBooks = request.params.productionOrStubBooks;
			
			//Define the function that will be called after each call to UTD Coursebook.
			var booksArray = [];
			var getBooksForClassCallbackFunction = function(numOfClasses, classNum, classbooks)
			{
				booksArray.push({className: classNum, classbooks: classbooks});
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
						//Loop through each class and fetch the books for that class, and add them to the response.
						for (var i in classRows) 
						{
							var classNumber = classRows[i].enrolledClass + '.' + classRows[i].semester;
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
								getBooksForClassCallbackFunction(classRows.length, classNumber, fakeBooksArray);
							}
							else
							{
								getBooksForClass(classRows.length, classNumber, getBooksForClassCallbackFunction);
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

function getBooksForClass(numOfClasses, classNumber, callbackFunction) 
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
			resp.setEncoding('utf8');
			resp.on('data', function (chunk) 
			{
				var formattedResults = parseBookHTML(chunk);
				callbackFunction(numOfClasses, classNumber, formattedResults);
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