var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');
var URL = require('url');

module.exports = function(callback) {
	var distribution = {
		id: 'kalilinux',
		name: 'Kali Linux',
		url: 'http://www.kali.org/'
	};
	var url = 'http://cdimage.kali.org/';
	request.dom(url,function(err,$) {
		if (err) { return callback(err); }
		var files = $('a').map(function(a) {
			a = $(a);
			return URL.resolve(url,a.attr('href'));
		}).map(function(url) {
			var match = /kali-linux-(\d+(?:\.\d+)*)-(\w+).*\.iso$/.exec(url);
			if (!match) { return null; }
			return {
				url: url,
				version: match[1],
				arch: match[2]
			};
		}).compact();

		async.map(files, function(file,cb) {
			request.contentlength(file.url,function(err,contentlength) {
				file.size = contentlength;
				cb(err,file);
			});
		}, function(err,files) {
			distribution.releases = files;
			callback(err,distribution);
		});
	});
};