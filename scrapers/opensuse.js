var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = function (_, cb) {
  Rx.Observable.merge(
    filelisting.getEntries('http://download.opensuse.org/distribution/leap/'),
    filelisting.getEntries('http://download.opensuse.org/distribution/'))
    .filter(entry => /^\d+(\.\d+)*$/.test(entry.name))
    .flatMap(entry => filelisting.getEntries(entry.url))
    .filter(entry => entry.type === 'directory' && entry.name === 'iso')
    .flatMap(entry => filelisting.getEntries(entry.url))
    .filter(entry => entry.type === 'file')
    .filter(entry => /\.iso$/.test(entry.name))
    .map(entry => {
      const match = /^openSUSE(-Leap)?-(\d+(?:\.\d+)*)-(\w+)-(\w+).iso$/.exec(entry.name)
      if (!match) {
        return null
      }
      const flavor = match[1]
      const version = match[2]
      const type = match[3]
      const arch = match[4]
      return {
        url: entry.url,
        arch: arch,
        version: version
      }
    })
    .filter(release => !!release) // Remove nulls
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, { size: contentLength }))
    )
    .toArray()
    .map(releases => ({
      id: 'opensuse',
      name: 'OpenSUSE',
      tags: ['hybrid'],
      url: 'https://www.opensuse.org/',
      releases: releases
    }))
    .subscribeCallback(cb);
};

