var async = require('async');
var sugar = require('sugar');
var url = require('url');

function first(a) { return a[1]; }
module.exports = function(request,callback) {
	var distributionurl = 'http://cdimage.ubuntu.com/kubuntu/releases/';
	request.dom(distributionurl,function(err,$) {
		var versions = $('a').map(function(a) { return (/^(\d+(\.\d+)+)\/$/).exec(a.attr('href')); }).compact().map(first);
		var distribution = {
			id: 'kubuntu',
			name: 'Kubuntu',
			tags: ['hybrid'],
			url: 'http://www.kubuntu.com/'
		};
		async.map(versions,function(version,callback) {
			var versionurl = url.resolve(distributionurl,version+'/release/');
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
			if (err) { return callback(err); }
			distribution.releases = releases.flatten();
			callback(null,distribution);
		});
	});
};
