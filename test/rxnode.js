var assert = require('chai').assert;
var Rx = require('../lib/rxnode');

describe('rxnode', function() {
  describe('#fromNodeCallback', function() {
    it('results in single value', function(done) {
      Rx.Observable.fromNodeCallback(function(cb) {
        cb(null, 'thevalue');
      })().subscribe(function(value) {
        assert.deepEqual(value, 'thevalue');
        done();
      });
    });
    it('when callback results in error, observable also results in error', function(done) {
      Rx.Observable.fromNodeCallback(function(cb) {
        cb(new Error('This is an error'));
      })().subscribe(function(value) {
        done('Observable emitted a value');
      }, function(err) {
        assert.ok(err);
        done();
      }, function() {
        done('Observable completed without emitting any errors');
      });
    });
  });
  describe('#toNodeCallback', function() {
    it('results in callback with value', function(done) {
      Rx.Observable.from([1])
        .toNodeCallback(done)();
    });
    it('results in callback with error', function(done) {
      Rx.Observable.from([1,2]).single()
        .toNodeCallback(function(err) {
          assert.ok(err);
          done();
        })();
    });
  });
  describe('#subscribeCallback', function() {
    it('results in callback with value', function(done) {
      Rx.Observable.from([1])
        .subscribeCallback(done);
    });
    it('results in callback with error', function(done) {
      Rx.Observable.from([1,2]).single()
        .subscribeCallback(function(err) {
          assert.ok(err);
          done();
        });
    });
  });
});