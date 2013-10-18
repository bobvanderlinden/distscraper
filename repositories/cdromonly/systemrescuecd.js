var async = require('async');
var sugar = require('sugar');
var URL = require('url');

module.exports = function(request,cb) {
	var url = 'http://sourceforge.net/projects/systemrescuecd/files/sysresccd-x86/';
	request.dom(url,function(err,$,response) {
		if (err) { return cb(err); }
		var folders = $('th[headers=files_name_h] a.name')
			.map(function(a) { return URL.resolve(response.url,$(a).attr('href')); });
		async.concat(folders,function(url,cb) {
			request.dom(url,function(err,$,response) {
				if (err) { return cb(err); }
				async.map($('th[headers=files_name_h] a.name').toArray(),function(a,cb) {
					a = $(a);
					var url = URL.resolve(response.url,a.attr('href'))
						.replace(/^https/,'http')
						.replace(/\/download$/,'');
					if (!/\.iso$/.test(url)) {
						return cb(null,null);
					}
					var arch = /x86/.exec(url)[0];
					var version = /\d+(\.\d+)+/.exec(url)[0];
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
				id: 'systemrescuecd',
				name: 'SystemRescueCD',
				url: 'http://www.sysresccd.org/',
				releases: releases
			});
		});
	});
};