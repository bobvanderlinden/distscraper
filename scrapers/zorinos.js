var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');
var sourceforge = require('../lib/sites/sourceforge');

var sourceforgeProject = sourceforge.project('zorin-os');

module.exports = {
  id: 'zorinos',
  name: 'Zorin OS',
  tags: ['hybrid'],
  url: 'http://zorinos.com/',
  releases: sourceforgeProject.files()
    .filter(entry => entry.type === 'directory')
    .flatMap(entry => sourceforgeProject.files(entry.path))
    .filter(entry => entry.type === 'file')
    .map(entry => entry.url)
    .map(url => url
      .replace(/^https/, 'http')
      .replace(/\/download$/, '')
    )
    .filter(url => /\.iso$/.test(url))
    .map(url => ({
      url: url,
      arch: (/32|64/.exec(url) || ['32'])[0],
      version: /zorin\-os\-(\d+(\.\d+)*)\-/gi.exec(url)[1]
    }))
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, {
        size: contentLength
      }))
    )
};
