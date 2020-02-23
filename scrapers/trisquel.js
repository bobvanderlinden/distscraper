var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = {
  id: 'trisquel',
  name: 'Trisquel',
  tags: ['hybrid'],
  url: 'https://trisquel.info/',
  releases: filelisting.getEntries('https://mirror.fsf.org/trisquel-images/')
    .filter(entry => entry.type === 'file')
    .filter(entry => /\.iso$/.test(entry.url))
    .map(entry => {
      var match = /trisquel(-\w+)?_(\d+(?:\.\d+)*)_(amd64|i686).iso$/g.exec(entry.url);
      if (!match) { return; }
      return {
        url: entry.url,
        arch: entry[3],
        version: match[2]
      };
    })
    .filter(release => release)
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, { size: contentLength }))
    )
};
