var async = require('async');
var sugar = require('sugar');

function first(a) { return a[0]; }
module.exports = function(request,callback) {
	var distributionurl = 'http://ftp.freebsd.org/pub/FreeBSD/releases/ISO-IMAGES/';
	request.dom(distributionurl,function(err,$) {
		var versions = $('table a').map(function(a) { return (/^\d+\.\d+/).exec(a.attr('href')); }).compact().map(first);
		var distribution = {
			id: 'freebsd',
			name: 'FreeBSD',
			url: 'http://www.freebsd.org/'
		};
		async.map(versions,function(version,callback) {
			var versionurl = distributionurl+version+'/';
			request.dom(versionurl,function(err,$) {
				var releases = $('table a').map(function(a) {
					return a.attr('href');
				}).compact().filter(function(filename) {
					return (/\.img$/).test(filename);
				}).map(function(filename) {
					return {
						version: version,
						url:versionurl+filename,
						arch: /-([^-]+)-[^-]+$/.exec(filename)[1]
					};
				});
				async.map(releases,function(release,callback) {
					request.contentlength(release.url,function(err,contentlength) {
						if (err) { return callback(err); }
						release.size = contentlength;
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