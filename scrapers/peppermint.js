const request = require('../lib/rxrequest')
const URL = require('url')

module.exports = {
	id: 'peppermint',
	name: 'Peppermint',
	tags: ['hybrid'],
	url: 'http://www.peppermintos.com/',
	releases: request.dom('http://peppermintos.com/')
		.flatMap($ => $('a').map(a => URL.resolve($.response.url,a.attr('href')||'')))
		.map(url => {
			const match = /Peppermint-(?<year>\d+)-(?<month>\d+)-(?<arch>\w+)\.iso$/.exec(url);
			return match && {
				url: url,
				version: `${match.groups.year}.${match.groups.month}`,
				arch: match.groups.arch
			};
		})
		.filter(release => release)
		.flatMap(release => request.contentlength(release.url)
			.map(contentLength => Object.merge(release, { size: contentLength }))
		)
};
