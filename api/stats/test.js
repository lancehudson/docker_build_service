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
describe('GET /api/v1/stats', function() {
  it('should respond with stats', function(done) {
    request(app)
    .get('/api/v1/stats')
    .set('Accept', 'application/vnd.api+json')
    .expect({
      requests: 100000,
      averageDuration: 52,
      uptime: 123123132,
    })
    .end(done);
  });
});

describe('GET /api/v1/stats/:name', function() {
  it('should respond with a single stat', function(done) {
    request(app)
    .get('/api/v1/stats/requests')
    .set('Accept', 'application/vnd.api+json')
    .expect('100000', done);
  });
});
