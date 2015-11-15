var Rx =require('rx');
var request = require('../request');

module.exports ={
  dom: Rx.Observable.fromNodeCallback(request.dom.bind(request)),
  contentlength: Rx.Observable.fromNodeCallback(request.contentlength.bind(request))
};
