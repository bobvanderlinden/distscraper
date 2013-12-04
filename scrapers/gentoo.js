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
			tags: ['hybrid'],
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
						var isourls = $('pre a').map(function(a) {
							return (/^.*\.iso$/).exec(a.attr('href'));
						}).compact().map(first).map(function(iso) {
							return 'http://bouncer.gentoo.org/fetch/gentoo-'+version+'-livedvd/'+arch+'/'+iso;
						});
						async.map(isourls,function(isourl,callback) {
							request.contentlength(isourl,function(err,contentlength) {
								if (err) { return callback(err); }
								callback(null,{
									url: isourl,
									arch: arch,
									version: version,
									size: contentlength
								});
							});
						},callback);
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

