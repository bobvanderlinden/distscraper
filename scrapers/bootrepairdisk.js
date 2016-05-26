var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
var sourceforge = require('../lib/sites/sourceforge');

module.exports = function(_,cb) {
  sourceforge.getEntries('boot-repair-cd', '')
    /* "boot-repair-disk-32bit.iso" */
    .filter(function(entry) { return entry.type === 'file'; })
    .filter(function(entry) { return /\.iso$/.test(entry.path); })
    .map(function(entry) {
      var match = /^boot-repair-disk-(32bit|64bit)\.iso$/.exec(entry.path);
      if (!match) { return null; }
      var version = entry.date.replace(/[^0-9]+/,'.');
      return {
        url: entry.url.replace(/^https:/, 'http:'),
        arch: match[1],
        version: version
      };
    })
    .filter(function(entry) { return entry; })
    .flatMap(function(release) {
      return request.contentlength(release.url)
        .map(function(contentLength) {
          return Object.merge(release, {
            size: contentLength
          });
        });
    })
    .toArray()
    .map(function(releases) {
      return {
        id: 'bootrepairdisk',
        name: 'boot-repair-disk',
        tags: ['hybrid'],
        url: 'https://sourceforge.net/projects/boot-repair-cd/',
        releases: releases
      };
    })
    .subscribeCallback(cb);
};
