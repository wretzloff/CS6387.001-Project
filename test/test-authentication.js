var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();

var config = require('./testConfig.json');
var host = config.host;

describe('Authentication', () => {
  it('should register a new user successfully', (done) => {
    chai.request(host)
    .post('/Authenticate')
    .send({
      username: 'xxt150630',
      password: 'thisIsARandomPassword'
    })
    .end((err, res) => {
      should.not.exist(err);
      res.redirects.length.should.eql(0);
      res.should.have.status(200); 
      res.type.should.eql('application/json');
      res.body.should.include.keys('success', 'token');
      res.body.success.isTrue;
      done();
    });
  });
  
  it('unexist user register failure', (done) => {
	    chai.request(host)
	    .post('/Authenticate')
	    .send({
	      username: 'nobody',
	      password: 'wrongpassword'
	    })
	    .end((err, res) => {
	      res.should.have.status(401); 
	      done();
	    });
	  });
});

/*
describe('POST /Authentication', () => {
	  it('wrong password leads to register failure', (done) => {
	    chai.request(host)
	    .post('/Authenticate')
	    .send({
	      username: 'wbr071000',
	      password: 'wrongpassword'
	    })
	    .end((err, res) => {
	      res.should.have.status(401); 
	      res.body.success.isFalse;
	      done();
	    });
	  });
	});
*/

describe('POST /Authentication', () => {
	
	});
