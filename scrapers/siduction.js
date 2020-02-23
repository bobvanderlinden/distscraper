var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = {
  id: 'siduction',
  name: 'Siduction',
  tags: ['hybrid'],
  url: 'http://forum.siduction.org/',
  releases: filelisting.getEntries('http://ftp.spline.de/mirrors/siduction/iso/')
    /* "indiansummer", "paintitblack" */
    .filter((entry) => { return entry.type === 'directory'; })
    .flatMap((entry) => { return filelisting.getEntries(entry.url); })
    /* "cinnamon", "gnome", "kde" */
    .filter((entry) => { return entry.type === 'directory'; })
    .flatMap((entry) => { return filelisting.getEntries(entry.url); })
    /* "amd64_2016-01-17_10-49", "i386_2016-01-17_13-38" */
    .filter((entry) => { return entry.type === 'directory'; })
    .filter((entry) => { return /^(amd64|i386)_\d{4}-\d{2}-\d{2}_\d+-\d+$/.test(entry.name); })
    .flatMap((entry) => { return filelisting.getEntries(entry.url); })
    /* "siduction-15.1.0-paintitblack-cinnamon-i386-201601171338.iso" */
    .filter((entry) => { return entry.type === 'file'; })
    .filter((entry) => { return /\.iso$/.test(entry.url); })
    .map((entry) => {
      var match = /^siduction-(\d+(?:\.\d+)+)-(\w+)-(\w+)-(i386|amd64)-(\d+)\.iso$/.exec(entry.name);
      if (!match) { return null; }
      return {
        url: entry.url,
        arch: match[4],
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
