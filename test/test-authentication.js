
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
var host = "http://localhost:3000";


describe('POST /Authentication', () => {
  it('should register a new user', (done) => {
    chai.request(host)
    .post('/Authenticate')
    .send({
      username: 'xxt150630',
      password: 'thisIsARandomPassword'
    })
    .end((err, res) => {
      should.not.exist(err);
      res.redirects.length.should.eql(0);
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.should.include.keys('success', 'token');
      res.body.success.isTrue;
      done();
    });
  });
});
