var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = function(_,cb) {
  filelisting.getEntries('http://ftp.spline.de/mirrors/siduction/iso/')
    /* "indiansummer", "paintitblack" */
    .filter(function(entry) { return entry.type === 'directory'; })
    .flatMap(function(entry) { return filelisting.getEntries(entry.url); })
    /* "cinnamon", "gnome", "kde" */
    .filter(function(entry) { return entry.type === 'directory'; })
    .flatMap(function(entry) { return filelisting.getEntries(entry.url); })
    /* "amd64_2016-01-17_10-49", "i386_2016-01-17_13-38" */
    .filter(function(entry) { return entry.type === 'directory'; })
    .filter(function(entry) { return /^(amd64|i386)_\d{4}-\d{2}-\d{2}_\d+-\d+$/.test(entry.name); })
    .flatMap(function(entry) { return filelisting.getEntries(entry.url); })
    /* "siduction-15.1.0-paintitblack-cinnamon-i386-201601171338.iso" */
    .filter(function(entry) { return entry.type === 'file'; })
    .filter(function(entry) { return /\.iso$/.test(entry.url); })
    .map(function(entry) {
      var match = /^siduction-(\d+(?:\.\d+)+)-(\w+)-(\w+)-(i386|amd64)-(\d+)\.iso$/.exec(entry.name);
      if (!match) { return null; }
      return {
        url: entry.url,
        arch: match[4],
        version: match[1]
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
        id: 'siduction',
        name: 'Siduction',
        tags: ['hybrid'],
        url: 'http://forum.siduction.org/',
        releases: releases
      };
    })
    .subscribeCallback(cb);
};
