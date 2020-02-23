const request = require('../lib/rxrequest')
const filelisting = require('../lib/sites/filelisting')

module.exports =  {
	id: 'lubuntu',
	name: 'Lubuntu',
	tags: ['hybrid'],
	url: 'http://www.lubuntu.net/',
	releases: filelisting.getEntries('http://cdimage.ubuntu.com/lubuntu/releases/')
		.filter(entry => entry.type === 'directory')
		.filter(entry => /^\d+(\.\d+)*$/.test(entry.name))
		.flatMap(entry => filelisting.getEntries(`${entry.url}release/`))
		.filter(entry => entry.type === 'file')
		.distinct(entry => entry.url)
		.map(entry => {
			var match = /^lubuntu-(?<version>\d+(\.\d+)*)-(?<flavor>\w+)-(?<arch>\w+).iso$/g.exec(entry.name);
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
