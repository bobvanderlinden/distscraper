var Rx =require('rx');
var request = require('../request');

module.exports ={
  dom: Rx.Observable.fromNodeCallback(function(options, cb) {
    request.dom(options, function(err, $) {
      cb(err, $);
    });
  }),
  contentlength: Rx.Observable.fromNodeCallback(function(options, cb) {
    request.contentlength(options, function(err, contentLength) {
      cb(err, contentLength);
    });
  })
};
