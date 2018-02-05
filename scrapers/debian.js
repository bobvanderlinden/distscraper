var async = require('async');
var sugar = require('sugar');
var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');

module.exports = function(_,cb) {
	return request.dom('http://www.debian.org/distrib/netinst')
		.flatMap($ => $('.downlist a')
			.map(a => ({
				url: a.attr('href'),
				arch: a.text()
			}))
		)
		.filter(release => (/\.iso$/).test(release.url))
		.map(release => Object.assign(release, {
			version: (/-(\d+\.\d+\.\d+)-/).exec(release.url)[1]
		}))
		.flatMap(release => request.contentlength(release.url)
			.map(contentlength => Object.assign(release, {
				size: contentlength
			}))
		)
		.toArray()
		.map(releases => ({
			id: 'debian',
			name: 'Debian',
			tags: ['hybrid'],
			url: 'https://debian.org/',
			releases: releases
		}))
		.subscribeCallback(cb)
};

