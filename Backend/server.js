var http = require('http');
var https = require('https');
var express = require('express');
var cheerio = require('cheerio');
var sqlite3 = require('sqlite3').verbose();
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
const dbFile = './database/textbookExchange.db';
const app = express()  

app.get('/', (request, response) => 
{ 
	//Print the web server log to the console, as an example.
	var db = new sqlite3.Database(dbFile);
	db.serialize(function() 
	{
		db.each("SELECT rowid AS id, * FROM webserver_log", function(err, row) 
		{
			console.log(row.id + ": " + row.logMessage);
		});
	});
	db.close();
	
	response.send('UTD Book Exchange');
})

app.post('/', (request, response) => 
{  
	response.send('UTD Book Exchange: POST');
})

app.get('/GetBooksForClass', (request, response) => 
{
	var classFromQueryString = request.query.class;
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
		var dataForPost = 'id='+classFromQueryString+'&div=r-2childcontent';
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
				response.header("Content-Type",'application/json');
				response.send(parseBookHTML(chunk));
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
})

app.listen(server_port, server_ip_address, (err) => 
{  
	if (err) 
	{
		return console.log('something bad happened', err)
	}
	
	prepareDatabase();
	console.log(`server is listening on ${server_port}`)
})

function prepareDatabase()
{
	var currentdate = new Date();
	var dd = currentdate.getDate();
	var mm = currentdate.getMonth()+1; //January is 0!
	var yyyy = currentdate.getFullYear();
	if(dd<10) {
		dd='0'+dd
	} 
	if(mm<10) {
		mm='0'+mm
	} 
	var datetime = mm+'/'+dd+'/'+yyyy + " @ " 
	+ currentdate.getHours() + ":" 
	+ currentdate.getMinutes() + ":" + currentdate.getSeconds();
	
	console.log('Preparing database at: ' + dbFile);
	var db = new sqlite3.Database(dbFile);
	db.serialize(function() 
	{
		db.run('CREATE TABLE if not exists webserver_log (logMessage TEXT)');
		var stmt = db.prepare("INSERT INTO webserver_log VALUES (?)");
		stmt.run("Server started at "+datetime);
		stmt.finalize();
	});
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
			name: title,
			edition: edition,
			author: author,
			ISBN: isbn,
			required_recommended: recommended
		});
	})
	
	return JSON.stringify(arr, null, 4);
}