var URL = require('url');
var async = require('async');
var sugar = require('sugar');

module.exports = function(request,cb) {
	request.dom('http://dl.amnesia.boum.org/tails/stable/',function(err,$,response) {
		var versionUrls = $('pre a').map(function(anchor) {
			var url = $(anchor).attr('href');
			return /^tails-(\w+)-(\d+(\.\d+)*)/.test(url) && url;
		}).filter(function(url) {
			return url;
		}).map(function(url) {
			return URL.resolve(response.url,url);
		});
		async.map(versionUrls,function(versionUrl,cb) {
			request.dom(versionUrl,function(err,$,response) {
				if (err) { return cb(err); }
				var releases = $('pre a').map(function(anchor) {
					return /^tails-(\w+)-(\d+(\.\d+)*)\.iso$/.exec(anchor.attr('href'));
				}).filter(function(match) {
					return match !== null;
				}).map(function(match) {
					return {
						url: URL.resolve(response.url,match[0]),
						version: match[2],
						arch: match[1]
					};
				});
				async.map(releases,function(release,cb) {
					request.contentlength(release.url,function(err,contentLength) {
						if (err) { return cb(err); }
						release.size = contentLength;
						cb(null,release);
					});
				},cb);
			});
		},function(err,releases) {
			if (err) { return cb(err); }
			cb(null,{
				id: 'tails',
				name: 'Tails',
				tags: ['nonhybrid'],
				url: 'https://tails.boum.org/',
				releases: releases.flatten()
			});
		});
	});
};
