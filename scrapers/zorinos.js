var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
var sourceforge = require('../lib/sites/sourceforge');

module.exports = function(_,cb) {
  var sourceforgeProject = sourceforge.project('zorin-os');
  sourceforgeProject.files()
    .filter(function(entry) { return entry.type === 'directory'; })
    .flatMap(function(entry) { return sourceforgeProject.files(entry.path); })
    .filter(function(entry) { return entry.type === 'file'; })
    .map(function(entry) { return entry.url; })
    .map(function(url) {
      return url
        .replace(/^https/,'http')
        .replace(/\/download$/, '');
    })
    .filter(function(url) {
      return /\.iso$/.test(url);
    })
    .map(function(url) {
      return {
        url: url,
        arch: (/32|64/.exec(url) || ['32'])[0],
        version: /zorin\-os\-(\d+(\.\d+)*)\-/g.exec(url)[1]
      };
    })
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
        id: 'zorinos',
        name: 'Zorin OS',
        tags: ['hybrid'],
        url: 'http://zorinos.com/',
        releases: releases
      };
    })
    .subscribeCallback(cb);
};
