var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = function(_,cb) {
  filelisting.getEntries('https://nixos.org/channels/')
    .filter(entry => /^nixos-\d+\.\d+(-small)?/.test(entry.name))
    .flatMap(entry => request.dom(entry.url))
    .flatMap($ =>
      $('a')
        .map(anchor => $(anchor))
        .map(anchor => ({
          name: anchor.text(),
          href: anchor.attr('href'),
          url: URL.resolve($.response.request.uri.href, anchor.attr('href'))
        }))
    )
    .map(entry => entry.url)
    .filter(url => /\.iso$/.test(url))
    .map(url => {
      var match = /nixos(-graphical|-minimal|)-(\d+\.\d+\.\d+\.\w+)-(\w+)-linux.iso$/g.exec(url);
      return {
        url: url.replace(/^https:/, 'http:'),
        arch: match[3],
        version: match[2]
      };
    })
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, { size: contentLength }))
    )
    .toArray()
    .map(releases => ({
      id: 'nixos',
      name: 'NixOS',
      tags: ['hybrid'],
      url: 'http://nixos.org/',
      releases: releases
    }))
    .subscribeCallback(cb);
};
