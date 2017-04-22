var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var assert = require('chai').assert;
var should = chai.should();
require('mocha-steps');

var config = require('./testConfig.json');
var host = config.host;
var seller_Username = 'wbr071000';
var seller_Password = 'thisIsARandomPassword';
var seller_InternalUserId;
var seller_Token;
var buyer_Username = 'xxt150630';
var buyer_Password = 'thisIsARandomPassword';
var buyer_InternalUserId;
var buyer_Token;

var test_title='STARTING OUT WITH C++ FROM CNTRL (LOOSEPGS)(W/OUT ACCESS)';
var test_isbn='9780199679416';
var test_author = 'Wallace Wang';
var test_price = 32.99;
var test_condition = 1;
var test_description = 'Unused. Still in original packaging.';
var test_forSaleId;
var test_transactionId;
var test_conversationId;
var test_conversation;
var nlimit=1;

describe('Buyer ' + buyer_Username + ' reserves a textbook, which generates a conversation with seller ' + seller_Username, () => {
    step('Seller logs in successfully',function(done) {
    	chai.request(host)
			.post('/Authenticate')
			.send({
				username: seller_Username,
				password: seller_Password
			})
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				seller_InternalUserId = res.body.userId;
				seller_Token = res.body.token;
				res.should.have.status(200);			
				done();
			}); 
    });
	
	step("Seller posts the book for sale",function(done) {
		chai.request(host)
			.post('/forSaleEntries')
			.set('authorization',seller_Token)
			.set('content-type', 'application/x-www-form-urlencoded')
			.type('form')
			.send({
				title: test_title,
				isbn: test_isbn,
				author: test_author,
				price: test_price,
				condition: test_condition,
				description: test_description
			})
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				res.should.have.status(200);
				test_forSaleId = res.body.forSaleId;
				done();
			});
    });
	
	step('Buyer logs in successfully',function(done) {
    	chai.request(host)
			.post('/Authenticate')
			.send({
				username: buyer_Username,
				password: buyer_Password
			})
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				buyer_InternalUserId = res.body.userId;
				buyer_Token = res.body.token;
				res.should.have.status(200);			
				done();
			}); 
    });
	
	step('Buyer reserves one of those For Sale Entries',function(done) {
		chai.request(host)
			.post('/transactions')
			.set('authorization', buyer_Token)
			.set('content-type', 'application/x-www-form-urlencoded')
			.type('form')
			.send({
				forSaleId: test_forSaleId
			})
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				res.should.have.status(200);
				test_transactionId = res.body.transactionId;
				
				done();
			});
    });
	
	step('Buyer views transaction details of the transaction just initiated',function(done) {
		console.log('\tReserving For Sale ID ' + test_forSaleId);
		console.log('\tTransaction ID: ' + test_transactionId);
    	chai.request(host)
			.get('/transactions/transaction/'+test_transactionId)
			.set('authorization', buyer_Token)
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				res.should.have.status(200);
				test_conversationId = res.body.conversationId;
				console.log('\tConversation ID: ' + test_conversationId);
				done();
			});
    });	
});

describe('Seller ' + seller_Username + ' sees a new message in inbox, checks the message, and sends a response.', () => {
    step('Seller gets list of conversations',function(done) {
    	chai.request(host)
			.get('/messages/conversations/'+seller_InternalUserId)
			.set('authorization', seller_Token)
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				res.should.have.status(200);
				
				//Loop through the conversations in the response until we find the one with the test_conversationId
				for(var i in res.body)
				{
					if(res.body[i].conversationId == test_conversationId)
					{
						test_conversation = res.body[i];
					}
				}
				
				done();
			});
    });
    
    step('Seller opens the conversation with the new message',function(done) {
		chai.request(host)
			.get('/messages/'+test_conversationId+'/limit/'+nlimit+'/before/'+test_conversation.latestMessage.messageId)
			.set('authorization', seller_Token)
			.end((err, res) => {
				res.status.should.eql(200);
				done();
			});
    });
    
    step('Seller sends a response, arranging a meeting date and time',function(done) {
		chai.request(host)
			.post('/messages')
			.set('authorization', seller_Token)
			.set('content-type', 'application/x-www-form-urlencoded')
			.type('form')
			.send({
				conversationId: test_conversationId,
				message: 'Let\'s meet in the Student Union at 4pm.'
			})
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				res.should.have.status(200);			
				done();
			});
    });
});


describe('Buyer ' + buyer_Username + ' sees the message from the seller and responds to it.', () => {
	step('Buyer gets list of conversations',function(done) {
    	chai.request(host)
			.get('/messages/conversations/'+buyer_InternalUserId)
			.set('authorization', buyer_Token)
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				res.should.have.status(200);
				
				//Loop through the conversations in the response until we find the one with the test_conversationId
				for(var i in res.body)
				{
					if(res.body[i].conversationId == test_conversationId)
					{
						test_conversation = res.body[i];
					}
				}
				
				done();
			});
    });
	
	step('Buyer sees that the conversation has a new message',function(done) {
		test_conversation.latestMessage.unread.isTrue;
		done()
    });
	
	step('Buyer opens the conversation with the new message',function(done) {
		chai.request(host)
			.get('/messages/'+test_conversationId+'/limit/'+nlimit+'/before/'+test_conversation.latestMessage.messageId)
			.set('authorization', buyer_Token)
			.end((err, res) => {
				res.status.should.eql(200);
				done();
			});
    });
	
	step('Buyer sends a response, confirming the meeting date and time',function(done) {
		chai.request(host)
			.post('/messages')
			.set('authorization', buyer_Token)
			.set('content-type', 'application/x-www-form-urlencoded')
			.type('form')
			.send({
				conversationId: test_conversationId,
				message: 'That sounds good to me.'
			})
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				res.should.have.status(200);			
				done();
			});
    });
});



/*describe('Message endpoint  test case', () => {
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
    

    
});*/



    

