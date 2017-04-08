var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var assert = require('chai').assert;
var should = chai.should();
require('mocha-steps');
//var request = require('request');

var config = require('./testConfig.json');
var host = config.host;
var token = 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Ng.Br3DB77C4acCJ7vdYG-0Lx55oCn80KR4gzV-lPYlvz4';
var wrongtoken='JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Ng.Br3DB77C4acCJ7vdYG-0Lx55oCn80KR4gzV-lPYlvz3';
var isbn_13='9780133778816';
var userid=6;


describe('my-books : Users textbook info', () => {
	  it('successful use case', (done) => {
	    chai.request(host)
	    .get('/my-books/'+userid+'/stub')
	    .set('authorization', token)
	    .end((err, res) => {
	      should.not.exist(err);
	      res.should.have.status(200); 
	      res.type.should.eql('application/json');
	      res.body.should.to.be.a('array');
	      done();
	    });
	  });
	  
	  /**
	   	  it('check with wrong usrid', (done) => {
	    chai.request(host)
	    .get('/my-books/'+wronguserid+'/stub')
	    .set('authorization', token)
	    .end((err, res) => {
	      res.should.have.status(401);
	      done();
	    });
	  });
	   */
	  
	  it('with wrong token', (done) => {
		    chai.request(host)
		    .get('/my-books/'+userid+'/stub')
		    .set('authorization', wrongtoken)
		    .end((err, res) => {
		      should.exist(err);
		      res.should.have.status(401); 
		      done();
		    });
		  });

	  
	});


describe('my-books : get book cover', () => {
	  it('successful use case', (done) => {
		    chai.request(host)
		    .get('/my-books/cover/isbn/'+isbn_13)
		    .set('authorization', token)
		    .end((err, res) => {
		      should.not.exist(err);
		      res.should.have.status(200); 
		      res.type.should.eql('application/json');
		      res.body.should.be.an('object');
		      res.body.should.have.property('LargeImage');
		      res.body.should.have.property('SmallImage');
		      res.body.should.have.property('MediumImage');
		      done();
		    });
		  });
	
	
	
	  it('with wrong token', (done) => {
		    chai.request(host)
		    .get('/my-books/cover/isbn/'+isbn_13)
		    .set('authorization', wrongtoken)
		    .end((err, res) => {
		      should.exist(err);
		      res.should.have.status(401); 
		      done();
		    });
		  });
	  
	  
	
	
	});