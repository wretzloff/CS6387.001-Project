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

describe('User ' + seller_Username + ' logs in, chooses a book from the My Books list, and lists that book for sale', () => {
    step('User logs in successfully',function(done) {
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
	
	step('System displays list of textbooks for user\'s classes',function(done) {
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
	
	step('User chooses a textbook and gets list of For Sale Entries for that textbook',function(done) {
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
	
	step("User posts the book for sale",function(done) {
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
});

describe('User ' + buyer_Username + ' logs in, chooses a book from the My Books list, and reserves one of the For Sale Entries for the book', () => {
    step('User logs in successfully',function(done) {
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

	step('System displays list of textbooks for user\'s classes',function(done) {
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
	
	step('User chooses a textbook and gets list of For Sale Entries for that textbook',function(done) {
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
	
	step('User reserves one of those For Sale Entries',function(done) {
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
				done();
			});
		
    });

});
