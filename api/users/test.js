'use strict';

// Module dependencies.
var request = require('supertest');
var api = require('../..');

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
describe('GET /api/v1/users', function() {
  it('should respond with users', function(done) {
    request(app)
    .get('/api/v1/users')
    .set('Accept', 'application/vnd.api+json')
    .end(function(err, res) {
      if (err) { return done(err); }
      Object.keys(res.body).should.eql(['tobi', 'loki', 'jane']);
      done();
    });
  });
  it('should respond with users/:id', function(done) {
    request(app)
    .get('/api/v1/users/jane')
    .set('Accept', 'application/vnd.api+json')
    .end(function(err, res) {
      if (err) { return done(err); }
      Object.keys(res.body).should.eql(['name', 'age', 'species']);
      done();
    });
  });
});
