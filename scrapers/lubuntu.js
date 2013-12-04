var async = require('async');
var sugar = require('sugar');
var url = require('url');

function first(a) { return a[1]; }
module.exports = function(request,callback) {
	var distributionurl = 'http://cdimage.ubuntu.com/lubuntu/releases/';
	request.dom(distributionurl,function(err,$) {
		var versions = $('a').map(function(a) { return (/^(\d+\.\d+.*)\/$/).exec(a.attr('href')); }).compact().map(first);
		var distribution = {
			id: 'lubuntu',
			name: 'Lubuntu',
			tags: ['hybrid'],
			url: 'http://www.lubuntu.net/'
		};
		async.map(versions,function(version,callback) {
			var versionurl = url.resolve(distributionurl,version+'/release/').trim();
			request.dom(versionurl,function(err,$) {
				var releases = $('a').map(function(a) {
					return a.attr('href').trim();
				}).compact().filter(function(filename) {
					return (/\.iso$/).test(filename);
				}).unique().map(function(filename) {
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
