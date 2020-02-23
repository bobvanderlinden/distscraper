var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = {
	id: 'ubuntu',
	name: 'Ubuntu',
	tags: ['hybrid'],
	url: 'https://ubuntu.org/',
	releases: filelisting.getEntries('http://releases.ubuntu.com/')
		.filter(entry => entry.type === 'directory')
		.filter(entry => /\d+(?:\.\d+)+/.test(entry.name))
		.flatMap(entry => filelisting.getEntries(entry.url))
		.filter(entry => entry.type === 'file')
		.distinct(entry => entry.url)
		.map(entry => {
			const match = /^ubuntu-(\d+(?:\.\d+)+)-(\w+)-(amd64|i386).iso$/.exec(entry.name)
			if (!match) { return; }
			return {
				url: entry.url,
				arch: match[3],
				version: match[1],
			};
		})
		.filter(release => release)
		.flatMap(release => request.contentlength(release.url)
			.map(contentLength => Object.merge(release, {
				size: contentLength
			}))
		)
};
