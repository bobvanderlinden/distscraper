var async = require('async');
var sugar = require('sugar');
var url = require('url');

module.exports = function(request,callback) {
	var distribution = {
		id: 'riplinux',
		name: 'RIPLinuX',
		tags: ['hybrid'],
		url: 'http://www.tux.org/pub/people/kent-robotti/looplinux/rip/'
	};
	request.dom(distribution.url,function(err,$,response) {
		// Webpage not in valid HTML, so regexp the source.
		var result = /"(RIPLinuX-(\d+(?:\.\d+)*)\.iso)"/.exec(response.body);
		var release = {
			url: url.resolve(distribution.url, result[1]),
			version: result[2]
		};
		request.contentlength(release.url,function(err,contentlength) {
			if (err) { return callback(err); }
			release.size = contentlength;
			distribution.releases = [release];
			callback(null,distribution);
		});
	});
};
