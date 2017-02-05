var http = require('http');
var https = require('https');
var express = require('express');
var cheerio = require('cheerio'); 
const app = express()  
const port = 3000

app.get('/', (request, response) => 
{ 
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

app.listen(port, (err) => 
{  
  if (err) 
  {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
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