var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');



module.exports = {
  id: 'fedora',
  name: 'Fedora',
  tags: ['hybrid'],
  url: 'https://getfedora.org/',
  releases: filelisting.getEntries('http://dl.fedoraproject.org/pub/fedora/linux/releases/')
    .filter(entry => /^\d+$/.test(entry.name))
    .flatMap(entry => filelisting.getEntries(entry.url))
    .filter(entry => entry.type === 'directory' && /^(Everything|Spins|Live|Fedora)$/.test(entry.name))
    .flatMap(entry => filelisting.getEntries(entry.url))
    .filter(entry => entry.type === 'directory' && /^(i386|i686|x86_64)$/.test(entry.name))
    .flatMap(entry => filelisting.getEntries(entry.url))
    .filter(entry => entry.type === 'file' || /^(iso)$/.test(entry.name))
    .flatMap(entry => {
      if (entry.type === 'file') { return [entry] }
      else return filelisting.getEntries(entry.url)
    })
    .filter(entry => entry.type === 'file' && /\.iso$/.test(entry.name))
    .map(entry => {
      const match = /Fedora-([A-z0-9\-]+)-(i386|i686|x86_64)-(\d+)-(\d+(?:\.\d+)*).iso/.exec(entry.name)
      const flavor = match[1]
      const arch = match[2]
      const versionMajor = match[3]
      const versionMinor = match[4]
      return {
        url: entry.url,
        arch: arch,
        version: `${versionMajor}.${versionMinor}`
      }
    })
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, { size: contentLength }))
    )
};
