var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');

function first(a) { return a[0]; }
module.exports = function(callback) {
	var distributionurl = 'http://dl.fedoraproject.org/pub/fedora/linux/releases/';
	request.dom(distributionurl,function(err,$) {
		var versions = $('pre a').map(function(a) {
			return (/^\d+/).exec(a.attr('href'));
		}).compact().map(first);
		var distribution = {
			id: 'fedora',
			name: 'Fedora',
			url: 'http://www.fedora.com/'
		};

		function requestISOs(version,isourl,callback) {
			request.dom(isourl,p(function(err,$) {
				if (err) { return callback(err); }
				distribution.releases.push.apply(distribution.releases,$('pre a').map(function(a) {
					return (/^.*\.iso$/).exec(a.attr('href'));
				}).compact().map(first).map(function(filename) {
					return {version: version,url:isourl+filename};
				}));
				callback();
			}));
		}

		async.map(versions,function(version,callback) {
			var versionurls = [
				'/Live/i686/',
				'/Live/x86_64/',
				'/Fedora/i386/iso/',
				'/Fedora/x86_64/iso/'
			].map(function(subpath){
				return distributionurl+version+subpath;
			});

			function requestISOs(versionurl,callback) {
				request.dom(versionurl,function(err,$) {
					if (err) { return callback(err); }
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
			}

			async.map(versionurls,requestISOs,function(err,isos) {
				if (err) { return callback(err); }
				callback(null,isos.flatten());
			});
		},function(err,releases) {
			if (err) { return callback(err); }
			distribution.releases = releases.flatten();
			callback(null,distribution);
		});
	});
};
