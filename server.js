#!/bin/env node
var express = require('express');
var fs      = require('fs');
var http 	= require('http');
var https 	= require('https');
var cheerio = require('cheerio');
var mysql   = require('mysql');
var passport	= require('passport');
var jwt         = require('jwt-simple');
var server_port 		= process.env.OPENSHIFT_NODEJS_PORT || 3000
var server_ip_address 	= process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
var mysql_port 			= /*process.env.OPENSHIFT_MYSQL_DB_PORT || */'3306';
var mysql_host 			= /*process.env.OPENSHIFT_MYSQL_DB_HOST || */'mysqldb1.cv17o5shagql.us-west-2.rds.amazonaws.com';
var mysql_username		= /*process.env.OPENSHIFT_MYSQL_DB_USERNAME || */'mysqldb';
var mysql_password		= /*process.env.OPENSHIFT_MYSQL_DB_PASSWORD || */'Netbackup1!';
var mysql_database_name	= /*process.env.OPENSHIFT_APP_NAME || */'MySQLDB1'; //When running on OpenShift, this will be the name of the application, and conveniently, also the name of the database.
var authenticationSecret = 'thisIsASecretKeyThatWillPickedRandomly';
var connection = mysql.createConnection(
{
	host     	: mysql_host,
	port		: mysql_port,
	user     	: mysql_username,
	password 	: mysql_password,
	database 	: mysql_database_name
});
connection.connect();

