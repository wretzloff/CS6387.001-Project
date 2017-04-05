var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var assert = require('chai').assert;
var should = chai.should();
require('mocha-steps');
var request = require('request');

var config = require('./testConfig.json');
var host = config.host;
var token = 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Ng.Br3DB77C4acCJ7vdYG-0Lx55oCn80KR4gzV-lPYlvz4';
var isbn_13_test='9780199679416';


describe('Get a list of books for sale for current userid', () => {
	var hasTestBook=false;
	
    step("check fake book existance",function(done) {
        // add a book for specific userid
    	request.get({
    	  headers:{'authorization':token},
    	  url:     host+'/forSaleEntries/isbn/'+isbn_13_test,    	  
    	}, function(error, response, body){
    		//console.log(typeof response);
    		var data=response.body;
    		//console.log("data",typeof data);
    		for(var i=0;i<data.length;i++){
    			var obj=data[i];
    			//console.log("obj",typeof obj);
    			for(var key in obj){
    				if(key==='isbn'){
        				var value=obj[key];
        				//console.log("isbn", value);
        				if(value===isbn_13_test){
        					hasTestBook=true;
            				//console.log("test booked already posted");
            				done();  
            				return;
        				}    					
        			}
    			}
    			
    		}
    		done();
    	});
   
      });
	
    step("post a fakebook to system",function(done) {
        // add a book for specific userid
    	//console.log(hasTestBook);
    	if(!hasTestBook){
        	request.post({
        	  headers:{'authorization':token},
        	  url:     host+'/forSaleEntries',
        	  form:    { title: "testbook-112",isbn:isbn_13_test,author:"tester",price:'99',condition:"1",description:"test none" }
        	}, function(error, response, body){
        		if(error){
        			//console.log("post book failed");
        			done();
        		}else{
        			//console.log("post book successed");
        			done();
        		}
        	
        	});
    	}else{
    		done();
    	}
 
      });
	
    step("get books of current user",function(done) {
    	  chai.request(host)
    	    .get('/forSaleEntries/userId/1')
    	    .set('authorization', token)
    	    .end((err, res) => {
    	      should.not.exist(err);
    	      res.status.should.eql(200);
    	      res.type.should.eql('application/json');
    	      //console.log(typeof res.body);
    		  var data=res.body;
        	 //console.log("data",typeof data);
        		for(var i=0;i<data.length;i++){
        			var obj=data[i];
        			//console.log("obj",typeof obj);
        			for(var key in obj){
        				if(key==='isbn'){
            				var value=obj[key];
            				if(value===isbn_13_test){
                				done();  
                				return;
            				} 
            			}
        			}
        			
        		}
        		done(err);
    	    });

 
      });
	

	  
	});




describe('Get a list of books for sale for specific isbn', () => {
	var hasTestBook=false;
	
    step("check fake book existance",function(done) {
        // add a book for specific userid
    	request.get({
    	  headers:{'authorization':token},
    	  url:     host+'/forSaleEntries/isbn/'+isbn_13_test,    	  
    	}, function(error, response, body){
    		//console.log(typeof response);
    		var data=response.body;
    		//console.log("data",typeof data);
    		for(var i=0;i<data.length;i++){
    			var obj=data[i];
    			//console.log("obj",typeof obj);
    			for(var key in obj){
    				if(key==='isbn'){
        				var value=obj[key];
        				//console.log("isbn", value);
        				if(value===isbn_13_test){
        					hasTestBook=true;
            				//console.log("test booked already posted");
            				done();  
            				return;
        				}    					
        			}
    			}
    			
    		}
    		done();
    	});
   
      });
	
    step("post a fakebook to system",function(done) {
        // add a book for specific userid
    	//console.log(hasTestBook);
    	if(!hasTestBook){
        	request.post({
        	  headers:{'authorization':token},
        	  url:     host+'/forSaleEntries',
        	  form:    { title: "testbook-112",isbn:isbn_13_test,author:"tester",price:'99',condition:"1",description:"test none" }
        	}, function(error, response, body){
        		if(error){
        			//console.log("post book failed");
        			done();
        		}else{
        			//console.log("post book successed");
        			done();
        		}
        	
        	});
    	}else{
    		done();
    	}
 
      });
	
    step("get books of specific isbn",function(done) {
    	  chai.request(host)
    	    .get('/forSaleEntries/isbn/'+isbn_13_test)
    	    .set('authorization', token)
    	    .end((err, res) => {
      		  var data=res.body;
    		  var isFound=false;
        	 console.log("data",typeof data);
        		for(var i=0;i<data.length;i++){
        			for(var key in data[i]){
        				if(key==='isbn'){
        					//console.log(typeof data[i][key]);
            				if(data[i][key]===isbn_13_test){
            					console.log( data[i][key]);
            					isFound=true;
                				done();
                				return;
            				} 
            			}
        			}
        			
        		}
    	      should.not.exist(err);
    	      res.status.should.eql(200);
    	      res.type.should.eql('application/json');
        	  assert.isTrue(isFound,"book get failed");
        	  console.log(isFound);
        		done(err);
    	    });

 
      });
	

	  
	});



describe('Get a list of possible conditions', () => {
	var hasTestBook=false;
    step("get books condition standard",function(done) {
    	  chai.request(host)
    	    .get('/forSaleEntries/condition')
    	    .end((err, res) => {
    	      should.not.exist(err);
    	      res.status.should.eql(200);
    	      res.type.should.eql('application/json');
    	      //console.log(typeof res.body);
    		  var data=res.body;
    		  var len=data.length;
        	  len.should.eql(5);
    		  done();
    	    });

 
      });
	

	  
	});