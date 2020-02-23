const request = require('../lib/rxrequest');
const filelisting = require('../lib/sites/filelisting');
const URL = require('url');

module.exports = {
	id: 'tinycorelinux',
	name: 'Tiny Core Linux',
	tags: ['hybrid'],
	url: 'http://distro.ibiblio.org/tinycorelinux/',
	releases: request.dom('http://distro.ibiblio.org/tinycorelinux/downloads.html')
		.flatMap($ => $('a').map(a => a.attr('href') && URL.resolve($.response.url, a.attr('href'))))
		.filter(url => url && /\/release\/$/.test(url))
		.flatMap(url => filelisting.getEntries(url))
		.filter(entry => entry.type === 'file')
		.map(entry => {
			var match = /^(?<flavor>\w+)-(?<version>\d+(?:\.\d+)*).iso$/g.exec(entry.name);
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
