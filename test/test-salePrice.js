
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
var host = "http://localhost:3000";
var isbn_13='9780672324536';

describe('GET /salePrice/thirdParty/isbn/', () => {
  it('should return list price', (done) => {
    chai.request(host)
    .get('/salePrice/thirdParty/isbn/'+isbn_13)
    .set('authorization', 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.MQ.4p-Xcp_Aqs6evX2L8AylTbb1woTuxtlgL-Wg1QMXYYk')
    .end((err, res) => {
      should.not.exist(err);
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.should.include.keys('price','source','link');
      res.body.price.should.eql('$64.99');
      done();
    });
  });
});


describe('GET /salePrice/suggested/isbn/', () => {
	  it('should return suggest price', (done) => {
	    chai.request(host)
	    .get('/salePrice/suggested/isbn/'+isbn_13)
	    .set('authorization', 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.MQ.4p-Xcp_Aqs6evX2L8AylTbb1woTuxtlgL-Wg1QMXYYk')
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