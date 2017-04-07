var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
require('mocha-steps');

var config = require('./testConfig.json');
var host = config.host;
var validUsername = 'xxt150630';
var password = 'thisIsARandomPassword';
var invalidUsername = 'fakeUsername';

describe('Valid user', () => {
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

describe('Invalid user', () => {

  it('unexist user register failure', (done) => {
	    chai.request(host)
	    .post('/Authenticate')
	    .send({
	      username: invalidUsername,
	      password: password
	    })
	    .end((err, res) => {
	      res.should.have.status(401); 
	      done();
	    });
	  });
});


