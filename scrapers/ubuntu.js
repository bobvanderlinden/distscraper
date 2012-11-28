var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');

function first(a) { return a[0]; }
module.exports = function(callback) {
	var distributionurl = 'http://releases.ubuntu.com/';
	request.dom(distributionurl,function(err,$) {
		var versions = $('pre a').map(function(a) { return (/^\d+\.\d+/).exec(a.attr('href')); }).compact().map(first);
		var distribution = {
			name: 'Ubuntu',
			url: 'http://www.ubuntu.com/'
		};
		async.map(versions,function(version,callback) {
			var versionurl = distributionurl+version+'/';
			request.dom(versionurl,function(err,$) {
				var releases = $('pre a').map(function(a) {
					return a.attr('href');
				}).compact().filter(function(filename) {
					return (/\.iso$/).test(filename);
				}).map(function(filename) {
					return {version: version,url:versionurl+filename};
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