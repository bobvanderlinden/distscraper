var async = require('async');
var sugar = require('sugar');

function first(a) { return a[0]; }
module.exports = function(request,callback) {
	var distributionurl = 'https://ftp.heanet.ie/mirrors/linuxmint.com/stable/';
	request.dom(distributionurl,function(err,$) {
		var versions = $('pre a').map(function(a) {
			return (/^\d+(\.\d+)*/).exec(a.attr('href'));
		}).compact().map(first);
		var distribution = {
			id: 'linuxmint',
			name: 'Linux Mint',
			tags: ['hybrid'],
			url: 'http://www.linuxmint.com/'
		};

		async.map(versions,function(version,callback) {
			var isosurl = distributionurl+version+'/';
			request.dom(isosurl,function(err,$) {
				if (err) { return callback(err); }
				var urls = $('pre a').map(function(a) {
					return a.attr('href');
				}).compact().filter(function(filename) {
					return (/\.iso$/).test(filename);
				}).map(function(filename) {
					return isosurl + filename;
				});
				async.map(urls,function(url,callback) {
					request.contentlength(url,function(err,contentLength) {
						if (err) { return callback(err); }
						if (!contentLength) { return callback(null,null); }
						var release = {
							version: version,
							url: url.replace(/^https:/, 'http:'),
							size: contentLength
						};
						var archMatch = /[-\.](32bit|64bit)[-\.]/.exec(release.url);
						if (archMatch) { release.arch = archMatch[1]; }

						var minorVersionMatch = /[-\.]v(\d+)[-\.]/.exec(release.url);
						if (minorVersionMatch) {
							release.version += '.' + minorVersionMatch[1];
						}

						callback(null,release);
					});
				},callback);
			});
		},function(err,releases) {
			if (err) { return callback(err); }
			distribution.releases = releases.flatten().compact();
			callback(null,distribution);
		});
	});
};

