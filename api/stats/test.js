'use strict';

// Module dependencies.
var request = require('supertest');
var api = require('../..');

// Tests
describe('GET /stats', function() {
  it('should respond with stats', function(done) {
    var app = api();

    request(app.listen())
    .get('/stats')
    .set('Accept', 'application/vnd.api+json')
    .expect({
      requests: 100000,
      averageDuration: 52,
      uptime: 123123132,
    })
    .end(done);
  });
});

describe('GET /stats/:name', function() {
  it('should respond with a single stat', function(done) {
    var app = api();

    request(app.listen())
    .get('/stats/requests')
    .set('Accept', 'application/vnd.api+json')
    .expect('100000', done);
  });
});
