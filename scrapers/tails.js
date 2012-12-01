var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');

module.exports = function(callback) {
	var distribution = {
		name: 'Tails',
		url: 'https://tails.boum.org/',
		releases: [{
			version: '0.15',
			arch: 'i386',
			url: 'http://216.66.74.67/images/tails-i386-0.15.iso'
		}]
	};
	async.map(distribution.releases,function(release,callback) {
		request.contentlength(release.url,function(err,contentLength) {
			if (err) { return callback(err); }
			release.size = contentLength;
			callback(null,release);
		});
	},function(err,_) {
		if (err) { return callback(err); }
		callback(null,distribution);
	});
};