var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');

module.exports = function(callback) {
	var distribution = {
		id: 'peppermintos',
		name: 'Peppermint OS',
		url: 'http://www.peppermintos.com/'
	};
	// Specially crafted URLs for the new hybrid images.
	// TODO: Scrape for future versions
	var files = [
		{ url: 'http://peppermintos.info/ddroid/Peppermint-3-20130304-amd64.iso',
		  arch: 'amd64',
		  version: '3' },
		{ url: 'http://peppermintos.info/ddroid/Peppermint-3-20130304-i386.iso',
		  arch: 'i386',
		  version: '3' }
	];
	async.map(files,function(file,callback) {
		request.contentlength(file.url,function(err,contentlength) {
			if (err) { return callback(err); }
			file.size = contentlength;
			callback(null,file);
		});
	},function(err,files) {
		distribution.releases = files;
		callback(null,distribution);
	});
};