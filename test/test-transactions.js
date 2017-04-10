var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var assert = require('chai').assert;
var should = chai.should();
require('mocha-steps');

var config = require('./testConfig.json');
var host = config.host;
var token = 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Ng.Br3DB77C4acCJ7vdYG-0Lx55oCn80KR4gzV-lPYlvz4';
var willToken='JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.MQ.4p-Xcp_Aqs6evX2L8AylTbb1woTuxtlgL-Wg1QMXYYk';
var isbn_13='9780133778816';
var userid=6
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
            	 //console.log(response.body.forSaleId);
                 if (error) {
                     done(error);
                 } else {
                	 response.status.should.eql(200);
               	     response.type.should.eql('application/json');
               	     new_forSaleId=response.body.forSaleId;
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
     	 chai
         .request(host)
         .post('/transactions')
         .set('authorization',willToken)
         .type('form')
         .send('forSaleId='+new_forSaleId)
         .end(function(error, response, body) {
        	 //console.log(response.body.forSaleId);
             if (error) {
                 done(error);
             } else {
            	 response.status.should.eql(200);
           	     response.type.should.eql('application/json');
           	     new_TransactionId=response.body.transactionId;
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
           	 //console.log(response.body.forSaleId);
                if (error) {
                    done(error);
                } else {
               	 response.status.should.eql(200);
              	     response.type.should.eql('application/json');
              	     new_forSaleId=response.body.forSaleId;
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
     	 chai
         .request(host)
         .post('/transactions')
         .set('authorization',willToken)
         .type('form')
         .send('forSaleId='+new_forSaleId)
         .end(function(error, response, body) {
        	 //console.log(response.body.forSaleId);
             if (error) {
                 done(error);
             } else {
            	 response.status.should.eql(200);
           	     response.type.should.eql('application/json');
           	     new_TransactionId=response.body.transactionId;
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



