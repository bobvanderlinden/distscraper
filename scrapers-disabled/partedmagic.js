var async = require('async');
var sugar = require('sugar');
var URL = require('url');

function first(a) { return a[0]; }
module.exports = function(request,callback) {
	var distribution = {
		id: 'partedmagic',
		name: 'Parted Magic',
		tags: ['hybrid'],
		url: 'http://partedmagic.com/'
	};
	var url = 'http://sourceforge.net/projects/partedmagic/files/Stable/';
	request.dom(url,function(err,$) {
		if (err) { return callback(err); }
		var versions = $('th[headers=files_name_h] a.name').map(function(a) {
			a = $(a);
			var version = /^Parted Magic (\d+)_(\d+)_(\d+)$/g.exec(a.text().replace(/^\s+|\s+$/g,''));
			if (!version) { return null; }
			return { url: URL.resolve(url,a.attr('href')), name: version[1]+'.'+version[2]+'.'+version[3] };
		}).compact().to(3);
		async.map(versions,function(version,callback) {
			var url = version.url;
			request.dom(url,function(err,$) {
				if (err) { return callback(err); }
				var files = $('th[headers=files_name_h] a.name').map(function(a) {
					a = $(a);
					var fileUrl = URL.resolve(url,a.attr('href'))
						.replace(/^https/,'http')
						.replace(/\/download$/,'');
					return { url: fileUrl, version: version.name };
				}).filter(function(file) {
					return /\.iso$/.test(file.url);
				}).map(function(file) {
					var match = /(i486|i686|amd64|i586)/.exec(file.url);
					file.arch = match ? match[0] : 'dual';
					return file;
				});
				async.map(files,function(file,callback) {
					request.contentlength(file.url,function(err,contentLength) {
						if (err) { return callback(err); }
						file.size = contentLength;
						callback(null,file);
					});
				},callback);
			});
		},function(err,files) {
			distribution.releases = files.flatten();
			callback(null,distribution);
		});
	});
};
