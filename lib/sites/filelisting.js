var assert = require('assert');
var Rx = require('../rxnode');
var request = require('../rxrequest');
var path = require('path');
var URL = require('url');

function getEntries(url) {
  assert(typeof url === 'string');
  return request.dom(url)
    .flatMap(function($) {
      return Rx.Observable.from(
        $('a')
          .map(function(a) {
            return $(a).attr('href');
          })
          .filter(function(path) {
            // Only relative urls.
            return /^[^\/\?]/.test(path);
          })
          .map(function(path) {
            return {
              name: /^(.+)\/?$/.exec(path)[0],
              url: URL.resolve(url, path),
              type: path[path.length-1] == '/' ? 'directory' : 'file'
            };
          })
        );
    });
}

module.exports = {
  getEntries: getEntries
};