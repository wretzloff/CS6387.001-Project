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
var test_isbn='9780133778816';

describe('Get user\'s textbooks', () => {
	var response;
	step("HTTP response should be 200",function(done) {
		chai.request(host)
    	    .get('/my-books/'+validUser_InternalUserId+'/stub')
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
	
	step('Response body should be an array of classes',function(done) {
		response.body.should.be.a('array');
		done(); 
    });
	
	step('Response body array should contain at least one class',function(done) {
		var numberOfForSaleEntries = Object.keys(response.body).length;
		assert.isAbove(numberOfForSaleEntries, 0);
		done(); 
    });
	
	step('All classes should have a "classNumber"',function(done) {
		var resultIsNotNull = true;
		for(var i in response.body)
		{
			var classNumber = response.body[i].classNumber;
			if(classNumber == null || classNumber == '')
			{
				resultIsNotNull = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All classes should have a "classNumber" that is not NULL');
		done(); 
    });
	
	step('All classes should have a "className"',function(done) {
		var resultIsNotNull = true;
		for(var i in response.body)
		{
			var className = response.body[i].className;
			if(className == null || className == '')
			{
				resultIsNotNull = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All classes should have a "className" that is not NULL');
		done(); 
    });
	
	step('All classes should have a "classBooks" array',function(done) {
		var resultIsNotNull = true;
		for(var i in response.body)
		{
			var classBooks = response.body[i].classbooks;
			if(classBooks == null)
			{
				resultIsNotNull = false;
				break;
			}
		}	
		
		assert.isTrue(resultIsNotNull, 'All classes should have a "classBooks" array');
		done(); 
    });
});

describe('Get a books\'s cover', () => {
	var response;
	step("HTTP response should be 200",function(done) {
		chai.request(host)
    	    .get('/my-books/cover/isbn/'+test_isbn)
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
	
	step('Response body should include: "SmallImage"',function(done) {
		response.body.should.include.keys('SmallImage');
		done(); 
    });
	
	step('Response body should include: "SmallImage.URL"',function(done) {
		response.body.SmallImage.should.include.keys('URL');
		done(); 
    });
	
	step('Response body should include: "SmallImage.height"',function(done) {
		response.body.SmallImage.should.include.keys('height');
		done(); 
    });
	
	step('Response body should include: "SmallImage.width"',function(done) {
		response.body.SmallImage.should.include.keys('width');
		done(); 
    });
	
	step('Response body should include: "MediumImage"',function(done) {
		response.body.should.include.keys('MediumImage');
		done(); 
    });
	
	step('Response body should include: "MediumImage.URL"',function(done) {
		response.body.MediumImage.should.include.keys('URL');
		done(); 
    });
	
	step('Response body should include: "MediumImage.height"',function(done) {
		response.body.MediumImage.should.include.keys('height');
		done(); 
    });
	
	step('Response body should include: "MediumImage.width"',function(done) {
		response.body.MediumImage.should.include.keys('width');
		done(); 
    });
	
	step('Response body should include: "LargeImage"',function(done) {
		response.body.should.include.keys('LargeImage');
		done(); 
    });
	
	step('Response body should include: "LargeImage.URL"',function(done) {
		response.body.LargeImage.should.include.keys('URL');
		done(); 
    });
	
	step('Response body should include: "LargeImage.height"',function(done) {
		response.body.LargeImage.should.include.keys('height');
		done(); 
    });
	
	step('Response body should include: "LargeImage.width"',function(done) {
		response.body.LargeImage.should.include.keys('width');
		done(); 
    });
});

