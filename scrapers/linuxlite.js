var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');
const sourceforge = require('../lib/sites/sourceforge');

module.exports = function(_,callback) {
  var project = sourceforge.project('linuxlite');
  project.files()
    .filter(entry => entry.type === 'directory')
    .flatMap(entry => project.files(entry.path))
    .filter(entry => entry.type === 'file')
    .map(entry => {
			const match = /^linux-lite-(\d+(?:\.\d+)*)-(64bit|32bit).iso$/.exec(entry.name)
			return match && {
				url: entry.url,
				version: match[1],
				arch: match[2]
			};
		})
		.filter(release => release)
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, {
        size: contentLength
      }))
    )
    .toArray()
    .map(releases => ({
      id: 'linuxlite',
      name: 'Linux Lite',
      tags: ['hybrid'],
      url: 'https://linuxliteos.com/',
      releases: releases
    }))
    .subscribeCallback(callback);
};
