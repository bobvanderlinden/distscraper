const request = require('../lib/rxrequest')
const filelisting = require('../lib/sites/filelisting')

module.exports = {
	id: 'kalilinux',
	name: 'Kali Linux',
	tags: ['hybrid'],
	url: 'http://www.kali.org/',
	releases: filelisting.getEntries('http://cdimage.kali.org/')
		.filter(entry => entry.type === 'directory')
		.filter(entry => (/^kali-\d+(\.\d+)*/).test(entry.name))
		.flatMap(entry => filelisting.getEntries(entry.url))
		.filter(entry => entry.type === 'file')
		.map(entry => {
			var match = /^kali-linux-(?<version>\d+(\.\d+)*\w*)-(?<flavor>\w+)-(?<arch>\w+).iso$/g.exec(entry.name);
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
