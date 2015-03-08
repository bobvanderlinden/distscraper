var async = require('async');
var sugar = require('sugar');
var URL = require('url');

function first(a) { return a[1]; }
module.exports = function(request,cb) {
    request.dom('http://mirrors.antergos.com/iso/release/',function(err,$,response) {
        var releases = $('a')
            .map(function(a) { return (/^antergos-(\d+(?:\.\d+)*)-(i686|x86_64)\.iso$/).exec(a.attr('href')); })
            .compact()
            .map(function(match) {
                return {
                    url: URL.resolve(response.url, match[0]),
                    version: match[1],
                    arch: match[2]
                };
            })
        async.map(releases,function(release,cb) {
            request.contentlength(release.url,function(err,contentlength) {
                if (err) { return cb(err); }
                release.size = contentlength;
                return cb(null,release);
            });
        },function(err,releases) {
            if (err) { return cb(err); }
            return cb(null,{
                id: 'antergos',
                name: 'Antergos',
                tags: ['hybrid'],
                url: 'http://www.antergos.com/',
                releases: releases.flatten()
            });
        });
    });
};
