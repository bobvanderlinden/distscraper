var async = require('async');
var sugar = require('sugar');
var URL = require('url');

function first(a) { return a[0]; }
function doubledigit(d) {
	var s = d.toString();
	while (s.length < 2) { s = '0' + s; }
	return s;
}
module.exports = function(request,callback) {
	var distribution = {
		id: 'rebeccablackos',
		name: 'RebeccaBlackOS',
		tags: ['hybrid'],
		url: 'http://sourceforge.net/projects/rebeccablackos/'
	};
	request.dom('http://sourceforge.net/projects/rebeccablackos/files/',function(err,$,response) {
		if (err) { return callback(err); }
		var versions = $('th[headers=files_name_h] a.name').map(function(a) {
			a = $(a);
			var text = a.text().replace(/^\s+|\s+$/,'');
			
			var dateNr = Date.parse(text.replace(/(\d+)th/,'$1'));
			if (isNaN(dateNr)) { return null; }
			var date = new Date(dateNr);

			var version = date.getFullYear() + '.' + doubledigit(date.getMonth()+1) + '.' + doubledigit(date.getDate());
			return {
				url: URL.resolve(response.url,a.attr('href')),
				name: version
			};
		})
		.compact()
		.filter(function(version) {
			return version.name > '2013.05.24';
		});
		async.map(versions,function(version,callback) {
			request.dom(version.url,function(err,$,response) {
				if (err) { return callback(err); }
				var files = $('th[headers=files_name_h] a.name').map(function(a) {
					a = $(a);
					var fileUrl = URL.resolve(response.url,a.attr('href'))
						.replace(/^https/,'http')
						.replace(/\/download$/,'');
					return { url: fileUrl, version: version.name };
				}).filter(function(file) {
					return /\.iso$/.test(file.url);
				}).map(function(file) {
					file.arch = /(i386|i486|i686|amd64)/.exec(file.url)[0];
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
