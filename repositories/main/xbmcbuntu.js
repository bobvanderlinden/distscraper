var async = require('async');
var sugar = require('sugar');

function first(a) { return a[0]; }
module.exports = function(request,callback) {
	var distributionurl = 'http://mirrors.xbmc.org/releases/XBMCbuntu/';
	request.dom(distributionurl,function(err,$) {
		var versions = $('pre a').map(function(a) {
			return (/^\d+(\.\d+)*/).exec(a.attr('href'));
		}).compact().map(first);
		var distribution = {
			id: 'xbmcbuntu',
			name: 'XBMCbuntu',
			url: 'http://www.xbmc.org/'
		};

		var releases = $('pre a').map(function(a) {
			return a.attr('href');
		}).compact().map(function(filename) {
			return (/^xbmcbuntu-(\d+(?:\.\d+)*).*\.iso$/).exec(filename);
		}).compact().map(function(match) {
			return {
				version: match[1],
				url: distributionurl + match[0]
			};
		}).filter(function(release) {
			return release.version !== '11.0';
		});
		async.map(releases,function(release,callback) {
			request.contentlength(release.url,function(err,contentLength) {
				if (err) { return callback(err); }
				release.size = contentLength;
				callback(null,release);
			});
		},function(err,releases) {
			distribution.releases = releases;
			callback(null,distribution);
		});
	});
};
