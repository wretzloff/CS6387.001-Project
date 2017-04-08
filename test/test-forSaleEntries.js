var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var assert = require('chai').assert;
var should = chai.should();
require('mocha-steps');
var request = require('request');

var config = require('./testConfig.json');
var host = config.host;
var validUser_Username = 'xxt150630';
var validUser_InternalUserId = 6;
var token = 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Ng.Br3DB77C4acCJ7vdYG-0Lx55oCn80KR4gzV-lPYlvz4';
var isbn_13_test='9780199679416';

describe('Test getting list of For Sale Entries for current user', () => {
	var response;
	
	step("HTTP response should be 200",function(done) {
    	//this.timeout(5000);
		chai.request(host)
    	    .get('/forSaleEntries/userId/'+validUser_InternalUserId)
    	    .set('authorization', token)
    	    .end((err, res) => {
				should.not.exist(err);
				response = res;
				response.should.have.status(200);
				done();
    	    });
    });
	  
	step('Response type should be: application/json',function(done) {
    	response.type.should.eql('application/json');
		done(); 
    });
	
	step('Response body should be an array of For Sale Entries',function(done) {
		response.body.should.be.a('array');
		done(); 
    });
	
	step('Response body array should contain at least one For Sale Entry',function(done) {
		var numberOfForSaleEntries = Object.keys(response.body).length;
		assert.isAbove(numberOfForSaleEntries, 0);
		done(); 
    });
	
	step('All For Sale Entries should have a "forSaleId" greater than 0',function(done) {
		var resultIsNotNull = true;
		var resultIsInteger = true;
		var resultIsGreaterThanZero = true;
		for(var i in response.body)
		{
			var forSaleId = response.body[i].forSaleId;
			if(forSaleId == null)
			{
				resultIsNotNull = false;
				break;
			}
			else if(!Number.isInteger(forSaleId))
			{
				resultIsInteger = false;
				break;
			}
			else if(forSaleId <= 0)
			{
				resultIsGreaterThanZero = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All For Sale Entries should have a "forSaleId" that is not NULL');
		assert.isTrue(resultIsInteger, 'All For Sale Entries should have a "forSaleId" that is an integer');
		assert.isTrue(resultIsGreaterThanZero, 'All For Sale Entries should have a "forSaleId" that is greater than zero');
		done(); 
    });
	
	step('All For Sale Entries should have a "seller_InternalUserId"',function(done) {
		done(); 
    });
	
	step('All For Sale Entries should have a "datePosted"',function(done) {
		done(); 
    });
	
	step('All For Sale Entries should have a "status"',function(done) {
		done(); 
    });
	
	step('All For Sale Entries should have a "isbn"',function(done) {
		done(); 
    });
});

describe('Test getting list of For Sale Entries for a specified ISBN', () => {
	var response;
	
	step("HTTP response should be 200",function(done) {
    	chai.request(host)
    	    .get('/forSaleEntries/isbn/'+isbn_13_test)
    	    .set('authorization', token)
    	    .end((err, res) => {
				should.not.exist(err);
				response = res;
				response.should.have.status(200);
				done();
    	    });
    });
	
	step('Response type should be: application/json',function(done) {
    	response.type.should.eql('application/json');
		done(); 
    });
	
	step('Response body should be an array of For Sale Entries',function(done) {
		response.body.should.be.a('array');
		done(); 
    });
	
	step('Response body array should contain at least one For Sale Entry',function(done) {
		var numberOfForSaleEntries = Object.keys(response.body).length;
		assert.isAbove(numberOfForSaleEntries, 0);
		done(); 
    });
	
	/*step("get books of specific isbn",function(done) {
    	chai.request(host)
    	    .get('/forSaleEntries/isbn/'+isbn_13_test)
    	    .set('authorization', token)
    	    .end((err, res) => {
      		  var data=res.body;
    		  var isFound=false;
        	 //console.log("data",typeof data);
        		for(var i=0;i<data.length;i++){
        			for(var key in data[i]){
        				if(key==='isbn'){
        					//console.log(typeof data[i][key]);
            				if(data[i][key]===isbn_13_test){
            					//console.log( data[i][key]);
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

 
      });*/
	

	  
});

describe('Test posting a book for sale', () => {
	    /*step("post a fakebook to system",function(done) {
        // add a book for specific userid
    	//console.log(hasTestBook);
    	
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
    	
 
      });  */
});


describe('Test getting list of possible conditions', () => {
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