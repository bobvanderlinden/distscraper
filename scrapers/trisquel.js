var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');

module.exports = function(callback) {
	var distributionurl = 'http://mirror.fsf.org/trisquel-images/';
	request.dom(distributionurl,function(err,$) {
		if (err) { return callback(err); }
		var releases = $('a').map(function(a) {
			return (/^trisquel(?:-\w+)?_(\d+(?:\.\d+)*)_(amd64|i686).iso$/).exec(a.attr('href'));
		}).compact().map(function(match) {
			return {
				url: distributionurl+match[0],
				version: match[1],
				arch: match[2]
			};
		});
		var distribution = {
			id: 'trisquel',
			name: 'Trisquel',
			url: 'http://trisquel.info/'
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
