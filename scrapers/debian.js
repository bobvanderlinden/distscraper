var request = require('../request.js');
var async = require('async');
var sugar = require('sugar');

function first(a) { return a[0]; }
module.exports = function(callback) {
	request.dom('http://www.debian.org/distrib/netinst',function(err,$) {
		var distribution = {
			name: 'Debian',
			url: 'http://www.debian.org/',
			releases: $('.downlist a').map(function(a) {
				return (/\.iso$/).exec(a.attr('href')) && {
					url: a.attr('href'),
					arch: a.text(),
					version: (/\/(\d+\.\d+\.\d+)\//).exec(a.attr('href'))[1]
				};
			}).compact()
		};
		callback(null,distribution);
	});
};
