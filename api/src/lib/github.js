'use strict';
let crypto  = require('crypto');
let request = require('koa-request');

module.exports = function(opts) {
  return {
    login: function *login(next) {
      this.session.githubState = crypto.randomBytes(8).toString('hex');
      let u = 'https://github.com/login/oauth/authorize'
              + '?client_id=' + opts.clientID
              + (opts.scope ? '&scope=' + opts.scope : '')
              + '&redirect_uri=' + opts.callbackURI
              + '&state=' + this.session.githubState
              ;
      this.status = 302;
      this.set('location', u);
      yield next;
    },
    callback: function *callback(next) {
      if(this.query.state != this.session.githubState) {
        this.throw(500, 'Invalid OAuth State');
      }
      if(!this.query.code) {
        this.throw(500, 'Invalid OAuth Code');
      }
      let u = 'https://github.com/login/oauth/access_token'
         + '?client_id=' + opts.clientID
         + '&client_secret=' + opts.clientSecret
         + '&code=' + this.query.code
         + '&state=' + this.session.githubState
         ;

      let response = yield request({url:u, json: true});
      console.log(response.body);
      this.body = response.body;
      yield next;
    }
  };
};
