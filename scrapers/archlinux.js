var async = require('async');
var sugar = require('sugar');

function first(a) { return a[0]; }
module.exports = function(request,callback) {
	var distributionurl = 'http://198.145.20.143/archlinux/iso/';
	request.dom(distributionurl,function(err,$) {
		var versions = $('pre a').map(function(a) {
			return (/^\d+(\.\d+)*/).exec(a.attr('href'));
		}).compact().map(first);
		var distribution = {
			id: 'archlinux',
			name: 'Arch Linux',
			tags: ['hybrid'],
			url: 'http://www.archlinux.org/'
		};

		async.map(versions,function(version,callback) {
			var isosurl = distributionurl+version+'/';
			request.dom(isosurl,function(err,$) {
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

