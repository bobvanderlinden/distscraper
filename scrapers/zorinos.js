var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');

function getEntries(url) {
  return request.dom(url)
    .flatMap(function($) {
      return Rx.Observable.from(
        $('th[headers=files_name_h] a.name')
          .map(function(a) { return URL.resolve($.response.url, $(a).attr('href')); })
        );
    });
}

module.exports = function(_,cb) {
  getEntries('http://sourceforge.net/projects/zorin-os/files/')
    .filter(URL.isDirectoryUrl)
    .flatMap(getEntries)
    .filter(URL.isFileUrl)
    .map(function(url) {
      return url
        .replace(/^https/,'http')
        .replace(/\/download$/, '');
    })
    .filter(function(url) {
      return /\.iso$/.test(url);
    })
    .map(function(url) {
      return {
        url: url,
        arch: (/32|64/.exec(url) || ['32'])[0],
        version: /zorin\-os\-(\d+(\.\d+)*)\-/g.exec(url)[1]
      };
    })
    .flatMap(function(release) {
      return request.contentlength(release.url)
        .map(function(contentLength) {
          return Object.merge(release, {
            size: contentLength
          });
        });
    })
    .toArray()
    .map(function(releases) {
      return {
        id: 'zorinos',
        name: 'Zorin OS',
        tags: ['hybrid'],
        url: 'http://zorinos.com/',
        releases: releases
      };
    })
    .subscribeCallback(cb);
};
