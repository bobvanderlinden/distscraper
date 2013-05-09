var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');

module.exports = function(callback) {
	var distributionurl = 'http://distro.ibiblio.org/tinycorelinux/4.x/x86/release/';
	request.dom(distributionurl,function(err,$) {
		if (err) { return callback(err); }
		var releases = $('a').map(function(a) {
			return (/^\w+-(\d+(?:\.\d+)*)\.iso$/).exec(a.attr('href'));
		}).compact().map(function(match) {
			return {
				url: distributionurl+match[0],
				version: match[1],
				arch: 'x86'
			};
		});
		var distribution = {
			id: 'tinycorelinux',
			name: 'Tiny Core Linux',
			url: 'http://distro.ibiblio.org/tinycorelinux/'
		};

		async.map(releases,function(release,callback) {
			request.contentlength(release.url,function(err,contentLength) {
				if (err) { return callback(err); }
				release.size = contentLength;
				callback(null,release);
			});
		},function(err,releases) {
			if (err) { return callback(err); }
			distribution.releases = releases;
			callback(null,distribution);
		});
	});
};
