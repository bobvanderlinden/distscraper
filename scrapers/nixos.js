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
  filelisting.getEntries('https://nixos.org/channels/')
    .filter(function(entry) { return /^nixos-\d+\.\d+(-small)?/.test(entry.name); })
    .flatMap(function(entry) { return request.dom(entry.url); })
    .flatMap($ =>
      $('a')
        .map(anchor => $(anchor))
        .map(anchor => ({
          name: anchor.text(),
          href: anchor.attr('href'),
          url: URL.resolve($.response.request.uri.href, anchor.attr('href'))
        }))
    )
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
