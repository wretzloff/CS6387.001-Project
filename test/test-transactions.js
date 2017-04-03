var config = require('./testConfig.json');
const chai = require('chai');
require('mocha-steps');
const assert = require('chai').assert;
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
var host = config.host;
var token = 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Ng.Br3DB77C4acCJ7vdYG-0Lx55oCn80KR4gzV-lPYlvz4';
var willToken='JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.MQ.4p-Xcp_Aqs6evX2L8AylTbb1woTuxtlgL-Wg1QMXYYk';
var wrongtoken='JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Ng.Br3DB77C4acCJ7vdYG-0Lx55oCn80KR4gzV-lPYlvz3';
var userid=6
var wronguserid=1
var isbn_13='9780133778816';
var isbn_13_test='9780199679416';

describe('Get transactions successful test case', () => {
	var hasTestBook=false;
	var new_forSaleId="";
	var new_TransactionId="";
	
    step("get transaction by userid",function(done) {
    	  chai.request(host)
    	    .get('/transactions/userId/1')
    	    .set('authorization', token)
    	    .end((err, res) => {
    	      should.not.exist(err);
    	      res.status.should.eql(200);
    	      res.type.should.eql('application/json');
    	      res.body.should.to.be.a('array');
    		  done();
    	    });

 
      });
    
    //create a saleobject
    step("check fake book existance",function(done) {
        // add a book for specific userid
    	var request = require('request');
    	request.get({
    	  headers:{'authorization':token},
    	  url:     host+'/forSaleEntries/isbn/'+isbn_13_test,    	  
    	}, function(error, response, body){
    		//console.log(typeof response);
    		var data=JSON.parse(response.body);
    		//console.log("data",data);
    		for(var i=data.length-1;i>=0;i--){
    			var obj=data[i];
    			//console.log("obj",typeof obj);
    			for(var key in obj){
    				if(key==='isbn'){
        				var value=obj[key];
        				//console.log("isbn", value);
        				if(value===isbn_13_test){
        					//console.log("saleid",obj['forSaleId']);
        					new_forSaleId=obj['forSaleId'];
        					hasTestBook=true;    				
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
          	 chai
             .request(host)
             .post('/forSaleEntries')
             .set('content-type', 'application/x-www-form-urlencoded')
             .set('authorization',token)
             .type('form')
             .send('title=testbook-112')
             .send('isbn='+isbn_13_test)
             .send('author=tester')
             .send('price=98')
             .send('condition=1')
             .send('description=test')
             .end(function(error, response, body) {
                 if (error) {
                     done(error);
                 } else {
                	 response.status.should.eql(200);
               	     response.type.should.eql('application/json');
                     done();
                 }
             }); 
    	}else{
    		done();
    	}
 
      });
    //create a transaction by buying a book
    step("buying the new posted fake book",function(done) {
        // add a book for specific userid
    	//console.log("saleid",new_forSaleId);
        	var request = require('request');
        	request.post({
        	  headers:{'authorization':willToken},
        	  url:     host+'/transactions',
        	  form:    {forSaleId:new_forSaleId}
        	}, function(error, response, body){
        		//console.log(JSON.parse(response.body));
        		if(error){
        			//console.log("post book failed");
        			done();
        		}else{        			
        			new_TransactionId=JSON.parse(response.body)['transactionId']
        			done();
        		}
        	
        	});
    	
 
      });
    
    
    
    step("get transactions by TransactionId",function(done) {
    	//console.log("transactionid",new_TransactionId);
    	chai.request(host)
  	    .get('/transactions/transaction/'+new_TransactionId)
  	    .set('authorization', token)
  	    .end((err, res) => {
  	      should.not.exist(err);
  	      res.status.should.eql(200);
  	      res.type.should.eql('application/json');
  		  done();
  	    });


    });
    
    //seller confirm
    step("seller confirm the transaction",function(done) {
        	//console.log("transactionid",new_TransactionId);
        	 chai
             .request(host)
             .post('/transactions/transaction/'+new_TransactionId+'/complete')
             .set('content-type', 'application/x-www-form-urlencoded')
             .set('authorization',token)
             .send({transactionId: new_TransactionId})
             .end(function(error, response, body) {
                 if (error) {
                     done(error);
                 } else {
                	 response.status.should.eql(200);
               	     response.type.should.eql('application/json');
                     done();
                 }
             });   	
        
      });

	  
});


describe('create transactions,get transaction, then cancel', () => {
	var hasTestBook=false;
	var new_forSaleId="";
	var new_TransactionId="";
	
   
    //create a saleobject
    step("check fake book existance",function(done) {
        // add a book for specific userid
    	var request = require('request');
    	request.get({
    	  headers:{'authorization':token},
    	  url:     host+'/forSaleEntries/isbn/'+isbn_13_test,    	  
    	}, function(error, response, body){
    		//console.log(typeof response);
    		var data=JSON.parse(response.body);
    		//console.log("data",data);
    		for(var i=data.length-1;i>=0;i--){
    			var obj=data[i];
    			//console.log("obj",typeof obj);
    			for(var key in obj){
    				if(key==='isbn'){
        				var value=obj[key];
        				//console.log("isbn", value);
        				if(value===isbn_13_test){
        					//console.log("saleid",obj['forSaleId']);
        					new_forSaleId=obj['forSaleId'];
        					hasTestBook=true;    				
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
        	var request = require('request');
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
        			var data=response;
        			//console.log(typeof data);
        			new_forSaleId=data['forSaleId'];
        			done();
        		}
        	
        	});
    	}else{
    		done();
    	}
 
      });
    //create a transaction by buying a book
    step("buying the new posted fake book",function(done) {
        // add a book for specific userid
    	//console.log("saleid",new_forSaleId);
        	var request = require('request');
        	request.post({
        	  headers:{'authorization':willToken},
        	  url:     host+'/transactions',
        	  form:    {forSaleId:new_forSaleId}
        	}, function(error, response, body){
        		//console.log(JSON.parse(response.body));
        		if(error){
        			//console.log("post book failed");
        			done();
        		}else{        			
        			new_TransactionId=JSON.parse(response.body)['transactionId']
        			done();
        		}
        	
        	});
    	
 
      });
    
    
    
    step("get transactions by TransactionId",function(done) {
    	//console.log("transactionid",new_TransactionId);
    	chai.request(host)
  	    .get('/transactions/transaction/'+new_TransactionId)
  	    .set('authorization', token)
  	    .end((err, res) => {
  	      should.not.exist(err);
  	      res.status.should.eql(200);
  	      res.type.should.eql('application/json');
  		  done();
  	    });


    });
    
    //seller confirm
    step("seller cancel the transaction",function(done) {
   	 chai
     .request(host)
     .post('/transactions/transaction/'+new_TransactionId+'/cancel')
     .set('content-type', 'application/x-www-form-urlencoded')
     .set('authorization',token)
     .send({transactionId: new_TransactionId})
     .end(function(error, response, body) {
         if (error) {
             done(error);
         } else {
        	 response.status.should.eql(200);
       	     response.type.should.eql('application/json');
             done();
         }
     }); 
    	
 
      });

	  
});

describe('get transactions status', () => {

   
    //create a saleobject
    step("get all transaction status",function(done) {
	    chai.request(host)
	    .get('/transactions/status')
	    .set('authorization', token)
	    .end((err, res) => {
	      should.not.exist(err);
	      res.should.have.status(200); 
	      res.type.should.eql('application/json');
	      res.body.should.to.be.a('array');
	      done();
	    });
   
      });
	
  
	  
});



