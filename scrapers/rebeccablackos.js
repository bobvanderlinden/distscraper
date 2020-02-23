var async = require('async');
var sugar = require('sugar');
var URL = require('url');
var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');
const sourceforge = require('../lib/sites/sourceforge');

var project = sourceforge.project('rebeccablackos');

module.exports = {
  id: 'rebeccablackos',
  name: 'RebeccaBlackOS',
  tags: ['hybrid'],
  url: 'https://sourceforge.net/projects/rebeccablackos/',
  releases: project.files()
    .filter(entry => entry.type === 'directory')
    .take(2)
    .flatMap(entry => project.files(entry.path))
    .filter(entry => entry.type === 'file')
    .map(entry => entry.url)
    .filter(url => /\.iso$/.test(url))
    .map(url => ({
      url: url,
      arch: /amd64|i386/.exec(url)[0],
      version: /^(\d+(\.\d+)*(-\d+)?)$/g.test(url)
    }))
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, {
        size: contentLength
      }))
    )
};
