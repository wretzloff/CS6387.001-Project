var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
require('mocha-steps');

var config = require('./testConfig.json');
var host = config.host;
var validUsername = 'xxt150630';
var password = 'thisIsARandomPassword';
var invalidUsername = 'xxt1506300';

describe('Successful authentication with valid username: ' + validUsername, () => {
	var response;
    step('HTTP response should be 200',function(done) {
    	chai.request(host)
		.post('/Authenticate')
		.send({
			username: validUsername,
			password: password
		})
		.end((err, res) => {
			should.not.exist(err);
			res.should.have.status(200);
			response = res;			
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
	
	step('Response body should include: "token"',function(done) {
		response.body.should.include.keys('token');
		done(); 
    });
	
	step('Response body "token" should start with "JWT"',function(done) {
		response.body.token.startsWith("JWT");
		done(); 
    });
	
	step('Response body should include: "userId"',function(done) {
		response.body.should.include.keys('userId');
		done(); 
    });
	
	step('Response body should include: "userNickname"',function(done) {
		response.body.should.include.keys('userNickname');
		response.body.success.isTrue;
		done(); 
    });
});

describe('Unsuccessful authentication with invalid username: ' + invalidUsername, () => {
	var response;
	step('HTTP response should be 401',function(done) {
    	chai.request(host)
		.post('/Authenticate')
		.send({
			username: invalidUsername,
			password: password
		})
		.end((err, res) => {
			res.should.have.status(401); 
			response = res;			
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
	
	step('Response body "success" should be false',function(done) {
		response.body.success.isFalse;
		done(); 
    });
	
	step('Response body should include: "msg"',function(done) {
		response.body.should.include.keys('success');
		done(); 
    });
	
	step('Response body "msg" should be "Invalid credentials."',function(done) {
		response.body.msg.should.eql('Invalid credentials.');
		done(); 
    });
	
});


