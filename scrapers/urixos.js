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

module.exports ={
  name: 'URIX OS',
  tags: ['hybrid'],
  url: 'http://urix.us/',
  releases: request.json('http://urix.us/main.json')
    .flatMap(distributions => distributions)
    .filter(distribution => distribution.id === 'urixos')
    .flatMap(distribution => distribution.releases)
};
