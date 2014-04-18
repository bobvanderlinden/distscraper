var async = require('async');
var sugar = require('sugar');
var URL = require('url');

module.exports = function(request,cb) {
	var url = 'http://nixos.org/channels/';
	request.dom(url,function(err,$,response) {
		if (err) { return cb(err); }
		var folders = $('a')
			.map(function(a) { return $(a).attr('href'); })
			.filter(function(path) { return /^nixos\-/.test(path); })
			.map(function(path) { return URL.resolve(response.url,path); });
		async.concat(folders,function(url,cb) {
			request.dom(url,function(err,$,response) {
				if (err) { return cb(err); }
				var isofiles = $('a')
					.map(function(a) { return $(a).attr('href'); })
					.filter(function(filename) { return /\.iso$/.test(filename); });
				async.map(isofiles,function(filename,cb) {
					var url = URL.resolve(response.url,filename);
					var arch = /i\d86|x86_64/.exec(filename)[0];
					var version = /\d+(\.\w+)+/.exec(filename)[0];
					request.contentlength(url,function(err,size) {
						if (err) { return cb(err); }
						cb(null,{
							url: url,
							arch: arch,
							version: version,
							size: size
						});
					});
				},function(err,releases) {
					if (err) { return cb(err); }
					cb(null,releases.compact());
				});
			});
		},function(err,releases) {
			if (err) { return cb(err); }
			cb(null,{
				id: 'nixos',
				name: 'NixOS',
				url: 'http://nixos.org/',
				tags: ['hybrid'],
				releases: releases
			});
		});
	});
};
