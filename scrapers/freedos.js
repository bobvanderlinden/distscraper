var async = require('async');
var sugar = require('sugar');

module.exports = function(request,callback) {
	var distributionurl = 'http://www.ibiblio.org/pub/micro/pc-stuff/freedos/files/distributions/';
	request.dom(distributionurl,function(err,$) {
		var versions = $('a').map(function(a) {
			return (/^(\d+(\.\d+)*)\/$/).exec(a.attr('href'));
		}).compact().map(function(match) { return match[1]; });
		var distribution = {
			id: 'freedos',
			name: 'FreeDOS',
			url: 'http://www.freedos.org/'
		};
		async.map(versions,function(version,callback) {
			var isosurl = distributionurl+version+'/';
			request.dom(isosurl,function(err,$) {
				var urls = $('a').map(function(a) {
					return a.attr('href');
				}).compact().filter(function(filename) {
					return (/\.img$/).test(filename);
				}).map(function(filename) {
					return isosurl + filename;
				});
				async.map(urls,function(url,callback) {
					request.contentlength(url,function(err,contentLength) {
						if (err) { return callback(err); }
						callback(null,{
							version: version,
							url: url,
							size: contentLength
						});
					});
				},callback);
			});
		},function(err,releases) {
			distribution.releases = releases.flatten();
			callback(null,distribution);
		});
	});
};
