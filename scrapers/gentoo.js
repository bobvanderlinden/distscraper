var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = {
  id: 'gentoo',
  name: 'Gentoo',
  tags: ['hybrid'],
  url: 'https://www.gentoo.org/',
  releases:   filelisting.getEntries('http://distfiles.gentoo.org/releases/')
    /* "amd64", "x86", ... */
    .filter((entry) => { return entry.type === 'directory'; })
    .filter((entry) => { return /^(amd64|x86)$/.test(entry.name); })
    .flatMap((entry) => { return filelisting.getEntries(entry.url); })
    /* "20121221", "20160514", "12.1" */
    .filter((entry) => { return entry.type === 'directory'; })
    .filter((entry) => { return /^\d{8}$/.test(entry.name); })
    .flatMap((entry) => { return filelisting.getEntries(entry.url); })
    /* "livedvd-amd64-multilib-20160514.iso", "livedvd-x86-amd64-32ul-20160514.iso", ... */
    .filter((entry) => { return entry.type === 'file'; })
    .filter((entry) => { return /\.iso$/.test(entry.url); })
    .map((entry) => {
      var match = /^\w+-(\w+)-\w+-\w+-(\d{8})\.iso$/.exec(entry.name);
      if (!match) { return null; }
      return {
        url: entry.url,
        arch: match[1],
        version: match[2]
      };
    })
    .filter((entry) => { return entry; })
    .flatMap((release) => {
      return request.contentlength(release.url)
        .map((contentLength) => {
          return Object.merge(release, {
            size: contentLength
          });
        });
    })
};
