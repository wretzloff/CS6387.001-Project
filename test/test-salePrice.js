var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var assert = require('chai').assert;
var should = chai.should();
require('mocha-steps');

var config = require('./testConfig.json');
var host = config.host;
var token = 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Ng.Br3DB77C4acCJ7vdYG-0Lx55oCn80KR4gzV-lPYlvz4';
var wrongtoken='JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Ng.Br3DB77C4acCJ7vdYG-0Lx55oCn80KR4gzV-lPYlvz3';
var isbn_13='9780133778816';


describe('GET /salePrice/thirdParty/isbn/', () => {
  it('should return list price', (done) => {
    chai.request(host)
    .get('/salePrice/thirdParty/isbn/'+isbn_13)
    .set('authorization', token)
    .end((err, res) => {
      should.not.exist(err);
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.should.include.keys('price','source','link');
      done();
    });
  });
});


describe('GET /salePrice/suggested/isbn/', () => {
	  it('should return suggest price', (done) => {
	    chai.request(host)
	    .get('/salePrice/suggested/isbn/'+isbn_13)
	    .set('authorization', token)
	    .end((err, res) => {
	      should.not.exist(err);
	      res.status.should.eql(200);
	      res.type.should.eql('application/json');
	      res.body.should.include.keys('suggestSalePrice','isbn','reason');
	      res.body.isbn.should.eql(isbn_13);
	      done();
	    });
	  });
	});
