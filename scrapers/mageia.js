var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = function(_,cb) {
  filelisting.getEntries('http://cdimage.debian.org/mirror/mageia/iso/')
    /* "4.1", "5" */
    .filter(function(entry) { return entry.type === 'directory'; })
    .filter(function(entry) { return /^\d+(\.\d+)*$/.test(entry.name); })
    .flatMap(function(entry) { return filelisting.getEntries(entry.url); })
    /* "Mageia-5-x86_64-DVD", "Mageia-5-LiveDVD-KDE4-x86_64-DVD", ... */
    .filter(function(entry) { return entry.type === 'directory'; })
    .flatMap(function(entry) { return filelisting.getEntries(entry.url); })
    /* "Mageia-5-LiveDVD-KDE4-x86_64-DVD.iso" */
    .filter(function(entry) { return entry.type === 'file'; })
    .filter(function(entry) { return /\.iso$/.test(entry.url); })
    .map(function(entry) {
      var match = /^Mageia-(\d+(?:\.\d+)*)-\w+-\w+-(x86_64|i586)-.*\.iso$/.exec(entry.name);
      if (!match) { return null; }
      return {
        url: entry.url,
        arch: match[2],
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
        id: 'mageia',
        name: 'Mageia',
        tags: ['hybrid'],
        url: 'http://www.mageia.org/',
        releases: releases
      };
    })
    .subscribeCallback(cb);
};
