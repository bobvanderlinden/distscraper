var async = require('async');
var sugar = require('sugar');
var URL = require('url');

module.exports = function(request,cb) {
	async.parallel([
		retrieveReleases('http://alpha.voyage.hk/download/ISO/','x86'),
		retrieveReleases('http://alpha.voyage.hk/download/ISO/amd64/','amd64')
	],function(err,results) {
		cb(err,{
			id: 'voyagelinux',
			name: 'Voyage Linux',
			url: 'http://linux.voyage.hk/',
			releases: results.flatten()
		});
	})
	function retrieveReleases(url,arch) {
		return function(cb) {
			request.dom(url,handleResponse);
			function handleResponse(err,$,response) {
				var releases = $('pre a').map(function(a) {
					return {
						url: URL.resolve(response.url,a.attr('href')),
						arch: arch
					};
				}).compact().filter(function(release) {
					if ((/\.iso$/).test(release.url)) {
						var match = (/(\d+(\.\d+)+)/).exec(release.url);
						if (match) {
							release.version = match[1];
						}
						return true;
					}
					return false;
				});
				async.map(releases,function(release,cb) {
					request.contentlength(release.url,function(err,contentlength) {
						if (err) { return cb(err); }
						release.size = contentlength;
						cb(null,release);
					});
				},function(err,releases) {
					cb(err,releases);
				});
			}
		};
	}
};
