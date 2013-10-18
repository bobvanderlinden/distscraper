var async = require('async');
var sugar = require('sugar');
var URL = require('url');

module.exports = function(request,callback) {
	var url = 'http://cdimage.kali.org/';
	request.dom(url,function(err,$) {
		if (err) { return callback(err); }
		var versionUrls = $('a').map(function(a) {
			a = $(a);
			return URL.resolve(url,a.attr('href'));
		}).map(function(url) {
			if (/kali-\d+(\.\d+)*\/$/.test(url)) {
				return url;
			} else {
				return null;
			}
		}).compact();

		async.reduce(versionUrls,[],function(releases,versionUrl,cb) {
			request.dom(versionUrl,function(err,$) {
				if (err) { return cb(err); }
				async.map($('a').map(function(a) {
						a = $(a);
						return URL.resolve(versionUrl,a.attr('href'));
					}).map(function(url) {
						var match = /kali-linux-(\d+(?:\.\d+)*)-(\w+).*\.iso$/.exec(url);
						if (!match) { return null; }
						return {
							url: url,
							version: match[1],
							arch: match[2]
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
				id: 'kalilinux',
				name: 'Kali Linux',
				url: 'http://www.kali.org/',
				releases: releases
			});
		});
	});
};