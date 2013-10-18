var async = require('async');
var sugar = require('sugar');

function combinations(arrays) {
	if (arrays.length === 1) {
		return arrays[0].map(function(a) { return [a]; });
	}
	var elems = arrays[0];
	var rest = arrays.slice(1);
	return elems.map(function(elem) {
		return combinations(rest).map(function(x) {
			var r = x.slice(0);
			r.unshift(elem);
			return r;
		});
	}).flatten(1);
}
function arrayToArguments(fn) {
	return function(array) {
		return fn.apply(null,array);
	};
}
module.exports = function(request,callback) {
	var mainpage = 'http://grml.org/download/';
	request.dom(mainpage,function(err,$) {
		var distribution = {
			id: 'grml',
			name: 'Grml',
			url: 'http://grml.org/'
		};

		var flavours = $('#download_flavour option').map(function(option) {
			return option.attr('value');
		});
		var archs = $('#download_arch option').map(function(option) {
			return option.attr('value');
		});
		var version = $('input[name=version]').attr('value');
		var versions = [version]; // Only the latest version.

		var releases = combinations([flavours,archs,versions]).map(arrayToArguments(function(flavour,arch,version) {
			var archTranslate = {
				'amd64': 'grml64',
				'i386': 'grml32',
				'96': 'grml96'
			};
			return {
				version: version,
				arch: arch,
				url: 'http://download.grml.org/'+archTranslate[arch]+'-'+flavour+'_'+version+'.iso'
			};
		}));
		async.map(releases,function(release,callback) {
			request.contentlength(release.url,function(err,contentLength) {
				if (err) { return callback(err); }
				release.size = contentLength;
				callback(null,release);
			});
		},function(err,releases) {
			if (err) { return callback(err); }
			distribution.releases = releases;
			callback(null,distribution);
		});
	});
};
