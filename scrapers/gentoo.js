var async = require('async');
var sugar = require('sugar');

function first(a) { return a[0]; }
module.exports = function(request,callback) {
	var distributionurl = 'http://mirrors.kernel.org/gentoo/releases/';
	request.dom(distributionurl,function(err,$) {
		var arches = ['x86','amd64'];
		var distribution = {
			id: 'gentoo',
			name: 'Gentoo',
			url: 'http://www.gentoo.org/'
		};

		async.map(arches,function(arch,callback) {

			var archurl = distributionurl+arch+'/';
			request.dom(archurl,function(err,$) {
				var versions = $('pre a').map(function(a) {
					return (/^\d+(\.\d+)*/).exec(a.attr('href'));
				}).compact().map(first);

				async.map(versions,function(version,callback) {
					var versionurl = archurl+version+'/';
					request.dom(versionurl,function(err,$) {
						var isos = $('pre a').map(function(a) {
							return (/^.*\.iso$/).exec(a.attr('href'));
						}).compact().map(first);
						var releases = isos.map(function(iso) {
							return {
								url: 'http://bouncer.gentoo.org/fetch/gentoo-'+version+'-livedvd/'+arch+'/'+iso,
								arch: arch,
								version: version
							};
						});
						callback(null,releases);
					});
				},function(err,releases) {
					callback(err,releases.flatten());
				});
			});
		},function(err,releases) {
			distribution.releases = releases.flatten();
			callback(null,distribution);
		});
	});
};
