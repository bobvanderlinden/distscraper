var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');
var URL = require('url');

function first(a) { return a[0]; }
module.exports = function(callback) {
	var distribution = {
		id: 'fuduntu',
		name: 'Fuduntu',
		url: 'http://manjaro.org/'
	};
	var url = 'http://sourceforge.net/projects/fuduntu/files/';
	request.dom(url,function(err,$) {
		if (err) { return callback(err); }
		var files = $('th[headers=files_name_h] a.name').map(function(a) {
			a = $(a);
			var fileUrl = URL.resolve(url,a.attr('href'))
				.replace(/^https/,'http')
				.replace(/\/download$/,'');
			return { url: fileUrl };
		}).filter(function(file) {
			return /\.iso$/.test(file.url);
		}).map(function(file) {
			file.arch = /(i686|x86_64)/.exec(file.url)[0];
			file.version = /-(\d+(.\d+)*)-/.exec(file.url)[1];
			return file;
		});
		async.map(files,function(file,callback) {
			request.contentlength(file.url,function(err,contentLength) {
				if (err) { return callback(err); }
				file.size = contentLength;
				callback(null,file);
			});
		},function(err,files) {
			distribution.releases = files;
			callback(null,distribution);
		});
	});
};