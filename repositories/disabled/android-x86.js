var async = require('async');
var sugar = require('sugar');

module.exports = function(request,callback) {
	var distributionurl = 'http://code.google.com/p/android-x86/downloads/list';
	request.dom(distributionurl,function(err,$) {
		var releases = $('a').map(function(a) {
			return (/^android-x86-(\d+(\.\d+)*(-RC\d+)?).*\.iso$/).exec(a.text().trim());
		}).compact().map(function(match) {
			return {
				url: 'http://android-x86.googlecode.com/files/' + match[0],
				version: match[1]
			};
		});
		var distribution = {
			id: 'android-x86',
			name: 'Android x86',
			url: 'http://www.android-x86.org/'
		};

		async.map(releases,function(release,callback) {
			request.contentlength({
				url: release.url,
				headers: { origin: 'http://code.google.com/p/android-x86/downloads/detail?name=android-x86-4.2-20121225.iso&can=2&q='}
			},function(err,contentLength) {
				if (err) { return callback(err); }
				console.log(arguments);
				release.size = contentLength;
				callback(null,release);
			});
		},function(err,releases) {
			distribution.releases = releases;
			callback(null,distribution);
		});
	});
};
