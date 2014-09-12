var async = require('async');
var sugar = require('sugar');
var URL = require('url');

module.exports = function(request,cb) {

    function getSourceForgeFiles(url,cb) {
        request.dom(url,function(err,$,response) {
            var folderUrls = $('.folder a.name').map(function(a) {
                return URL.resolve(response.url,$(a).attr('href'));
            });
            var fileUrls = $('.file a.name').map(function(a) {
                return URL.resolve(response.url,$(a).attr('href'))
                    .replace(/^https/,'http')
                    .replace(/\/download$/,'');
            });
            async.concat(folderUrls,getSourceForgeFiles,function(err,files) {
                if (err) { return cb(err); }
                return cb(null, fileUrls.concat(files));
            });
        });
    }

    getSourceForgeFiles('http://sourceforge.net/projects/manjaropek/files/',function(err,fileUrls) {
        if (err) { return cb(err); }
        var releases = fileUrls
            .map(function(fileUrl) {
                return /^.*\/manjaro-pekwm-(\d+(?:\.\d+)*)-(i686|x86_64).iso$/.exec(fileUrl);
            })
            .compact()
            .map(function(match) {
                return {
                    url: match[0],
                    version: match[1],
                    arch: match[2]
                };
            });
        async.map(releases,function(release,cb) {
            request.contentlength(release.url,function(err,contentlength) {
                if (err) { return cb(err); }
                release.size = contentlength;
                return cb(null,release);
            });
        },function(err,releases) {
            if (err) { return cb(err); }
            cb(null,{
                id: 'manjaropek',
                name: 'ManjaroPek',
                tags: ['hybrid'],
                url: 'http://sourceforge.net/projects/manjaropek/',
                releases: releases
            });
        });
    });
};
