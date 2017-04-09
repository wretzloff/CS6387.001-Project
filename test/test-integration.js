var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var assert = require('chai').assert;
var should = chai.should();
require('mocha-steps');

var config = require('./testConfig.json');
var host = config.host;
var validUser_Username = 'xxt150630';
var validUser_InternalUserId;
var validUser_Token;
var password = 'thisIsARandomPassword';

describe('User ' + validUser_Username + ' logs in, browses for books, and reserves a book', () => {
	var textbook;
	var forSaleEntry;
    step('User logs in successfully',function(done) {
    	chai.request(host)
			.post('/Authenticate')
			.send({
				username: validUser_Username,
				password: password
			})
			.end((err, res) => {
				should.not.exist(err);
				validUser_InternalUserId = res.body.userId;
				validUser_Token = res.body.token;
				res.should.have.status(200);			
				done();
			}); 
    });

	step('System displays list of textbooks for user\'s classes',function(done) {
    	chai.request(host)
			.get('/my-books/'+validUser_InternalUserId+'/stub')
			.set('authorization', validUser_Token)
			.end((err, res) => {
				should.not.exist(err);
				res.should.have.status(200);
				assert.isAbove(Object.keys(res.body[0].classbooks).length, 0);
				textbook = res.body[0].classbooks[0];
				done();
			}); 
    });
	
	step('User gets list of For Sale Entries for textbook',function(done) {
    	chai.request(host)
			.get('/forSaleEntries/isbn/'+textbook.bookISBN)
			.set('authorization', validUser_Token)
			.end((err, res) => {
				should.not.exist(err);
				res.should.have.status(200);
				assert.isAbove(Object.keys(res.body[0]).length, 0);
				forSaleEntry = res.body[0];
				done();
			});
    });

});
