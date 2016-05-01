var async = require('async');
var sugar = require('sugar');
var URL = require('url');

module.exports = function(request,cb) {
	var url = 'http://sourceforge.net/projects/evolutionlinux/files/';
	request.dom(url,function(err,$,response) {
		if (err) { return cb(err); }
		var urls = $('th[headers=files_name_h] a.name').toArray()
			.map(function(a) { return URL.resolve(response.url,$(a).attr('href'))
				.replace(/^https/,'http')
				.replace(/\/download$/,'');
			})
			.filter(function(url) { return (/\.iso$/).test(url); });
		async.map(urls,function(url,cb) {
			var version = /\-(\d+(\.\d+)*(\-\d+)?)/.exec(url)[1];
			request.contentlength(url,function(err,size) {
				if (err) { return cb(err); }
				cb(null,{
					url: url,
					version: version,
					size: size
				});
			});
		},function(err,releases) {
			if (err) { return cb(err); }
			cb(null,{
				id: 'evolution',
				name: 'Evo/Lution',
				tags: ['hybrid'],
				url: 'http://sourceforge.net/projects/evolutionlinux/',
				releases: releases
			});
		});
	});
};
