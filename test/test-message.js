var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var assert = require('chai').assert;
var should = chai.should();
require('mocha-steps');
//var request = require('request');

var config = require('./testConfig.json');
var host = config.host;
var token = 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Ng.Br3DB77C4acCJ7vdYG-0Lx55oCn80KR4gzV-lPYlvz4';
var willToken='JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.MQ.4p-Xcp_Aqs6evX2L8AylTbb1woTuxtlgL-Wg1QMXYYk';
var userid=6;
var conversationId=1;
var nlimit=1;
var startwithid=2;

describe('Message endpoint  test case', () => {
	var hasTestBook=false;
	var new_forSaleId="";
	var new_TransactionId="";
	
    step("Get a list of conversations for the given User Id",function(done) {
    	  chai.request(host)
    	    .get('/messages/conversations/'+userid)
    	    .set('authorization', willToken)
    	    .end((err, res) => {
    	      should.not.exist(err);
    	      res.status.should.eql(200);
    	      res.type.should.eql('application/json');
    	      res.body.should.to.be.a('array');
    		  done();
    	    });

 
      });
    
    step("Get a list of conversations before specific id",function(done) {
   	  chai.request(host)
	    .get('/messages/'+conversationId+'/limit/'+nlimit+'/before/'+startwithid)
	    .set('authorization', willToken)
	    .end((err, res) => {
	      should.not.exist(err);
	      res.status.should.eql(200);
	      res.type.should.eql('application/json');
	      res.body.should.to.be.a('array');
		  done();
	    });


    });
    
    step("Get a list of conversations after specific id",function(done) {
    	chai.request(host)
	    .get('/messages/'+conversationId+'/limit/'+nlimit+'/after/'+startwithid)
	    .set('authorization', willToken)
	    .end((err, res) => {
	      should.not.exist(err);
	      res.status.should.eql(200);
	      res.type.should.eql('application/json');
	      res.body.should.to.be.a('array');
		  done();
	    });

      });
    
	
    step("post a message use case",function(done) {
      	 chai
         .request(host)
         .post('/messages')
         .set('content-type', 'application/x-www-form-urlencoded')
         .set('authorization',token)
         .type('form')
         .send('conversationId=4')
         .send('message=test-message')
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



    

