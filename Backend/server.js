var http = require('http');
const express = require('express')  
const app = express()  
const port = 3000

app.get('/', (request, response) => 
{ 
	response.send('UTD Book Exchange')
})

app.post('/', (request, response) => 
{  
	response.send('UTD Book Exchange: POST')
})

app.get('/GetBooksForClass', function(req, response) 
{
	var arr = [];
	arr.push({
        name: "STARTING OUT WITH C++ FROM CNTRL (LOOSEPGS)(W/OUT ACCESS)",
        edition: "8",
		author: "GADDIS",
        ISBN: "9780133778816",
		required_recommended: "required"
    });
	
	arr.push({
        name: "STARTING OUT WITH C++: FROM CONTROL ETC",
        edition: "9",
		author: "GADDIS",
        ISBN: "9780133769395",
		required_recommended: "recommended"
    });
	
	response.header("Content-Type",'application/json');
	response.send(JSON.stringify(arr, null, 4));
})

app.listen(port, (err) => 
{  
  if (err) 
  {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})


