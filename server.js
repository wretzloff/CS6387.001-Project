#!/bin/env node
var express 			= require('express');
var fs      			= require('fs');
var mysql   			= require('mysql');
var passport			= require('passport');
var argv 				= require('minimist')(process.argv.slice(2));
var swagger 			= require("swagger-node-express");
var bodyParser 			= require('body-parser');
var authenticate		= require('./controllers/authenticate');
var forSaleEntries		= require('./controllers/forSaleEntries');
var myBooks				= require('./controllers/my-books');
var transactions		= require('./controllers/transactions');
var messages			= require('./controllers/messages');
var salePrice			= require('./controllers/salePrice');
var server_port 		= process.env.OPENSHIFT_NODEJS_PORT || 3000;
var server_ip_address 	= process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
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
		
		//TODO: Should change this route to /my-books/:userId/productionFlag/:productionOrStubBooks
		self.getRoutes['/my-books/:userId/:productionOrStubBooks'] = function(request, response) 
		{
			myBooks.getMyBooks(request, response, connection);
        };
		
		//TODO: Does it make sense for this function to be under the my-books endpoint? Or a different one?
		//TODO: need to consolidate the APAC stuff into a single file so that it's not duplicate din both my-books.js and salePrice.js
		self.getRoutes['/my-books/cover/isbn/:isbn'] = function(request, response) 
		{
			myBooks.getBookCover(request, response, connection);
        };
		
		self.getRoutes['/forSaleEntries/isbn/:isbn'] = function(request, response) 
		{
			forSaleEntries.getOpenForSaleEntriesByIsbn(request, response, connection);
		};
		
		self.getRoutes['/forSaleEntries/userId/:userId'] = function(request, response) 
		{
			forSaleEntries.getOpenAndPendingForSaleEntriesByUser(request, response, connection);
		};
		
		self.postRoutes['/forSaleEntries'] = function(request, response) 
		{
			forSaleEntries.postBookForSale(request, response, connection);
		};
		
		self.getRoutes['/forSaleEntries/condition'] = function(request, response) 
		{
			forSaleEntries.getPossibleConditionTypes(request, response, connection);
		};
		
		self.getRoutes['/salePrice/thirdParty/isbn/:isbn'] = function(request, response) 
		{
			salePrice.getThirdPartySalePrice(request, response, connection);
		};
		
		self.getRoutes['/salePrice/suggested/isbn/:isbn'] = function(request, response) 
		{
			salePrice.getSuggestedSalePrice(request, response, connection);
		};
		
		self.getRoutes['/transactions/userId/:userId'] = function(request, response) 
		{
			transactions.getTransactionsByUser(request, response, connection);
		};
		
		//TODO: need to clean up this endpoint end-to-end 
		self.getRoutes['/transactions/transaction/:transactionId'] = function(request, response) 
		{
			transactions.getTransactionById(request, response, connection);
		};
		
		self.getRoutes['/transactions/status'] = function(request, response) 
		{
			transactions.getPossibleTransactionStatuses(request, response, connection);
		};
		
		self.postRoutes['/transactions/transaction/:transactionId/complete'] = function(request, response) 
		{
			transactions.markTransactionComplete(request, response, connection);
		};
		
		self.postRoutes['/transactions/transaction/:transactionId/cancel'] = function(request, response) 
		{
			transactions.markTransactionCancelled(request, response, connection);
		};
		
		self.postRoutes['/transactions'] = function(request, response) 
		{
			transactions.buyBook(request, response, connection);
		};
		
		self.getRoutes['/messages/conversations/:userId'] = function(request, response) 
		{
			messages.getConversationsByUser(request, response, connection);
		};
		
		self.getRoutes['/messages/:conversationId/limit/:limit/before/:startingWithId'] = function(request, response) 
		{
			messages.getMessagesBefore(request, response, connection);
		};
		
		self.getRoutes['/messages/:conversationId/limit/:limit/after/:startingWithId'] = function(request, response) 
		{
			messages.getMessagesAfter(request, response, connection);
		};
		
		self.postRoutes['/messages'] = function(request, response) 
		{
			messages.sendMessage(request, response, connection);
		};
		
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
	    console.log("var verify:",server_port,server_ip_address);
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

