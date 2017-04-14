var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var assert = require('chai').assert;
var should = chai.should();
require('mocha-steps');

var config = require('./testConfig.json');
var host = config.host;
var token = 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Ng.Br3DB77C4acCJ7vdYG-0Lx55oCn80KR4gzV-lPYlvz4';
var test_isbn='9780133778816';


describe('GET /salePrice/thirdParty/isbn/', () => {
	var response;
	step("HTTP response should be 200",function(done) {
		chai.request(host)
    	    .get('/salePrice/thirdParty/isbn/'+test_isbn)
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
	
	step('Response body should include: "price"',function(done) {
		response.body.should.include.keys('price');
		done(); 
    });
	
	step('Response body should include: "source"',function(done) {
		response.body.should.include.keys('source');
		done(); 
    });
	
	step('Response body should include: "link"',function(done) {
		response.body.should.include.keys('link');
		done(); 
    });
});


describe('GET /salePrice/suggested/isbn/', () => {
	var response;
	step("HTTP response should be 200",function(done) {
		chai.request(host)
    	    .get('/salePrice/suggested/isbn/'+test_isbn)
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
	
	step('Response body should include: "suggestSalePrice"',function(done) {
		response.body.should.include.keys('suggestSalePrice');
		done(); 
    });
	
	step('Response body should include: "isbn"',function(done) {
		response.body.should.include.keys('isbn');
		done(); 
    });
	
	step('Response body "isbn" should be ' + test_isbn,function(done) {
		response.body.isbn.should.eql(test_isbn);
		done(); 
    });
	
	step('Response body should include: "reason"',function(done) {
		response.body.should.include.keys('reason');
		done(); 
    });
});
