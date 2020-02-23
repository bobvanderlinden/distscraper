var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
const sourceforge = require('../lib/sites/sourceforge');

const project = sourceforge.project('bbqlinux');

module.exports = {
  id: 'bbqlinux',
  name: 'BBQLinux',
  tags: ['hybrid'],
  url: 'http://bbqlinux.org/',
  releases: project.files('x86_64')
		.filter(entry => entry.type === 'file')
		.map(entry => {
			const match = /^bbqlinux-(\d+(?:\.\d+)*)-(amd64|x86_64|i386|i686)-(?:\w+).iso$/.exec(entry.name)
			if (!match) { return; }
			return {
				url: entry.url,
				arch: match[2],
				version: match[1],
			};
    })
    .filter(release => release)
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, {
        size: contentLength
      }))
    )
}
