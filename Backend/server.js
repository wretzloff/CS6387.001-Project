#!/bin/env node
var express = require('express');
var fs      = require('fs');
var http 	= require('http');
var https 	= require('https');
var cheerio = require('cheerio');
var mysql   = require('mysql');
var server_port 		= process.env.OPENSHIFT_NODEJS_PORT || 3000
var server_ip_address 	= process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
var mysql_port 			= process.env.OPENSHIFT_MYSQL_DB_PORT || '3306';
var mysql_host 			= process.env.OPENSHIFT_MYSQL_DB_HOST || 'sql3.freemysqlhosting.net';
var mysql_username		= process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'sql3158842';
var mysql_password		= process.env.OPENSHIFT_MYSQL_DB_PASSWORD || 'MHTv71vnZa';
var mysql_database_name	= process.env.OPENSHIFT_APP_NAME || 'sql3158842'; //When running on OpenShift, this will be the name of the application, and conveniently, also the name of the database.
const app = express()  

app.get('/', (request, response) => 
{ 
	response.send('UTD Book Exchange');
})

app.post('/', (request, response) => 
{  
	response.send('UTD Book Exchange: POST');
})

app.get('/dbtest', (request, response) => 
{ 

	var connection = mysql.createConnection({
				host     	: mysql_host,
				port		: mysql_port,
				user     	: mysql_username,
				password 	: mysql_password,
				database 	: mysql_database_name
	});
	connection.connect();

	connection.query('SELECT * from User', function(err, rows, fields) {
		if (!err)
		{
			console.log('Results: ', rows);
			response.json(rows);
		}
		else
		{
			console.log('Error while performing Query.');
		}
	});
	connection.end();
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
	
	console.log(`server is listening on ${server_port}`)
})


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

