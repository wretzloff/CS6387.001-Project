#!/bin/env node
var express 			= require('express');
var fs      			= require('fs');
var mysql   			= require('mysql');
var passport			= require('passport');
var argv 				= require('minimist')(process.argv.slice(2));
var swagger 			= require("swagger-node-express");
var bodyParser 			= require('body-parser');
var authenticate		= require('./business_logic/authenticate');
var forSaleEntries		= require('./business_logic/forSaleEntries');
var myBooks				= require('./business_logic/my-books');
var server_port 		= process.env.OPENSHIFT_NODEJS_PORT || 3000
var server_ip_address 	= process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
var mysql_port 			= '3306';
var mysql_host 			= 'mysqldb1.cv17o5shagql.us-west-2.rds.amazonaws.com';
var mysql_username		= 'mysqldb';
var mysql_password		= 'Netbackup1!';
var mysql_database_name	= 'MySQLDB1';
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
		
		self.getRoutes['/my-books/:userId/:productionOrStubBooks'] = function(request, response) 
		{
			myBooks.getMyBooks(request, response, connection);
        };
		
		self.getRoutes['/forSaleEntries/isbn/:isbn'] = function(request, response) 
		{
			forSaleEntries.getForSaleEntriesByIsbn(request, response, connection);
		};
		
		self.getRoutes['/forSaleEntries/userId/:userId'] = function(request, response) 
		{
			forSaleEntries.getForSaleEntriesByUser(request, response, connection);
		};
		
		self.postRoutes['/forSaleEntries'] = function(request, response) 
		{
			forSaleEntries.postBookForSale(request, response, connection);
		}
		
		self.getRoutes['/thirdPartySalePrice/isbn/:isbn'] = function(request, response) 
		{
			function thirdPartySalePriceCallbackFunction(internalUserId)
			{
				var providedIsbn = request.params.isbn;
				console.log(providedIsbn);
				
				//Insert code here get a third party sale price...................
				console.log('Insert code here get a third party sale price...................');
				var thirdPartyPriceInfo = [];
				thirdPartyPriceInfo.push({price: '51.48', source: 'Amazon', link: 'https://www.amazon.com/Starting-Control-Structures-through-Objects/dp/0133778819/ref=sr_1_1?ie=UTF8&qid=1487534860&sr=8-1&keywords=9780133778816'});
				response.send(thirdPartyPriceInfo);
			}
			authenticate.checkToken(request, response, thirdPartySalePriceCallbackFunction);
		};
		
		self.getRoutes['/suggestedSalePrice/isbn/:isbn'] = function(request, response) 
		{
			function suggestedSalePriceCallbackFunction(internalUserId)
			{
				var providedIsbn = request.params.isbn;
				console.log(providedIsbn);
				
				//Insert code here to calculate the suggest sale price...................
				console.log('Insert code here to calculate the suggest sale price...................');
				var suggestedSalePriceInfo = [];
				suggestedSalePriceInfo.push({isbn: providedIsbn, suggestSalePrice: '51.46', reason: 'The lowest price currently listed is $51.46.'});
				response.send(suggestedSalePriceInfo);
			}
			authenticate.checkToken(request, response, suggestedSalePriceCallbackFunction);
		};
		
		self.getRoutes['/transactions/:userId'] = function(request, response) 
		{
			function getPendingTransactionsCallbackFunction(internalUserId)
			{
				//Insert code here to select all Transactions for this internalUserId where the transaction status is 0 (for Pending).
				//Join the Transaction table to the ForSale table to get information about the book being bought/sold, like the book title, author, price, etc.
				var transactionsArray = [];
				transactionsArray.push({iD: '3', buyerOrSeller: 'seller', buyer_Nickname: 'Daren C', buyer_InternalUserId: '2', transactionDateTime: '2017-02-22 00:02:40', title: 'Software Engineering for Dummies', author: 'Wallace Wang', ISBN: '9780470108543', price: '32.67'});
				transactionsArray.push({iD: '8', buyerOrSeller: 'buyer', seller_Nickname: 'Jonathan R', seller_InternalUserId: '5', transactionDateTime: '2017-02-24 00:07:41', title: 'Intermediate Algebra', author: 'Alan S. Tussy', ISBN: '9781111567675', price: '88.00'});
				response.send(transactionsArray);
			}
			
			authenticate.checkToken(request, response, getPendingTransactionsCallbackFunction)
		}
		
		self.getRoutes['/transactions/transaction/:transactionId'] = function(request, response) 
		{
			function getTransactionCallbackFunction(internalUserId)
			{
				var providedTransactionId = request.params.transactionId;
				console.log(providedTransactionId);
				
				//Insert code here to select from the Transaction table where the transaction ID is providedTransactionId.
				//...
				
				response.send({iD: '3', buyerOrSeller: 'seller', buyer_Nickname: 'Daren C', buyer_InternalUserId: '2', transactionDateTime: '2017-02-22 00:02:40', title: 'Software Engineering for Dummies', author: 'Wallace Wang', ISBN: '9780470108543', price: '32.67'});
			}
			
			authenticate.checkToken(request, response, getTransactionCallbackFunction)
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
			
			authenticate.checkToken(request, response, forSaleEntriesPostCallbackFunction);
		}
		
		self.postRoutes['/transactions/transaction/:transactionId/complete'] = function(request, response) 
		{
			function setTransactionCompleteCallbackFunction(internalUserId)
			{
				var providedTransactionId = request.params.transactionId;
				console.log(providedTransactionId);
				
				//Insert code here to mark the specified Transaction record as complete......
				console.log('Insert code here to mark the specified Transaction record as complete......');
				response.send({success: true, msg: 'Transaction has been marked complete.'});
			}
			
			authenticate.checkToken(request, response, setTransactionCompleteCallbackFunction);
		}
		
		self.postRoutes['/authenticate'] = function(request, response) 
		{
			authenticate.issueToken(request, response, connection);
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
		
		var subpath = express();
		self.app.use(bodyParser());
		self.app.use("/v1", subpath);
		swagger.setAppHandler(subpath);
		self.app.use(express.static('dist'));
		swagger.setApiInfo({
			title: "example API",
			description: "API to do something, manage something...",
			termsOfServiceUrl: "",
			contact: "yourname@something.com",
			license: "",
			licenseUrl: ""
		});
		
		subpath.get('/', function (req, res) {
			res.sendfile(__dirname + '/dist/index.html');
		});
		
		swagger.configureSwaggerPaths('', 'api-docs', '');
		var domain = 'localhost';
		if(argv.domain !== undefined)
			domain = argv.domain;
		else
			console.log('No --domain=xxx specified, taking default hostname "localhost".');
		var applicationUrl = 'http://' + domain;
		swagger.configure(applicationUrl, '1.0.0');

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


/**
 *  main():  Main code.
 */
var zapp = new utdtextbookexchange_app();
zapp.initialize();
zapp.start();

