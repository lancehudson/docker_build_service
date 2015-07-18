var debug = require('debug')('api:github');
var events = {
  ping: function *() {
    debug('ping event');
    this.body = "Ping Successful";
    this.type = "text/plain";
  },
  push: function *() {
    debug('push event');
    // TODO: Check if configured ref

    // Begin build pipeline

  }
}

exports.exec = function *() {
  // TODO: Verify Signature

  var event = this.request.header['x-github-event'];

  if(event && events[event]) {
    debug('delegating to event', event);
    yield* events[event].call(this);
  }
  else {
    debug('unsupported event', event);
     this.throw('invalid_request', 400, {
      message: {
        errors: [
          {
            code: 'invalid_request',
            title: 'API requires header "X-Github-Event" to be set to a supported event type.'
          }
        ]
      }
    });
  }
};
