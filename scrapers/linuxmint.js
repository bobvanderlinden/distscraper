var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = {
	id: 'linuxmint',
	name: 'Linux Mint',
	tags: ['hybrid'],
	url: 'https://www.linuxmint.com/',
	releases: filelisting.getEntries('https://linuxmint.freemirror.org/linuxmint/iso/stable/')
		.filter(entry => entry.type === 'directory')
		.filter(entry => /\d+(?:\.\d+)+/.test(entry.name))
		.flatMap(entry => filelisting.getEntries(entry.url))
		.filter(entry => entry.type === 'file')
		.filter(entry => /\.iso$/.test(entry.name))
		.map(entry => {
			const match = /^linuxmint-(?<version>\d+(?:\.\d+)+)-(.+)-(?<arch>amd64|i386|32bit|64bit).iso$/.exec(entry.name)
			if (!match) { return; }
			const groups = match.groups
			return {
				url: entry.url,
				arch: groups.arch,
				version: groups.version,
			};
		})
		.filter(release => release)
		.flatMap(release => request.contentlength(release.url)
			.map(contentLength => Object.merge(release, {
				size: contentLength
			}))
		)
};