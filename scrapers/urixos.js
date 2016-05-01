var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

module.exports = function(_,cb) {
  request.json('http://urix.us/main.json')
    .map(function(distributions) {
      assert(distributions.length === 1, 'Urix OS had an invalid number of distributions');
      var distribution = distributions[0];
      assert(distribution.id === 'urixos', 'Urix OS had an invalid number of distributions');
      return distribution;
    })
    .subscribeCallback(cb);
};
