var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = function(_,cb) {
  filelisting.getEntries('http://distfiles.gentoo.org/releases/')
    /* "amd64", "x86", ... */
    .filter(function(entry) { return entry.type === 'directory'; })
    .filter(function(entry) { return /^(amd64|x86)$/.test(entry.name); })
    .flatMap(function(entry) { return filelisting.getEntries(entry.url); })
    /* "20121221", "20160514", "12.1" */
    .filter(function(entry) { return entry.type === 'directory'; })
    .filter(function(entry) { return /^\d{8}$/.test(entry.name); })
    .flatMap(function(entry) { return filelisting.getEntries(entry.url); })
    /* "livedvd-amd64-multilib-20160514.iso", "livedvd-x86-amd64-32ul-20160514.iso", ... */
    .filter(function(entry) { return entry.type === 'file'; })
    .filter(function(entry) { return /\.iso$/.test(entry.url); })
    .map(function(entry) {
      var match = /^\w+-(\w+)-\w+-\w+-(\d{8})\.iso$/.exec(entry.name);
      if (!match) { return null; }
      return {
        url: entry.url,
        arch: match[1],
        version: match[2]
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
        id: 'gentoo',
        name: 'Gentoo',
        tags: ['hybrid'],
        url: 'https://www.gentoo.org/',
        releases: releases
      };
    })
    .subscribeCallback(cb);
};
