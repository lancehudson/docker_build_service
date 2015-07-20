'use strict';

module.exports = function *catchJsonApiErrors(next) {
  try {
    yield next;
  }
  catch (err) {
    this.status = err.status || 500;
    this.body = err.message;
    this.response.type = 'application/vnd.api+json';
  }
};
