var async = require('async');
var sugar = require('sugar');
var URL = require('url');

function first(a) { return a[0]; }
module.exports = function(request,callback) {
	var distributionurl = 'http://198.145.20.143/gentoo/releases/';
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
			request.dom(archurl,function(err,$,response) {
				if (err) { return callback(err); }
				var versions = $('pre a').map(function(a) {
					return (/^\d+(\.\d+)*/).exec(a.attr('href'));
				}).compact().map(first);

				async.map(versions,function(version,callback) {
					var versionurl = archurl+version+'/';
					request.dom(versionurl,function(err,$,response) {
						if (err) { return callback(err); }
						var isourls = $('pre a').map(function(a) {
							return (/^.*\.iso$/).exec(a.attr('href'));
						}).compact().map(first).map(function(iso) {
							return URL.resolve(response.url,iso);
						});
						async.map(isourls,function(isourl,callback) {
							request.contentlength(isourl,function(err,contentlength) {
								if (err) { return callback(err); }
								var filename = /\/([^\/]+\.iso)$/.exec(isourl)[1];
								callback(null,{
									url: 'http://bouncer.gentoo.org/fetch/gentoo-'+version+'-livedvd/'+arch+'/'+filename,
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
			if (err) { return callback(err); }
			distribution.releases = releases.flatten();
			callback(null,distribution);
		});
	});
};

