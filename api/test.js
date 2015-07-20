'use strict';

// Module dependencies.
var request = require('supertest');
var api = require('..');

// Global
var app = false;

beforeEach(function() {
  app = api().listen();
});

afterEach(function() {
  app.close();
  app = false;
});

// Tests
describe('GET /notfound', function() {
  it('should respond with not found', function(done) {
    request(app)
    .get('/notfound')
    .expect(404, done);
  });
});

describe('GET /api/v1/test', function() {
  it('should respond with an error', function(done) {
    request(app)
    .get('/api/v1/test')
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
