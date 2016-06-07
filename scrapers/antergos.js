var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');

module.exports = function(_,cb) {
    request.dom('https://antergos.com/download/')
        .flatMap(function($) {
            return $('h2.entry-title a')
                .map(function(a) {
                    return {
                        title: $(a).text().trim(),
                        url: $(a).attr('href')
                    };
                });
        })
        .filter(function(post) {
            return /ISO Refresh/.test(post.title);
        })
        .flatMap(function(post) {
            return request.dom(post.url);
        })
        .flatMap(function($) {
            return $('a')
                .map(function(a) { return $(a).attr('href'); });
        })
        .filter(function(url) {
            return /\.iso\.md5$/.test(url);
        })
        .distinct()
        .map(function(url) {
            return /^https?:\/\/.*\/antergos-\w+-(\d{4}.\d{2}.\d{2})-(x86_64|i686).iso/.exec(url)
        })
        .filter(function(match) {
            return match;
        })
        .map(function(match) {
            return {
                url: match[0],
                version: match[1],
                arch: match[2]
            };
        })
        .flatMap(function(release) {
            return request.contentlength(release.url)
                .filter(function(contentlength) { return contentlength; })
                .map(function(contentlength) {
                    return Object.merge(release, {
                        size: contentlength
                    });
                });
        })
        .toArray()
        .map(function(releases) {
            return {
                id: 'antergos',
                name: 'Antergos',
                tags: ['hybrid'],
                url: 'http://www.antergos.com/',
                releases: releases
            };
        })
        .subscribeCallback(cb);
};
