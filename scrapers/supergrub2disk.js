var async = require('async');
var sugar = require('sugar');
var URL = require('url');

module.exports = function(request,cb) {
	var url = 'http://www.supergrubdisk.org/category/supergrub2diskdownload/';
	request.dom(url,function(err,$,response) {
		if (err) { return cb(err); }
		var urls = $('a')
			.map(function(a) { return $(a).attr('href'); })
			.filter(function(url) { return /super_grub2_disk_.*\.iso$/.test(url); })
			.map(function(url) { return URL.resolve(response.url,url); });
		async.map(urls,function(url,cb) {
			var version = /_(\d+(\.\w+)+(-\w+)?)\.iso$/.exec(url)[1];
			request.contentlength(url,function(err,size,response) {
				if(err) { return cb(err); }
				if (!response.headers['content-disposition']) {
					return cb(null,null);
				}
				cb(null,{
					url: url,
					version: version,
					size: size
				});
			});
		},function(err,releases) {
			if (err) { return cb(err); }
			cb(null,{
				id: 'supergrub2disk',
				name: 'Super Grub2 Disk',
				url: 'http://www.supergrubdisk.org/',
				tags: ['hybrid'],
				releases: releases.compact()
			});
		});
	});
};
