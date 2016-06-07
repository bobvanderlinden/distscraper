var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

function log(o) {
  console.log('log', o);
  return o;
}

module.exports = function(_,cb) {
  filelisting.getEntries('https://nixos.org/releases/nixos/')
    .filter(function(entry) { return entry.type === 'directory'; })
    .filter(function(entry) { return /^\d+\.\d+(-small)?/.test(entry.name); })
    .flatMap(function(entry) {
      // Take the latest release of each version.
      return filelisting.getEntries(entry.url)
        .filter(function(entry) { return entry.type === 'directory'; })
        .filter(function(entry) { return /^nixos-(\d+\.\d+\.\d+)/.test(entry.name); })
        .takeLast(1);
    })
    .flatMap(function(entry) { return filelisting.getEntries(entry.url); })
    .map(function(entry) { return entry.url; })
    .filter(function(url) {
      return /\.iso$/.test(url);
    })
    .map(function(url) {
      var match = /nixos(-graphical|-minimal|)-(\d+\.\d+\.\d+\.\w+)-(\w+)-linux.iso$/g.exec(url);
      return {
        url: url.replace(/^https:/, 'http:'),
        arch: match[3],
        version: match[2]
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
        id: 'nixos',
        name: 'NixOS',
        tags: ['hybrid'],
        url: 'http://nixos.org/',
        releases: releases
      };
    })
    .subscribeCallback(cb);
};
