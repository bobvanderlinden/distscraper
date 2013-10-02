var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');
var URL = require('url');

module.exports = function(cb) {
	request.dom('http://peppermintos.com/',function(err,$,response) {
		if (err) { return cb(err); }
		async.map($('a').map(function(a) {
				a = $(a);
				return URL.resolve(response.url,a.attr('href'));
			}).map(function(url) {
				var match = /Peppermint-(\d+-\d+)-(\w+)\.iso$/.exec(url);
				if (!match) { return null; }
				return {
					url: url,
					version: match[1].replace('-','.'),
					arch: match[2]
				};
			}).compact(),
		function(release,cb) {
			request.contentlength(release.url,function(err,contentlength) {
				if (err) { return cb(err); }
				release.size = contentlength;
				cb(null,release);
			});
		},
		function(err,releases) {
			if (err) { return cb(err); }
			cb(null,{
				id: 'peppermint',
				name: 'Peppermint',
				url: 'http://www.peppermintos.com/',
				releases: releases
			});
		});
	});
};