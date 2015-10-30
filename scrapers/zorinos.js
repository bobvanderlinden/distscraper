var async = require('async');
var sugar = require('sugar');
var URL = require('url');
var request = require('../request');
var Rx =require('rx');

Rx.Observable.fromNodeCallback = function(fn) {
  var observableFn = Rx.Observable.fromCallback(fn);
  return function(/*...*/) {
    return observableFn.apply(this, arguments)
      .map(function(args) {
        var err = args[0];
        if (err) {
          throw err;
        }
        return args[1];
      });
  };
};

Rx.Observable.prototype.subscribeCallback = function(cb) {
  return this.toNodeCallback(cb)();
};

Rx.Observable.prototype.toNodeCallback = function (cb) {
  var source = this;
  return function () {
    var val;
    var hasVal = false;
    source.subscribe(
        function (x) {
          if (hasVal) {
            throw new Error('Observable emitted multiple values, while one was expected.');
          }
          hasVal = true;
          val = x;
        },
        function (e) { cb(e); },
        function ()  { hasVal && cb(null, val); }
      );
  };
};

function isDirectoryUrl(url) {
  return url[url.length-1] === '/';
}

function isFileUrl(url) {
  return !isDirectoryUrl(url);
}

var requestDom = Rx.Observable.fromNodeCallback(request.dom.bind(request));
var requestContentlength = Rx.Observable.fromNodeCallback(request.contentlength.bind(request));

function getEntries(url) {
  return requestDom(url)
    .flatMap(function($) {
      return Rx.Observable.from(
        $('th[headers=files_name_h] a.name')
          .map(function(a) { return URL.resolve($.response.url, $(a).attr('href')); })
        );
    });
}

module.exports = function(request,cb) {
  getEntries('http://sourceforge.net/projects/zorin-os/files/')
    .filter(isDirectoryUrl)
    .flatMap(getEntries)
    .filter(isFileUrl)
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
      return requestContentlength(release.url)
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
