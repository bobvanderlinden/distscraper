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

module.exports = Rx;