var utdtextbookexchange_app = function() {
    var self = this;
    
	/*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */
    self.createRoutes = function() {
        self.getRoutes = { };
		self.postRoutes = { };
		
		self.getRoutes['/'] = function(request, response) 
		{
            response.setHeader('Content-Type', 'text/html');			
            response.send('Welcome to UTD Book Exchange (Hello World)!');
        };
		
		self.getRoutes['/my-books/:userId'] = function(request, response) 
		{
			//Get the userId provided in the query string. Technically, we don't even need this, because when we decode the authorization token,  
			//that gives us the internalUserId. We'll use that, since it's more secure.
			var providedUserId = request.params.userId;
			
			//Define a function tht will be called after the checkToken() function has finished validating the authorization token.
			var myBooksCallbackFunction = function(internalUserId){
				connection.query("SELECT * from dummy_User_Enrollment where internalUserId = '" + internalUserId + "'", function(err, classRows, fields) 
				{
					if (!err)
					{
						var booksArray = [];
						for (var i in classRows) 
						{
							var requiredBooksForClass = [];
							requiredBooksForClass.push({bookName: 'sampleBook1Name', bookEdition: 'sampleBook1Ed', bookAuthor: 'sampleBook1Author', bookISBN: 'sampleBook1ISBN'});
							requiredBooksForClass.push({bookName: 'sampleBook2Name', bookEdition: 'sampleBook2Ed', bookAuthor: 'sampleBook2Author', bookISBN: 'sampleBook2ISBN'});
							booksArray.push({classSemester: classRows[i].semester, className: classRows[i].enrolledClass, classBooks: requiredBooksForClass});
						}
						
						response.contentType('application/json');
						response.json(booksArray);
					}
					else
					{
						response.send({success: false, msg: 'Required Textbooks cannot be found at this time. Please try again later.'});
					}
				});
			}
			
			checkToken(request, response, authenticationSecret, myBooksCallbackFunction);
        };
		
		self.getRoutes['/forSaleEntries/isbn/:isbn'] = function(request, response) 
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
		};
		
		self.getRoutes['/thirdPartySalePrice/isbn/:isbn'] = function(request, response) 
		{
			var providedIsbn = request.params.isbn;
			console.log(providedIsbn);
			
			//Insert code here get a third party sale price...................
			console.log('Insert code here get a third party sale price...................');
			var thirdPartyPriceInfo = [];
			thirdPartyPriceInfo.push({price: '51.46', source: 'Amazon', link: 'https://www.amazon.com/Starting-Control-Structures-through-Objects/dp/0133778819/ref=sr_1_1?ie=UTF8&qid=1487534860&sr=8-1&keywords=9780133778816'});
			response.send(thirdPartyPriceInfo);
		};
		
		self.getRoutes['/suggestedSalePrice/isbn/:isbn'] = function(request, response) 
		{
			var providedIsbn = request.params.isbn;
			console.log(providedIsbn);
			
			//Insert code here to calculate the suggest sale price...................
			console.log('Insert code here to calculate the suggest sale price...................');
			var suggestedSalePriceInfo = [];
			suggestedSalePriceInfo.push({isbn: providedIsbn, suggestSalePrice: '51.46', reason: 'The lowest price currently listed is $51.46.'});
			response.send(suggestedSalePriceInfo);
		};
		
		self.postRoutes['/forSaleEntries'] = function(request, response) 
		{
			
			function forSaleEntriesPostCallbackFunction(internalUserId)
			{
				//Get the parameters from the body of the HTTP POST message
				var providedIsbn = request.body.isbn;
				var providedAuthor = request.body.author;
				var providedPrice = request.body.price;
				var providedCondition = request.body.condition;
				var proidedDescription = request.body.description;
				console.log(providedIsbn);
				console.log(providedAuthor);
				console.log(providedPrice);
				console.log(providedCondition);
				console.log(proidedDescription);
				
				//Insert code here to create an entry in the ForSale database table...................
				console.log('Insert code here to create an entry in the ForSale database table...................');
				response.send({success: true, msg: 'Book has been posted for sale.'});
			}
			
			checkToken(request, response, authenticationSecret, forSaleEntriesPostCallbackFunction);
		}
		
		self.postRoutes['/buyBook'] = function(request, response) 
		{
			
			function forSaleEntriesPostCallbackFunction(internalUserId)
			{
				//Get the parameters from the body of the HTTP POST message
				var providedForSaleId = request.body.forSaleId;
				console.log(providedForSaleId);
				
				//Insert code here to mark the specified ForSale record as On Hold, create a new transaction, and send a message to the seller......
				console.log('Insert code here to mark the specified ForSale record as On Hold, create a new transaction, and send a message to the seller......');
				response.send({success: true, msg: 'Book has put on hold.'});
			}
			
			checkToken(request, response, authenticationSecret, forSaleEntriesPostCallbackFunction);
		}
		
		self.postRoutes['/authenticate'] = function(request, response) 
		{
			var username = request.body.username;
			var password = request.body.password;
			//If username and password were provided
			if (username) 
			{
				if(password)
				{
					//Query for a user with a matching netID
					connection.query("SELECT * from User where netID = '" + username + "'", function(err, rows, fields) 
					{
						if (!err)
						{
							//If we found a match, the user should be authenticated. Don't worry about a password.
							if(rows.length > 0)
							{
								//Using the internal user ID of the row that was just found, create a token and return it to the client.
								var token = jwt.encode(rows[0].internalUserId, authenticationSecret);
								response.json({success: true, token: 'JWT ' + token});
							}
							else
							{
								response.send({success: false, msg: 'Incorrect username or password.'});
							}
						}
						else
						{
							response.send({success: false, msg: 'User cannot be authenticated at this time. Please try again later.'});
						}
					});
				}
				else
				{
					response.send({success: false, msg: 'Authentication failed. No password.'});
				}
			} 
			else 
			{
				response.send({success: false, msg: 'Authentication failed. No username.'});
			}
		};
		
		
    };
	
	self.setupVariables = function() {
        self.ipaddress = server_ip_address;
        self.port      = server_port;
        if (typeof self.ipaddress === "undefined") {
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            //self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        //self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    //self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();
		self.app.use(passport.initialize());
		self.app.use(express.bodyParser());

        //  Add handlers for the app (from the routes).
        for (var r in self.getRoutes) {
            self.app.get(r, self.getRoutes[r]);
        }
		for (var r in self.postRoutes) {
            self.app.post(r, self.postRoutes[r]);
        }
    };


    /**
     *  Initializes the application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};


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
			name: title,
			edition: edition,
			author: author,
			ISBN: isbn,
			required_recommended: recommended
		});
	})
	
	return JSON.stringify(arr, null, 4);
}

function getToken(headers) 
{
  if (headers && headers.authorization) 
  {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) 
	{
      return parted[1];
    } 
	else 
	{
      return null;
    }
  } 
  else 
  {
    return null;
  }
}

function getBooksForClass(classNumber, callbackFunction) 
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
				callbackFunction(parseBookHTML(chunk));
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

function checkToken(request, response, authenticationSecret, callbackFunction)
{
	//First, check that the token was provided.
	var token = getToken(request.headers);
	if (token) 
	{
		var internalUserId;
		try
		{
			//Second, decode the token to get the internalUserId that it encodes.
			internalUserId = jwt.decode(token, authenticationSecret);
		}
		catch(err)
		{
			return response.status(403).send({success: false, msg: 'Token could not be authenticated: ' + token});
		}
		
		//If we've successfully gotten the internalUserId, then this request is authenticated.
		//Pass the internalUserId into the callback function to perform the business logic.
		callbackFunction(internalUserId);
	}
	else
	{
		return response.status(403).send({success: false, msg: 'No token provided.'});
	}
}



/**
 *  main():  Main code.
 */
var zapp = new utdtextbookexchange_app();
zapp.initialize();
zapp.start();
