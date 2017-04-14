var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var assert = require('chai').assert;
var should = chai.should();
require('mocha-steps');

var config = require('./testConfig.json');
var host = config.host;
var validUser_Username = 'xxt150630';
var validUser_InternalUserId = 6;
var token = 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Ng.Br3DB77C4acCJ7vdYG-0Lx55oCn80KR4gzV-lPYlvz4';
var test_title='STARTING OUT WITH C++ FROM CNTRL (LOOSEPGS)(W/OUT ACCESS)';
var test_isbn='9780199679416';
var test_author = 'Wallace Wang';
var test_price = 32.99;
var test_condition = 1;
var test_description = 'Unused. Still in original packaging.';

describe('Test posting a book for sale', () => {
	var response;
	step("HTTP response should be 200",function(done) {
		chai.request(host)
			.post('/forSaleEntries')
			.set('authorization',token)
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
				response = res;
				response.should.have.status(200);			
				done();
			});
    });

	step('Response type should be: application/json',function(done) {
    	response.type.should.eql('application/json');
		done(); 
    });
	
	step('Response body should include: "success"',function(done) {
		response.body.should.include.keys('success');
		done(); 
    });
	
	step('Response body "success" should be true',function(done) {
		response.body.success.isTrue;
		done(); 
    });
	
	step('Response body should include: "msg"',function(done) {
		response.body.should.include.keys('msg');
		done(); 
    });
	
	step('Response body "msg" should be "Book has been posted for sale."',function(done) {
		response.body.msg.should.eql('Book has been posted for sale.');
		done(); 
    });
	
	step('Response body should include: "forSaleId"',function(done) {
		response.body.should.include.keys('forSaleId');
		done(); 
    });
	
	step('Response body "forSaleId" should be an integer',function(done) {
		assert.isTrue(Number.isInteger(response.body.forSaleId), 'Response body "forSaleId" should be an integer');
		done(); 
    });
});

