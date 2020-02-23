const request = require('../lib/rxrequest');
const filelisting = require('../lib/sites/filelisting');

module.exports = {
	id: 'voyagelinux',
	name: 'Voyage Linux',
	tags: ['hybrid'],
	url: 'http://linux.voyage.hk/',
	releases: filelisting.getEntries('http://alpha.voyage.hk/download/ISO/')
		.concat(filelisting.getEntries('http://alpha.voyage.hk/download/ISO/amd64/'))
		.filter(entry => entry.type === 'file')
		.map(entry => {
			var match = /^voyage-(?<version>\d+(\.\d+)*(?:-\w+)?)(?<arch>_amd64)?\.iso$/g.exec(entry.name);
			return match && {
				url: entry.url,
				arch: match.groups.arch ? 'amd64' : 'x86',
				version: match.groups.version
			};
		})
		.filter(release => release)
		.flatMap(release => request.contentlength(release.url)
			.map(contentLength => Object.merge(release, { size: contentLength }))
		)
};
