const request = require('../lib/rxrequest');
const filelisting = require('../lib/sites/filelisting');

module.exports = {
	id: 'tails',
	name: 'Tails',
	tags: ['nonhybrid'],
	url: 'https://tails.boum.org/',
	releases: filelisting.getEntries('https://tails.u-strasbg.fr/stable/')
		.filter(entry => entry.type === 'directory')
		.filter(entry => (/^tails-(?<arch>\w+)-(?<version>\d+(\.\d+)*)$/).test(entry.name))
		.flatMap(entry => filelisting.getEntries(entry.url))
		.filter(entry => entry.type === 'file')
		.map(entry => {
			var match = /^tails-(?<arch>\w+)-(?<version>\d+(\.\d+)*)\.iso$/g.exec(entry.name);
			return match && {
				url: entry.url,
				arch: match.groups.arch,
				version: match.groups.version
			};
		})
		.filter(release => release)
		.flatMap(release => request.contentlength(release.url)
			.map(contentLength => Object.merge(release, { size: contentLength }))
		)
};
