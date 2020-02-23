const request = require('../lib/rxrequest');
const filelisting = require('../lib/sites/filelisting');

module.exports = {
	id: 'puppylinux',
	name: 'Puppy Linux',
	tags: ['hybrid'],
	url: 'http://puppylinux.org/',
	releases: filelisting.getEntries('http://distro.ibiblio.org/puppylinux/puppy-bionic/')
		.filter(entry => entry.type === 'directory')
		.flatMap(entry => filelisting.getEntries(entry.url))
		.filter(entry => entry.type === 'file')
		.map(entry => {
			var match = /^bionicpup(?<arch>\w+)-(?<version>\d+(\.\d+)*)-(?<flavor>\w+).iso$/g.exec(entry.name);
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
