var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');

function first(a) { return a[0]; }
module.exports = function(callback) {
	request.dom('http://www.debian.org/distrib/netinst',function(err,$) {
		var distribution = {
			name: 'Debian',
			url: 'http://www.debian.org/'
		};
		var releases = $('.downlist a').map(function(a) {
			return {
				url: a.attr('href'),
				arch: a.text()
			};
		}).compact().filter(function(release) {
			return (/\.iso$/).test(release.url);
		}).map(function(release) {
			release.version = (/\/(\d+\.\d+\.\d+)\//).exec(release.url)[1];
			return release;
		});
		async.map(releases,function(release,callback) {
			request.contentlength(release.url,function(err,contentlength) {
				if (err) { return callback(err); }
				release.size = contentlength;
				callback(null,release);
			});
		},function(err,releases) {
			if (err) { return callback(err); }
			distribution.releases = releases;
			callback(null,distribution);
		});
	});
};
