const request = require('../lib/rxrequest')
const filelisting = require('../lib/sites/filelisting')

module.exports = {
	id: 'freedos',
	name: 'FreeDOS',
	tags: ['hybrid'],
	url: 'http://www.freedos.org/',
	releases: filelisting.getEntries('http://www.ibiblio.org/pub/micro/pc-stuff/freedos/files/distributions/')
		.filter(entry => entry.type === 'directory')
		.filter(entry => (/^\d+(\.\d+)*$/).test(entry.name))
		.flatMap(directoryEntry =>
			filelisting.getEntries(directoryEntry.url)
				.filter(entry => entry.type === 'file')
				.filter(entry => /\.img$/.test(entry.name))
				.map(entry => ({
					version: directoryEntry.name,
					url: entry.url
				}))
		)
		.flatMap(release => request.contentlength(release.url)
			.map(contentLength => Object.merge(release, { size: contentLength }))
		)
};
