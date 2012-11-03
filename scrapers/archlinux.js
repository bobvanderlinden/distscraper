var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');

function first(a) { return a[0]; }
module.exports = function(callback) {
	var distributionurl = 'http://mirrors.kernel.org/archlinux/iso/';
	request.dom(distributionurl,function(err,$) {
		var versions = $('pre a').map(function(a) {
			return (/^\d+(\.\d+)*/).exec(a.attr('href'));
		}).compact().map(first);
		var distribution = {
			name: 'Arch Linux',
			url: 'http://www.archlinux.org/'
		};

		async.map(versions,function(version,callback) {
			var isosurl = distributionurl+version+'/';
			request.dom(isosurl,function(err,$) {
				var releases = $('pre a').map(function(a) {
					return (/^.*\.iso$/).exec(a.attr('href'));
				}).compact().map(first).map(function(filename) {
					return {version:version,url:isosurl+filename};
				});
				callback(null,releases);
			});
		},function(err,releases) {
			distribution.releases = releases;
			callback(null,distribution);
		});
	});
};
