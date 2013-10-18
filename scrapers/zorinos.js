var async = require('async');
var sugar = require('sugar');

module.exports = function(request,callback) {
	var distributionurl = 'http://distro.ibiblio.org/zorin/';
	request.dom(distributionurl,function(err,$) {
		var versions = $('a').map(function(a) {
			return (/^(\d+(\.\d+)*)\/$/).exec(a.attr('href'));
		}).compact().map(function(match) { return match[1]; });
		var distribution = {
			id: 'zorinos',
			name: 'Zorin OS',
			url: 'http://zorin-os.com/'
		};
		async.map(versions,function(version,callback) {
			var isosurl = distributionurl+version+'/';
			request.dom(isosurl,function(err,$) {
				var urls = $('a').map(function(a) {
					return a.attr('href');
				}).compact().filter(function(filename) {
					return (/\.iso$/).test(filename);
				}).map(function(filename) {
					return isosurl + filename;
				});
				async.map(urls,function(url,callback) {
					request.contentlength(url,function(err,contentLength) {
						if (err) { return callback(err); }
						var release = {
							version: version,
							url: url,
							size: contentLength
						};
						var archMatch = /[-\.](32|64)[-\.]/.exec(url);
						if (archMatch) { release.arch = archMatch[1]; }
						callback(null,release);
					});
				},callback);
			});
		},function(err,releases) {
			distribution.releases = releases.flatten();
			callback(null,distribution);
		});
	});
};
