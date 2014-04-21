var async = require('async');
var sugar = require('sugar');
var URL = require('url');

module.exports = function(request,cb) {
	var url = 'http://www.slax.org/en/download.php';
	request.dom(url,function(err,$,response) {
		if (err) { return cb(err); }
		var urls = $('a').toArray()
			.map(function(a) { return URL.resolve(response.url,$(a).attr('href')); })
			.filter(function(url) { return (/\.iso$/).test(url); });
		async.map(urls,function(url,cb) {
			var match = /\-(\d+(\.\d+)*)\-(\w+)/.exec(url);
			request.contentlength(url,function(err,size) {
				if (err) { return cb(err); }
				cb(null,{
					url: url,
					version: match[1],
					arch: match[3],
					size: size
				});
			});
		},function(err,releases) {
			if (err) { return cb(err); }
			cb(null,{
				id: 'slax',
				name: 'Slax',
				tags: ['nonhybrid'],
				url: 'http://www.slax.org/',
				releases: releases
			});
		});
	});
};
