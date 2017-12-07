var async = require('async');
var sugar = require('sugar');
var URL = require('url');


var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = function (_, cb) {
  filelisting.getEntries('http://ftp.sh.cvut.cz/slax/')
    .filter(entry => entry.type === 'directory')
    .filter(entry => (/^Slax-\d+\.x$/i).test(entry.name))
    .flatMap(entry => filelisting.getEntries(entry.url))
    .filter(entry => entry.type === 'file')
    .filter(entry => /\.iso$/.test(entry.url))
    .map(entry => {
			var archMatch = /-(32bit|64bit|i386|i686|x86_64)[-\.]/g.exec(entry.url);
			var versionMatch = /-(\d+(?:\.\d+)*)[-\.]/g.exec(entry.url);
			if (!archMatch || !versionMatch) {
				return null;
			}
      return {
        url: entry.url,
        arch: archMatch[1],
        version: versionMatch[1]
      };
		})
		.filter(entry => entry)
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, { size: contentLength }))
    )
    .toArray()
    .map(releases => ({
      id: 'slax',
      name: 'Slax',
      tags: ['hybrid'],
      url: 'https://www.slax.org/',
      releases: releases
    }))
    .subscribeCallback(cb);
};
