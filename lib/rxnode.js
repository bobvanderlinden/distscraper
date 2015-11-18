var Rx =require('rx');

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

module.exports = Rx;