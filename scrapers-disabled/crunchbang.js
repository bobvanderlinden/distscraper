var async = require('async');
var sugar = require('sugar');

module.exports = function(request,callback) {
	var distributionurl = 'http://crunchbang.org/download/get/';
	request.dom(distributionurl,function(err,$) {
		if (err) { return callback(err); }
		var releases = $('a').map(function(a) {
			return (/^crunchbang-(\d+)-(\d+)-(.*).iso$/).exec(a.attr('href'));
		}).compact().map(function(match) {
			return {
				url: distributionurl+match[0],
				version: match[1] + '.' + match[2],
				arch: match[3]
			};
		});
		var distribution = {
			id: 'crunchbang',
			name: 'Crunchbang',
			tags: ['hybrid'],
			url: 'http://crunchbang.org/'
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

