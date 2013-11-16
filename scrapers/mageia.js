var async = require('async');
var sugar = require('sugar');
var URL = require('url');

function first(a) { return a[0]; }
module.exports = function(request,callback) {
	function retrieveISOs(url, cb) {
		request.dom(url, function(err,$,response) {
			if (err) { return cb(err); }
			var urls = $('pre a').map(function(a) {
				var url = a.attr('href');
				if (!url || (/^\.|^\//).test(url)) { return null; }
				return URL.resolve(response.url, a.attr('href'));
			}).compact();
			async.parallel([
				function(cb) {
					var subdirs = urls.filter(function(url) { return (/\/$/).test(url); });
					async.map(subdirs, function(subdir, cb) {
						retrieveISOs(subdir,cb);
					}, function(err,results) {
						if (err) { cb(err); }
						if (results.length > 0) { results = results.flatten(); }
						cb(null,results);
					});
				},
				function(cb) {
					var isos = urls.filter(function(url) { return (/\.iso$/).test(url); });
					cb(null, isos);
				}
			], function(err,results) {
				if (err) { return cb(err); }
				cb(null,results.flatten());
			});
		});
	}
	
	retrieveISOs('http://mirrors.kernel.org/mageia/iso/',function(err,urls) {
		if (err) { return callback(err); }
		async.map(urls,function(url,cb) {
			var match = /\/Mageia-(\d+)-(x86_64|i586|dual)-[^\/]+\.iso$/ig.exec(url);
			if (!match) { return cb(null,null); }
			request.contentlength(url,function(err,contentLength) {
				if (err) { return cb(err); }
				cb(null,{
					url: url,
					version: match[1],
					arch: match[2],
					size: contentLength
				});
			});
		},function(err,releases) {
			if (err) { return callback(err); }
			callback(null,{
				id: 'mageia',
				name: 'Mageia',
				tags: ['hybrid'],
				url: 'http://www.mageia.org/',
				releases: releases.compact()
			});
		});
	});
};

