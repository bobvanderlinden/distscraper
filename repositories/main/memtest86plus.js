var async = require('async');
var sugar = require('sugar');

module.exports = function(request,callback) {
	var distribution = {
		id: 'memtest86plus',
		name: 'MemTest86+',
		url: 'http://www.memtest.org/'
	};
	var baseUrl = 'http://softwarebakery.com/apps/drivedroid/distros/memtest86plus/';
	request.text(baseUrl+'list', function(err,text) {
		var releases = text.split('\n').filter(function(filename) { return filename; }).map(function(filename) {
			return {
				url: baseUrl + filename,
				version: /\d\.\d{2}/.exec(filename)[0]
			};
		});
		async.map(releases,function(release,callback) {
			request.contentlength(release.url,function(err,contentlength) {
				if (err) { return callback(err); }
				release.size = contentlength;
				callback(null,release);
			});
		},function(err,releases) {
			if (err) { return callback(err); }
			distribution.releases = releases;
			callback(null,distribution);
		});
	});
};