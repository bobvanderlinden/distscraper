const request = require('../lib/rxrequest');
const filelisting = require('../lib/sites/filelisting');

module.exports = {
	id: 'freebsd',
	name: 'FreeBSD',
	tags: ['hybrid'],
	url: 'http://www.freebsd.org/',
	releases: filelisting.getEntries('http://ftp.freebsd.org/pub/FreeBSD/releases/ISO-IMAGES/')
		.filter(entry => entry.type === 'directory')
		.filter(entry => (/^\d+(\.\d+)*/).test(entry.name))
		.flatMap(entry => filelisting.getEntries(entry.url))
		.filter(entry => entry.type === 'file')
		.map(entry => {
			var match = /^FreeBSD-(?<version>\d+(\.\d+))-RELEASE-(?<arch>\w+)-memstick.img$/g.exec(entry.name);
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
