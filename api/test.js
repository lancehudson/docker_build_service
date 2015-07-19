'use strict';

// Module dependencies.
var request = require('supertest');
var api = require('..');

// Tests
describe('GET /notfound', function() {
  it('should respond with not found', function(done) {
    var app = api();

    request(app.listen())
    .get('/notfound')
    .set('Accept', 'application/vnd.api+json')
    .expect(404, done);
  });
});

describe('GET /test', function() {
  it('should respond with an error', function(done) {
    var app = api();

    request(app.listen())
    .get('/notfound')
    .expect(400)
    .end(function(err, res) {
      if (err) { return done(err); }
      res.body.should.eql({
        errors: [
          {
            code: 'invalid_request',
            title: 'API requires header "Accept application/vnd.api+json" ' +
              'for exchanging data.',
          },
        ],
      });
      done();
    });
  });
});
