var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');

function first(a) { return a[0]; }
module.exports = function(callback) {
	var distributionurl = 'http://www.linuxmint.com/download.php';
	request.dom(distributionurl,function(err,$) {
		var distribution = {
			id: 'linuxmint',
			name: 'Linux Mint',
			url: 'http://www.linuxmint.com/'
		};
		var editions = $('.sponsor-table a')
			.map(function(a) { return (/.*edition\.php.*/).exec(a.attr('href')); })
			.compact()
			.map(first);
		async.map(editions,function(edtitionurl,callback) {
			request.dom(edtitionurl,function(err,$) {
				// Might be useful some day to get md5
				function getValue(str) {
					return $('.sponsor-table tr th:contains("' + str + '"):first')
						.next()
						.text();
				}

				var mirrors = $('.sponsor-table a').map(function(a) {
					return a.attr('href');
				}).filter(function(url) {
					return /\.iso$/.test(url);
				});

				var url = mirrors[0];
				var release = {
					version: /-(\d+(\.\d+)*)(\.|-)/.exec(url)[1],
					url: url,
					arch: /-(32bit|64bit)(\.|-)/.exec(url)[1]
				};
				request.contentlength(release.url,function(err,contentlength) {
					if (err) { return callback(err); }
					release.size = contentlength;
					callback(null,release);
				});
			});
		},function(err,releases) {
			distribution.releases = releases;
			callback(null,distribution);
		});
	});
};