describe('Test getting list of For Sale Entries for current user', () => {
	var response;
	step("HTTP response should be 200",function(done) {
		chai.request(host)
    	    .get('/forSaleEntries/userId/'+validUser_InternalUserId)
    	    .set('authorization', token)
    	    .end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
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
			if(forSaleId == null || forSaleId == '')
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
	
	step('All For Sale Entries should have a "seller_InternalUserId" greater than 0',function(done) {
		var resultIsNotNull = true;
		var resultIsInteger = true;
		var resultIsGreaterThanZero = true;
		for(var i in response.body)
		{
			var seller_InternalUserId = response.body[i].seller_InternalUserId;
			if(seller_InternalUserId == null || seller_InternalUserId == '')
			{
				resultIsNotNull = false;
				break;
			}
			else if(!Number.isInteger(seller_InternalUserId))
			{
				resultIsInteger = false;
				break;
			}
			else if(seller_InternalUserId <= 0)
			{
				resultIsGreaterThanZero = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All For Sale Entries should have a "seller_InternalUserId" that is not NULL');
		assert.isTrue(resultIsInteger, 'All For Sale Entries should have a "seller_InternalUserId" that is an integer');
		assert.isTrue(resultIsGreaterThanZero, 'All For Sale Entries should have a "seller_InternalUserId" that is greater than zero');
		done(); 
    });
	
	step('All For Sale Entries should have a "datePosted"',function(done) {
		var resultIsNotNull = true;
		for(var i in response.body)
		{
			var datePosted = response.body[i].datePosted;
			if(datePosted == null || datePosted == '')
			{
				resultIsNotNull = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All For Sale Entries should have a "datePosted" that is not NULL');
		done(); 
    });
	
	step('All For Sale Entries should have a "status"',function(done) {
		var resultIsNotNull = true;
		for(var i in response.body)
		{
			var status = response.body[i].status;
			if(status == null || status == '')
			{
				resultIsNotNull = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All For Sale Entries should have a "status" that is not NULL');
		done(); 
    });
	
	step('All For Sale Entries should have a "isbn" of length 13',function(done) {
		var resultIsNotNull = true;
		var resultIsLength13 = true;
		for(var i in response.body)
		{
			var isbn = response.body[i].isbn;
			if(isbn == null || isbn == '')
			{
				resultIsNotNull = false;
				break;
			}
			else if(isbn.length != 13)
			{
				resultIsLength13 = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All For Sale Entries should have a "isbn" that is not NULL');
		assert.isTrue(resultIsLength13, 'All For Sale Entries should have a "isbn" of length 13');
		done(); 
    });
});

describe('Test getting list of For Sale Entries for a specified ISBN', () => {
	var response;
	step("HTTP response should be 200",function(done) {
    	chai.request(host)
    	    .get('/forSaleEntries/isbn/'+test_isbn)
    	    .set('authorization', token)
    	    .end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
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
			if(forSaleId == null || forSaleId == '')
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
	
	step('All For Sale Entries should have a "seller_InternalUserId" greater than 0',function(done) {
		var resultIsNotNull = true;
		var resultIsInteger = true;
		var resultIsGreaterThanZero = true;
		for(var i in response.body)
		{
			var seller_InternalUserId = response.body[i].seller_InternalUserId;
			if(seller_InternalUserId == null || seller_InternalUserId == '')
			{
				resultIsNotNull = false;
				break;
			}
			else if(!Number.isInteger(seller_InternalUserId))
			{
				resultIsInteger = false;
				break;
			}
			else if(seller_InternalUserId <= 0)
			{
				resultIsGreaterThanZero = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All For Sale Entries should have a "seller_InternalUserId" that is not NULL');
		assert.isTrue(resultIsInteger, 'All For Sale Entries should have a "seller_InternalUserId" that is an integer');
		assert.isTrue(resultIsGreaterThanZero, 'All For Sale Entries should have a "seller_InternalUserId" that is greater than zero');
		done(); 
    });
	
	step('All For Sale Entries should have a "datePosted"',function(done) {
		var resultIsNotNull = true;
		for(var i in response.body)
		{
			var datePosted = response.body[i].datePosted;
			if(datePosted == null || datePosted == '')
			{
				resultIsNotNull = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All For Sale Entries should have a "datePosted" that is not NULL');
		done(); 
    });
	
	step('All For Sale Entries should have a "status"',function(done) {
		var resultIsNotNull = true;
		for(var i in response.body)
		{
			var status = response.body[i].status;
			if(status == null || status == '')
			{
				resultIsNotNull = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All For Sale Entries should have a "status" that is not NULL');
		done(); 
    });
	
	step('All For Sale Entries should have a "isbn" of length 13',function(done) {
		var resultIsNotNull = true;
		var resultIsLength13 = true;
		for(var i in response.body)
		{
			var isbn = response.body[i].isbn;
			if(isbn == null || isbn == '')
			{
				resultIsNotNull = false;
				break;
			}
			else if(isbn.length != 13)
			{
				resultIsLength13 = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All For Sale Entries should have a "isbn" that is not NULL');
		assert.isTrue(resultIsLength13, 'All For Sale Entries should have a "isbn" of length 13');
		done(); 
    });
});

describe('Test getting list of possible conditions', () => {
    var response;
	step("HTTP response should be 200",function(done) {
    	chai.request(host)
    	    .get('/forSaleEntries/condition')
    	    .end((err, res) => {
				if(res.status != 200)
				{
					console.log('\tsuccess: ' + res.body.success);
					console.log('\tmsg: ' + res.body.msg);
				}
				response = res;
				response.should.have.status(200);
				done();
    	    });
    });
	
	step('Response type should be: application/json',function(done) {
    	response.type.should.eql('application/json');
		done(); 
    });
	
	step('Response body should be an array',function(done) {
		response.body.should.be.a('array');
		done(); 
    });
	
	step('Response body array should contain at least one record',function(done) {
		var numberOfRecords = Object.keys(response.body).length;
		assert.isAbove(numberOfRecords, 0);
		done(); 
    });
	
		step('All records should have a "id" of 0 or greater',function(done) {
		var resultIsNotNull = true;
		var resultIsInteger = true;
		var resultIsGreaterThanOrEqualToZero = true;
		for(var i in response.body)
		{
			var id = response.body[i].id;
			if(id == null)
			{
				resultIsNotNull = false;
				break;
			}
			else if(!Number.isInteger(id))
			{
				resultIsInteger = false;
				break;
			}
			else if(id < 0)
			{
				resultIsGreaterThanOrEqualToZero = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All records should have a "id" that is not NULL');
		assert.isTrue(resultIsInteger, 'All records should have a "id" that is an integer');
		assert.isTrue(resultIsGreaterThanOrEqualToZero, 'All records should have a "id" of 0 or greater');
		done(); 
    });
	
		step('All records should have a "description"',function(done) {
		var resultIsNotNull = true;
		for(var i in response.body)
		{
			var description = response.body[i].description;
			if(description == null || description == '')
			{
				resultIsNotNull = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All records should have a "description" that is not NULL');
		done(); 
    });
});