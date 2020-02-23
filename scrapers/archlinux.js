var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = {
  id: 'archlinux',
  name: 'Arch Linux',
  tags: ['hybrid'],
  url: 'https://www.archlinux.org/',
  releases: filelisting.getEntries('https://mirror.rackspace.com/archlinux/iso/')
    .filter(entry => entry.type === 'directory')
    .filter(entry => (/^\d+(\.\d+)*/).test(entry.name))
    .flatMap(entry => filelisting.getEntries(entry.url))
    .filter(entry => entry.type === 'file')
    .filter(entry => /\.iso$/.test(entry.url))
    .map(entry => {
      var match = /archlinux-(\d{4}\.\d{2}\.\d{2})-(\w+).iso$/g.exec(entry.url);
      return {
        url: entry.url,
        arch: entry[2],
        version: match[1]
      };
    })
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, { size: contentLength }))
    )
};

