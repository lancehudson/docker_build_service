var request = require('supertest');
var api = require('../..');

describe('POST /github', function() {
  it('should respond with Ping Successful', function(done) {
    var app = api();
    var data = require('./data/ping.json');

    request(app.listen())
    .post('/github')
    .set('User-Agent', 'GitHub-Hookshot/f5d5ca1')
    .set('Accept', '*/*')
    .set('Content-Type', 'application/json')
    .set('X-Github-Delivery', '349c7c00-2d12-11e5-9bd8-8e4aa7d9cb6e')
    .set('X-Github-Event', 'ping')
    .set('X-Hub-Signature', 'sha1=f416a53e3fa76c7f29ea121226eaa4ed00a5a158')
    .set('Accept-Encoding:', 'gzip')
    .send(data)
    .expect(200)
    .end(function(err, res) {
      if (err) { return done(err); }
      res.text.should.eql('Ping Successful');
      done();
    });
  });
});

describe('POST /github', function() {
  it('should respond with an error', function(done) {
    var app = api();

    request(app.listen())
    .post('/github')
    .set('User-Agent', 'GitHub-Hookshot/f5d5ca1')
    .set('Accept', '*/*')
    .set('Content-Type', 'application/json')
    .set('X-Github-Delivery', '349c7c00-2d12-11e5-9bd8-8e4aa7d9cb6e')
    .set('X-Github-Event', 'non-existent-event')
    .set('X-Hub-Signature', 'sha1=f416a53e3fa76c7f29ea121226eaa4ed00a5a158')
    .set('Accept-Encoding:', 'gzip')
    .expect(400)
    .end(function(err, res) {
      if (err) { return done(err); }
      res.body.should.eql({
        errors: [
          {
            code: 'invalid_request',
            title: 'API requires header "X-Github-Event" to be set to a supported event type.'
          }
        ]
      });
      done();
    });
  });

  it('should respond with an error', function(done) {
    var app = api();

    request(app.listen())
    .post('/github')
    .set('User-Agent', 'GitHub-Hookshot/f5d5ca1')
    .set('Accept', '*/*')
    .set('Content-Type', 'application/json')
    .set('X-Github-Delivery', '349c7c00-2d12-11e5-9bd8-8e4aa7d9cb6e')
    .set('X-Hub-Signature', 'sha1=f416a53e3fa76c7f29ea121226eaa4ed00a5a158')
    .set('Accept-Encoding:', 'gzip')
    .expect(400)
    .end(function(err, res) {
      if (err) { return done(err); }
      res.body.should.eql({
        errors: [
          {
            code: 'invalid_request',
            title: 'API requires header "X-Github-Event" to be set to a supported event type.'
          }
        ]
      });
      done();
    });
  });
});
