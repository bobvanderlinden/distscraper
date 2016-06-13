var async = require('async');
var sugar = require('sugar');
var URL = require('url');
var request =require('../lib/rxrequest');
var sourceforge = require('../lib/sites/sourceforge');

var sourceforgeProject = sourceforge.project('systemrescuecd');

module.exports = {
	id: 'systemrescuecd',
	name: 'SystemRescueCD',
	tags: ['nonhybrid'],
	url: 'http://www.sysresccd.org/',
	releases: sourceforgeProject.files('sysresccd-x86')
		.filter(entry => entry.type === 'directory')
		.take(1)
		.flatMap(directory => sourceforgeProject.files(directory.path))
		.filter(entry => /\.iso$/.test(entry.name))
		.take(1)
		.map(entry => ({
			url: entry.url,
			arch: 'x86',
			version: /\d+(?:\.\d+)+/.exec(entry.url)[0]
		}))
		.flatMap(release => request.contentlength(release.url)
			.map(contentLength => Object.merge(release, {
				size: contentLength
			}))
		)
};
