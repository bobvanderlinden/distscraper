var async = require('async');
const request = require('../lib/rxrequest')
const URL = require('url');

const baseUrl = 'http://softwarebakery.com/apps/drivedroid/distros/memtest86plus'

module.exports = {
	id: 'memtest86plus',
	name: 'MemTest86+',
	tags: ['mbr'],
	url: 'http://www.memtest.org/',
	releases: request.text(`${baseUrl}/list`)
		.flatMap(text => text.split('\n'))
		.filter(fileName => fileName)
		.map(fileName => ({
			url: `${baseUrl}/${fileName}`,
			version: /\d\.\d{2}/.exec(fileName)[0]
		}))
		.flatMap(release => request.contentlength(release.url)
			.map(contentLength => Object.merge(release, {
				size: contentLength
			}))
		)
};
