var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
//var assert = require('chai').assert;
var should = chai.should();
require('mocha-steps');

var config = require('./testConfig.json');
var host = config.host;
var validUser_Username = 'xxt150630';
var validUser_InternalUserId = 6;
var validUser_Nickname = 'Xin T';
var password = 'thisIsARandomPassword';
var invalidUser_Username = 'xxt1506300';

describe('Successful authentication with valid username: ' + validUser_Username, () => {
	var response;
    step('HTTP response should be 200',function(done) {
    	chai.request(host)
			.post('/Authenticate')
			.send({
				username: validUser_Username,
				password: password
			})
			.end((err, res) => {
				if(res.status != 200)
				{
					console.log('success: ' + res.body.success);
					console.log('msg: ' + res.body.msg);
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
	
	step('Response body "userId" should be ' + validUser_Username,function(done) {
		response.body.userId.should.eql(validUser_InternalUserId);
		done(); 
    });
	
	step('Response body should include: "userNickname"',function(done) {
		response.body.should.include.keys('userNickname');
		done(); 
    });
	
	step('Response body "userNickname" should be ' + validUser_Nickname,function(done) {
		response.body.userNickname.should.eql(validUser_Nickname);
		done(); 
    });
});

describe('Unsuccessful authentication with invalid username: ' + invalidUser_Username, () => {
	var response;
	step('HTTP response should be 401',function(done) {
    	chai.request(host)
		.post('/Authenticate')
		.send({
			username: invalidUser_Username,
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
		response.body.should.include.keys('msg');
		done(); 
    });
	
	step('Response body "msg" should be "Invalid credentials."',function(done) {
		response.body.msg.should.eql('Invalid credentials.');
		done(); 
    });
	
});


