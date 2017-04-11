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

describe('Seller ' + seller_Username + ' logs in, chooses a book from the My Books screen, and lists that book for sale', () => {
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
	
	step('System displays list of textbooks for seller\'s classes',function(done) {
    	chai.request(host)
			.get('/my-books/'+seller_InternalUserId+'/stub')
			.set('authorization', seller_Token)
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				res.should.have.status(200);
				assert.isAbove(Object.keys(res.body[0].classbooks).length, 0);
				done();
			}); 
    });
	
	step('Seller chooses a textbook and gets list of For Sale Entries for that textbook',function(done) {
    	chai.request(host)
			.get('/forSaleEntries/isbn/'+test_isbn)
			.set('authorization', seller_Token)
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				res.should.have.status(200);
				assert.isAbove(Object.keys(res.body[0]).length, 0);
				done();
			});
    });
	
	step('System retrieves suggested sale price for this textbook',function(done) {
    	chai.request(host)
			.get('/salePrice/suggested/isbn/'+test_isbn)
			.set('authorization', seller_Token)
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
	
	step("Seller checks their For Sale screen to verify that the textbook has been posted for sale",function(done) {
    	console.log('\tFor Sale ID: ' + test_forSaleId);
		chai.request(host)
    	    .get('/forSaleEntries/userId/'+seller_InternalUserId)
    	    .set('authorization', seller_Token)
    	    .end((err, res) => {
				var forSaleEntryFound = false;
				for(var i in res.body)
				{
					if(res.body[i].forSaleId == test_forSaleId)
					{
						forSaleEntryFound = true;
						break;
					}
				}	
				assert.isTrue(forSaleEntryFound, 'Book that Seller just posted for sale should be seen on the For Sale list.');
				done();
    	    });
    });
});

describe('Buyer ' + buyer_Username + ' logs in, chooses a book from the My Books list, and reserves one of the For Sale Entries for the book', () => {
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

	step('System displays list of textbooks for buyer\'s classes',function(done) {
    	chai.request(host)
			.get('/my-books/'+buyer_InternalUserId+'/stub')
			.set('authorization', buyer_Token)
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				res.should.have.status(200);
				assert.isAbove(Object.keys(res.body[0].classbooks).length, 0);
				done();
			}); 
    });
	
	step('Buyer chooses a textbook and gets list of For Sale Entries for that textbook',function(done) {
    	chai.request(host)
			.get('/forSaleEntries/isbn/'+test_isbn)
			.set('authorization', buyer_Token)
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				res.should.have.status(200);
				assert.isAbove(Object.keys(res.body[0]).length, 0);
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

describe('Seller ' + seller_Username + ' sees a new message in inbox, sees an automated message that the textbook has been bought, and responds to the buyer', () => {
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
			.get('/messages/'+test_conversationId+'/limit/'+5+'/before/'+test_conversation.latestMessage.messageId)
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
	
	step('After delivering the book in person, seller goes to the Transactions screen to look up this pending transaction',function(done) {
		chai.request(host)
			.get('/transactions/userId/' + seller_InternalUserId)
			.set('authorization', seller_Token)
			.end((err, res) => {
				res.status.should.eql(200);
				
				done();
			});
    });
	
	step('Seller views transaction details of the pending transaction',function(done) {
    	chai.request(host)
			.get('/transactions/transaction/'+test_transactionId)
			.set('authorization', seller_Token)
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
	
