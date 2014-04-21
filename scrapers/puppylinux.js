var async = require('async');
var sugar = require('sugar');
var URL = require('url');

module.exports = function(request,callback) {
	request.dom('http://distro.ibiblio.org/puppylinux/',function(err,$,response) {
		if (err) { return callback(err); }
		var versionUrls = $('a').map(function(a) {
			a = $(a);
			return URL.resolve(response.url,a.attr('href'));
		}).map(function(url) {
			if (/puppy(\-\w+)?\-(\d+(\.\d+)*)\/$/.test(url)) {
				return url;
			} else {
				return null;
			}
		}).compact();

		async.reduce(versionUrls,[],function(releases,versionUrl,cb) {
			request.dom(versionUrl,function(err,$,response) {
				if (err) { return cb(err); }
				async.map($('a').map(function(a) {
						a = $(a);
						return URL.resolve(response.url,a.attr('href'));
					}).map(function(url) {
						var match = /\w+-(\d+(?:\.\d+)*).*\.iso$/.exec(url);
						if (!match) { return null; }
						return {
							url: url,
							version: match[1]
						};
					}).compact(),
				function(release,cb) {
					request.contentlength(release.url,function(err,contentlength) {
						release.size = contentlength;
						cb(err,release);
					});
				},function(err,versionReleases) {
					if (err) { return cb(err); }
					cb(null,releases.concat(versionReleases));
				});
			});
		},function(err,releases) {
			if (err) { return callback(err); }
			callback(err,{
				id: 'puppylinux',
				name: 'Puppy Linux',
				tags: ['hybrid'],
				url: 'http://puppylinux.org/',
				releases: releases
			});
		});
	});
};
