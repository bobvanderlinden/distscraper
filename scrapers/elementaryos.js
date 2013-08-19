var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');
var URL = require('url');

module.exports = function(callback) {
	var url = 'http://sourceforge.net/projects/elementaryos/files/stable/';
	request.dom(url,function(err,$) {
		if (err) { return callback(err); }
		var files = $('th[headers=files_name_h] a.name')
			.map(function(a) {
				a = $(a);
				return {
					url: URL.resolve(url,a.attr('href')),
					name: a.text().replace(/\s+/g,'')
				};
			}).filter(function(link) {
				return link.url && /\.iso$/.test(link.name) && /\/download$/.test(link.url);
			}).map(function(file) {
				file.arch = /i\d86|amd64/.exec(file.url)[0];
				var versionMatch = /(\d{4})(\d{2})(\d{2})/.exec(file.name);
				file.version = versionMatch[1]+'.'+versionMatch[2]+'.'+versionMatch[3];
				return file;
			});
		async.map(files,function(file,callback) {
			request.contentlength(file.url,function(err,contentLength) {
				if (err) { return callback(err); }
				file.size = contentLength;
				callback(null,file);
			});
		},function(err,releases) {
			if (err) { return callback(err); }
			callback(null,{
				id: 'elementaryos',
				name: 'elementary OS',
				url: 'http://elementaryos.org/',
				releases: releases
			});
		});
	});
};