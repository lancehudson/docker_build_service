'use strict';

// Module dependencies.
var request = require('supertest');
var api = require('../..');

// Tests
describe('GET /users', function() {
  it('should respond with users', function(done) {
    var app = api();

    request(app.listen())
    .get('/users')
    .set('Accept', 'application/vnd.api+json')
    .end(function(err, res) {
      if (err) { return done(err); }
      Object.keys(res.body).should.eql(['tobi', 'loki', 'jane']);
      done();
    });
  });
  it('should respond with users/:id', function(done) {
    var app = api();

    request(app.listen())
    .get('/users/jane')
    .set('Accept', 'application/vnd.api+json')
    .end(function(err, res) {
      if (err) { return done(err); }
      Object.keys(res.body).should.eql(['name', 'age', 'species']);
      done();
    });
  });
});
