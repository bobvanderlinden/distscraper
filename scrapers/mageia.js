var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = {
  id: 'mageia',
  name: 'Mageia',
  tags: ['hybrid'],
  url: 'http://www.mageia.org/',
  releases: filelisting.getEntries('http://cdimage.debian.org/mirror/mageia/iso/')
    /* "4.1", "5" */
    .filter((entry) => { return entry.type === 'directory'; })
    .filter((entry) => { return /^\d+(\.\d+)*$/.test(entry.name); })
    .flatMap((entry) => { return filelisting.getEntries(entry.url); })
    /* "Mageia-5-x86_64-DVD", "Mageia-5-LiveDVD-KDE4-x86_64-DVD", ... */
    .filter((entry) => { return entry.type === 'directory'; })
    .flatMap((entry) => { return filelisting.getEntries(entry.url); })
    /* "Mageia-5-LiveDVD-KDE4-x86_64-DVD.iso" */
    .filter((entry) => { return entry.type === 'file'; })
    .filter((entry) => { return /\.iso$/.test(entry.url); })
    .distinct(entry => entry.url)
    .map((entry) => {
      var match = /^Mageia-(\d+(?:\.\d+)*)-\w+-\w+-(x86_64|i586)-.*\.iso$/.exec(entry.name);
      if (!match) { return null; }
      return {
        url: entry.url,
        arch: match[2],
        version: match[1]
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
