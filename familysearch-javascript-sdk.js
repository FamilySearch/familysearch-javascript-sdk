!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.FamilySearch=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.0.2
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function() {
        process.nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertx() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$asap(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":1}],3:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":4}],4:[function(require,module,exports){
(function() {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = name.toString();
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = value.toString();
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    var self = this
    if (headers instanceof Headers) {
      headers.forEach(function(name, values) {
        values.forEach(function(value) {
          self.append(name, value)
        })
      })

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        self.append(name, headers[name])
      })
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  // Instead of iterable for now.
  Headers.prototype.forEach = function(callback) {
    var self = this
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      callback(name, self.map[name])
    })
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else {
        throw new Error('unsupported BodyInit type')
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(url, options) {
    options = options || {}
    this.url = url

    this.credentials = options.credentials || 'omit'
    this.headers = new Headers(options.headers)
    this.method = normalizeMethod(options.method || 'GET')
    this.mode = options.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && options.body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(options.body)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this._initBody(bodyInit)
    this.type = 'default'
    this.url = null
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
  }

  Body.call(Response.prototype)

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    // TODO: Request constructor should accept input, init
    var request
    if (Request.prototype.isPrototypeOf(input) && !init) {
      request = input
    } else {
      request = new Request(input, init)
    }

    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(name, values) {
        values.forEach(function(value) {
          xhr.setRequestHeader(name, value)
        })
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})();

},{}],5:[function(require,module,exports){
var globals = require('./globals'),
    utils = require('./utils'),
    Helpers = require('./helpers'),
    Plumbing = require('./plumbing');

var instanceId = 0;    
    
/**
 * @ngdoc function
 * @name familysearch.types:constructor.FamilySearch
 *
 * @description
 * Initialize the FamilySearch object
 *
 * **Options**
 *
 * - `client_id` - the developer key you received from FamilySearch
 * - `environment` - sandbox, staging, or production
 * - `redirect_uri` - the OAuth2 redirect uri you registered with FamilySearch.  Does not need to exist,
 * but must have the same host and port as the server running your script;
 * however, it must exist for mobile safari - see the Overview section of the documentation
 * - `pending_modifications` - an array of pending modifications that should be enabled for all requests. 
 * __Warning__: When pending modifications are enabled on the client, all requests will require a preflight request.
 * See the [CORS spec](http://www.w3.org/TR/cors/#cors-api-specifiation-request) for more details.
 * - `auto_expire` - set to true if you want to the system to clear the access token when it has expired
 * (after one hour of inactivity or 24 hours, whichever comes first; should probably be false for node.js)
 * - `auto_signin` - set to true if you want the user to be prompted to sign in whenever you call an API function
 * without an access token; must be false for node.js, and may result in a blocked pop-up if the API call is
 * not in direct response to a user-initiated action; because of the blocked pop-up issue, you may want to use `expire_callback` instead
 * - `expire_callback` - pass in a function that will be called when the access token expires
 * - `save_access_token` - set to true if you want the access token to be saved and re-read in future init calls
 * (uses a session cookie, must be false for node.js) - *setting `save_access_token` along with `auto_signin` and
 * `auto_expire` is very convenient*
 * - `access_token` - pass this in if you already have an access token
 * - `debug` - set to true to turn on console logging during development
 *
 * @param {Object} opts opts
 */
var FS = module.exports = function(opts){

  var self = this;
  self.settings = utils.extend(self.settings, globals);
  self.settings.instanceId = ++instanceId;

  self.helpers = new Helpers(self);
  self.plumbing = new Plumbing(self);
  
  opts = opts || {};

  if(!opts['client_id'] && !opts['app_key']) {
    throw 'client_id must be set';
  }
  self.settings.clientId = opts['client_id'] || opts['app_key']; //app_key is deprecated

  if(!opts['environment']) {
    throw 'environment must be set';
  }
  
  self.settings.environment = opts['environment'];
  self.settings.redirectUri = opts['redirect_uri'] || opts['auth_callback']; // auth_callback is deprecated
  self.settings.autoSignin = opts['auto_signin'];
  self.settings.autoExpire = opts['auto_expire'];

  if(opts['save_access_token']) {
    self.settings.saveAccessToken = true;
    self.helpers.readAccessToken();
  }

  if(opts['access_token']) {
    self.settings.accessToken = opts['access_token'];
  }
  
  if(opts['pending_modifications'] && utils.isArray(opts['pending_modifications'])){
    self.settings.pendingModifications = opts['pending_modifications'].join(',');
  }

  self.settings.debug = opts['debug'];
  
  self.settings.collectionsPromises = {
    collections: self.plumbing.get(self.settings.collectionsUrl)
  };

  self.settings.expireCallback = opts['expire_callback'];

};
    
// These modules contain functions which extend 
// the FamilySearch prototype to provide api functionality
require('./modules/authorities');
require('./modules/authentication');
require('./modules/changeHistory');
require('./modules/discussions');
require('./modules/memories');
require('./modules/notes');
require('./modules/ordinances');
require('./modules/parentsAndChildren');
require('./modules/pedigree');
require('./modules/persons');
require('./modules/places');
require('./modules/searchAndMatch');
require('./modules/sourceBox');
require('./modules/sources');
require('./modules/spouses');
require('./modules/users');
require('./modules/utilities');

// These files contain class definitions
require('./classes/base');
require('./classes/agent');
require('./classes/attribution');
require('./classes/change');
require('./classes/childAndParents');
require('./classes/collection');
require('./classes/comment');
require('./classes/couple');
require('./classes/date');
require('./classes/discussion');
require('./classes/discussionRef');
require('./classes/fact');
require('./classes/gender');
require('./classes/memoryArtifactRef');
require('./classes/memoryPersona');
require('./classes/memoryPersonaRef');
require('./classes/memory');
require('./classes/name');
require('./classes/note');
require('./classes/person');
require('./classes/placeDescription');
require('./classes/placeReference');
require('./classes/placesSearchResult');
require('./classes/searchResult');
require('./classes/sourceDescription');
require('./classes/sourceRef');
require('./classes/textValue');
require('./classes/user');
require('./classes/vocabularyElement');
require('./classes/vocabularyList');

// Plumbing
extendFSPrototype('plumbing', 'del');
extendFSPrototype('plumbing', 'get');
extendFSPrototype('plumbing', 'getTotalProcessingTime');
extendFSPrototype('plumbing', 'getUrl');
extendFSPrototype('plumbing', 'http');
extendFSPrototype('plumbing', 'post');
extendFSPrototype('plumbing', 'put');
extendFSPrototype('plumbing', 'setTotalProcessingTime');

function extendFSPrototype(moduleName, functionName){
  FS.prototype[functionName] = function(){
    return this[moduleName][functionName].apply(this[moduleName], arguments);
  };
}
},{"./classes/agent":6,"./classes/attribution":7,"./classes/base":8,"./classes/change":9,"./classes/childAndParents":10,"./classes/collection":11,"./classes/comment":12,"./classes/couple":13,"./classes/date":14,"./classes/discussion":15,"./classes/discussionRef":16,"./classes/fact":17,"./classes/gender":18,"./classes/memory":19,"./classes/memoryArtifactRef":20,"./classes/memoryPersona":21,"./classes/memoryPersonaRef":22,"./classes/name":23,"./classes/note":24,"./classes/person":25,"./classes/placeDescription":26,"./classes/placeReference":27,"./classes/placesSearchResult":28,"./classes/searchResult":29,"./classes/sourceDescription":30,"./classes/sourceRef":31,"./classes/textValue":32,"./classes/user":33,"./classes/vocabularyElement":34,"./classes/vocabularyList":35,"./globals":36,"./helpers":37,"./modules/authentication":38,"./modules/authorities":39,"./modules/changeHistory":40,"./modules/discussions":41,"./modules/memories":42,"./modules/notes":43,"./modules/ordinances":44,"./modules/parentsAndChildren":45,"./modules/pedigree":46,"./modules/persons":47,"./modules/places":48,"./modules/searchAndMatch":49,"./modules/sourceBox":50,"./modules/sources":51,"./modules/spouses":52,"./modules/users":53,"./modules/utilities":54,"./plumbing":55,"./utils":57}],6:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name user.types:constructor.Agent
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 * @description
 *
 * An agent is returned from {@link user.functions:getAgent getAgent}.
 * Contributor Ids are agent ids, not user ids.
 */
var Agent = FS.Agent = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name user.functions:createAgent
 * @param {Object} data [Agent](https://familysearch.org/developers/docs/api/gx/Agent_json) data
 * @return {Object} {@link user.types:constructor.Agent Agent}
 * @description Create an {@link user.types:constructor.Agent Agent} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createAgent = function(data){
  return new Agent(this, data);
};

Agent.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Agent,
  
  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#getId
   * @methodOf user.types:constructor.Agent
   * @return {String} Id of the agent
   */

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#getName
   * @methodOf user.types:constructor.Agent

   * @return {String} name of the agent
   */
  getName: function() { return maybe(maybe(this.data.names)[0]).value; },

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#getAccountName
   * @methodOf user.types:constructor.Agent

   * @return {String} account / contact name of the agent
   */
  getAccountName: function() { return maybe(maybe(this.data.accounts)[0]).accountName; },


  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#getEmail
   * @methodOf user.types:constructor.Agent

   * @return {String} email of the agent
   */
  getEmail: function() {
    var email = maybe(maybe(this.data.emails)[0]).resource;
    return email ? email.replace(/^mailto:/,'') : email;
  },

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#getPhoneNumber
   * @methodOf user.types:constructor.Agent

   * @return {String} phone number of the agent
   */
  getPhoneNumber: function() {
    return maybe(maybe(this.data.phones)[0]).resource;
  },

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#getAddress
   * @methodOf user.types:constructor.Agent

   * @return {String} postal address of the agent
   */
  getAddress: function() {
    return maybe(maybe(this.data.addresses)[0]).value;
  }
});
},{"./../FamilySearch":5,"./../utils":57}],7:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name attribution
 * @description
 * Functions related to an attribution object
 */

/**
 * @ngdoc function
 * @name attribution.types:constructor.Attribution
 * @description
 *
 * Attribution
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object|string} data raw object data or change message
 */
var Attribution = FS.Attribution = function(client, data) {
  
  // Allow an attribution to be created by just passing in
  // a string that represents the change message. This is particularly
  // useful when saving changes that accept a change message because
  // all other parts of the attribution are ignored by the server therefore
  // there's no reason to try and set them.
  if(utils.isString(data)){
    data = {
      changeMessage: data
    };
  }
  
  FS.BaseClass.call(this, client, data);
  
};

/**
 * @ngdoc function
 * @name attribution.functions:createAttribution
 * @param {Object} data [Attribution](https://familysearch.org/developers/docs/api/gx/Attribution_json) data
 * @return {Object} {@link attribution.types:constructor.Attribution Attribution}
 * @description Create an {@link attribution.types:constructor.Attribution Attribution} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createAttribution = function(data){
  return new Attribution(this, data);
};

Attribution.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Attribution,
  
  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#getModifiedTimestamp
   * @methodOf attribution.types:constructor.Attribution
   * @return {number} timestamp
   */
  getModifiedTimestamp: function() { return this.data.modified; },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#getChangeMessage
   * @methodOf attribution.types:constructor.Attribution
   * @return {string} change message
   */
  getChangeMessage: function() { return this.data.changeMessage; },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#getAgentId
   * @methodOf attribution.types:constructor.Attribution

   * @return {String} id of the agent (contributor) - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentId: function() { return maybe(this.data.contributor).resourceId; },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#getAgentUrl
   * @methodOf attribution.types:constructor.Attribution

   * @return {String} URL of the agent (contributor) - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentUrl: function() { return this.client.helpers.removeAccessToken(maybe(this.data.contributor).resource); },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#getAgent
   * @methodOf attribution.types:constructor.Attribution

   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  getAgent: function() { return this.client.getAgent(this.getAgentUrl()); }
});

},{"./../FamilySearch":5,"./../utils":57}],8:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass
 * @description
 * 
 * Base class constructor which all other classes inherit from.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
FS.BaseClass = function(client, data){
  
  if(data){
    this.data = data;
  } else {
    this.data = {};
  }
  
  // Make the client accessible to class methods.
  // helpers and plumbing are just shortcuts.
  this.client = client;
  this.helpers = client.helpers;
  this.plumbing = client.plumbing;
  
  if(this.data.attribution && !(this.data.attribution instanceof FS.Attribution)){
    this.setAttribution(this.data.attribution);
  }
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#getId
 * @methodOf familysearch.types:constructor.BaseClass
 * @return {String} Id of the agent
 */
FS.BaseClass.prototype.getId = function(){
  return this.data.id;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#setId
 * @methodOf familysearch.types:constructor.BaseClass
 * @param {string} id new id
 * @return {Object} this object
 */
FS.BaseClass.prototype.setId = function(id){
  this.data.id = id;
  return this;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#getLinks
 * @methodOf familysearch.types:constructor.BaseClass
 * @return {Object} links
 */
FS.BaseClass.prototype.getLinks = function(){
  if(!this.data.links){
    // We don't create the links object in this case because it will show
    // up as an empty object during serialization. There might be a better
    // way, such as filter empty objects during serialization, but I'd rather
    // not mess with that risky behavior right now.
    return {};
  } else {
    return this.data.links;
  }
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#getLink
 * @methodOf familysearch.types:constructor.BaseClass
 * @param {string} rel link rel
 * @return {Object} link
 */
FS.BaseClass.prototype.getLink = function(rel){
  if(this.data.links && this.data.links[rel]){
    return this.data.links[rel];
  }
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#getLinkPromise
 * @methodOf familysearch.types:constructor.BaseClass
 * @return {Object} promise for the link
 */
FS.BaseClass.prototype.getLinkPromise = function(name){
  var links = this.getLinks();
  if(links[name]){
    return Promise.resolve(links[name]);
  } else {
    return Promise.reject(new Error('Missing link: ' + name));
  }
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#addLink
 * @methodOf familysearch.types:constructor.BaseClass
 * @param {string} rel link rel
 * @param {object} link link object
 * @return {Object} this object
 */
FS.BaseClass.prototype.addLink = function(rel, link){
  if(!this.data.links){
    this.data.links = {};
  }
  this.data.links[rel] = link;
  return this;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#addLinks
 * @methodOf familysearch.types:constructor.BaseClass
 * @param {object} links links object
 * @return {Object} this object
 */
FS.BaseClass.prototype.addLinks = function(links){
  var self = this;
  utils.forEach(links, function(link, rel){
    self.addLink(rel, link);
  });
  return this;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#setAttribution
 * @methodOf familysearch.types:constructor.BaseClass
 * @param {object|string} attribution Attribution object or change message string
 * @return {Object} this object
 */
FS.BaseClass.prototype.setAttribution = function(attribution){
  if(attribution){
    if(!(attribution instanceof FS.Attribution)){
      attribution = this.client.createAttribution(attribution);
    }
    this.data.attribution = attribution;
  }
  return this;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#getAttribution
 * @methodOf familysearch.types:constructor.BaseClass
 * @return {Object} Attribution
 */
FS.BaseClass.prototype.getAttribution = function(){
  return this.data.attribution;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#updateFromResponse
 * @methodOf familysearch.types:constructor.BaseClass
 * @param {response} response response object
 * @param {string} selfRel rel of the link which the location header will be added to
 * @return {Object} this object
 * @description Update the object's ID and links from the HTTP headers of the response
 */
FS.BaseClass.prototype.updateFromResponse = function(response, selfRel){
  if(response.getHeader('x-entity-id')){
    this.setId(response.getHeader('x-entity-id'));
  }
  if(response.getHeader('link')){
    this.addLinks(this.helpers.parseLinkHeaders(response.getHeader('link', true)));
  }
  if(selfRel && response.getHeader('location')){
    this.addLink(selfRel, {href: response.getHeader('location')});
  }
  return this;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#toJSON
 * @methodOf familysearch.types:constructor.BaseClass
 * @return {Object} JSON object representing the raw data. JSON.stringify() will
 * automatically call it.
 */
FS.BaseClass.prototype.toJSON = function(){
  var json = {};
  utils.forEach(this.data, function(value, name){
    json[name] = _toJSON(value);
  });
  return json;
};

function _toJSON(value){
  if(utils.isFunction(value) && value instanceof FS.BaseClass){
    return value.toJSON(); 
  } else if(utils.isArray(value)){
    var list = [];
    for(var i = 0; i < value.length; i++){
      list[i] = _toJSON(value[i]);
    }
    return list;
  } else if(value !== undefined) {
    return JSON.parse(JSON.stringify(value));
  }
}

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#toString
 * @methodOf familysearch.types:constructor.BaseClass
 * @return {string} object serialized in JSON
 */
FS.BaseClass.prototype.toString = function(){
  return JSON.stringify(this);
};

/**
 * This tells the console to use the toString method,
 * otherwise it will print lots of stuff we don't care about
 */
FS.BaseClass.prototype.inspect = function(){
  return this.toString();  
};
},{"./../FamilySearch":5,"./../utils":57}],9:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name changeHistory.types:constructor.Change
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 * @description
 *
 * Change made to a person or relationship
 */
var Change = FS.Change = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name changeHistory.functions:createChange
 * @param {Object} data change data which is an [Entry](https://familysearch.org/developers/docs/api/atom/Entry_json) with a [ChangeInfo](https://familysearch.org/developers/docs/api/fs/ChangeInfo_json) field.
 * @return {Object} {@link changeHistory.types:constructor.Change Change}
 * @description Create a {@link changeHistory.types:constructor.Change Change} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createChange = function(data){
  return new Change(this, data);
};

Change.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Change,
  
  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#getId
   * @methodOf changeHistory.types:constructor.Change
   * @return {String} Id of the change
   */

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#getTitle
   * @methodOf changeHistory.types:constructor.Change
   * @return {String} title of the change
   */
  getTitle: function() { return this.data.title; },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#updated
   * @methodOf changeHistory.types:constructor.Change
   * @return {Number} timestamp
   */
  getUpdatedTimestamp: function() { return this.data.updated; },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#getAgentName
   * @methodOf changeHistory.types:constructor.Change

   * @return {String} agent (contributor) name
   */
  getAgentName: function() { return maybe(maybe(this.data.contributors)[0]).name; },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#getChangeReason
   * @methodOf changeHistory.types:constructor.Change

   * @return {String} reason for the change
   */
  getChangeReason: function() { return maybe(maybe(this.data.changeInfo)[0]).reason; },

  // TODO check for agent id; also add getAgentId as option in getAgent (last checked 12 July 14)

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#getAgentUrl
   * @methodOf changeHistory.types:constructor.Change

   * @return {String} URL of the agent - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('agent')).href); },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#getAgent
   * @methodOf changeHistory.types:constructor.Change

   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  getAgent: function() { return this.client.getAgent(this.getAgentUrl()); },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#restore
   * @methodOf changeHistory.types:constructor.Change

   * 
   * @description
   * Restore the specified change
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Restore_Change_resource}
   *
   *
   * @return {Object} promise for the response
   */
  restore: function() {
    var self = this;
    return self.getLinkPromise('restore').then(function(link) {
      return self.client.restoreChange(link.href);
    });
  }

});
},{"./../FamilySearch":5,"./../utils":57}],10:[function(require,module,exports){
var FS = require('../FamilySearch'),
    relHelpers = require('../relationshipHelpers'),
    utils = require('../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name parentsAndChildren.types:constructor.ChildAndParents
 * @description
 *
 * Child and parents relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
 *
 * Two methods to note below are _save_ and _delete_.
 * _save_ persists the changes made to father, mother, child, and facts;
 * _delete_ removes the relationship.
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {father, mother, child, fatherFacts, motherFacts}.
 * _father_, _mother_, and _child_ are Person objects, URLs, or ids.
 * _fatherFacts_ and _motherFacts_ are arrays of Facts or objects to be passed into the Fact constructor.
 */
var ChildAndParents = FS.ChildAndParents = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.father) {
      //noinspection JSUnresolvedFunction
      this.setFather(data.father);
    }
    if (data.mother) {
      //noinspection JSUnresolvedFunction
      this.setMother(data.mother);
    }
    if (data.child) {
      //noinspection JSUnresolvedFunction
      this.setChild(data.child);
    }
    if (data.fatherFacts) {
      utils.forEach(this.data.fatherFacts, function(value, i) {
        if(!(value instanceof FS.Fact)){
          this.data.fatherFacts[i] = client.createFact(value);
        }  
      }, this);
    }
    if (data.motherFacts) {
      utils.forEach(this.data.motherFacts, function(value, i) {
        if(!(value instanceof FS.Fact)){
          this.data.motherFacts[i] = client.createFact(value);
        }  
      }, this);
    }
  }
};

/**
 * @ngdoc function
 * @name parentsAndChildren.functions:createChildAndParents
 * @param {Object} data [ChildAndParentsRelationship](https://familysearch.org/developers/docs/api/fs/ChildAndParentsRelationship_json) data
 * @return {Object} {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents}
 * @description Create a {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createChildAndParents = function(data){
  return new ChildAndParents(this, data);
};

ChildAndParents.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: ChildAndParents,
  
  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} Id of the relationship
   */
  getId: function() { return this.data.id; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getChildAndParentsUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents

   * @return {String} Url of this child-and-parents relationship
   */
  getChildAndParentsUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('relationship')).href); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getFatherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., parent-relationship type
   */
  getFatherFacts: function() { return this.data.fatherFacts || []; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getMotherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., parent-relationship type
   */
  getMotherFacts: function() { return this.data.motherFacts || []; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getFatherId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} Id of the father
   */
  getFatherId: function() { return maybe(this.data.father).resourceId; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getFatherUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} URL of the father
   */
  getFatherUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.father).resource); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getFather
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  getFather: function() { return this.client.getPerson(this.getFatherUrl()); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getMotherId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} Id of the mother
   */
  getMotherId: function() { return maybe(this.data.mother).resourceId; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getMotherUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} URL of the mother
   */
  getMotherUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.mother).resource); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getMother
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  getMother: function() { return this.client.getPerson(this.getMotherUrl()); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getChildId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} Id of the child
   */
  getChildId: function() { return maybe(this.data.child).resourceId; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getChildUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} URL of the child
   */
  getChildUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.child).resource); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getChild
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  getChild: function() { return this.client.getPerson(this.getChildUrl()); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getNotes
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Object} promise for the {@link notes.functions:getNotes getNotes} response
   */
  getNotes: function() { 
    var self = this;
    return self.getLinkPromise('notes').then(function(link){
      return self.client.getNotes(link.href);
    });
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getSourceRefs
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Object} promise for the {@link sources.functions:getSourceRefs getSourceRefs} response
   */
  getSourceRefs: function() { 
    var self = this;
    return self.getLinkPromise('source-references').then(function(link){
      return self.client.getSourceRefs(link.href);
    });
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getSources
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Object} promise for the {@link sources.functions:getSourcesQuery getSourcesQuery} response
   */
  getSources: function() { 
    var self = this;
    return self.getLinkPromise('source-descriptions').then(function(link){
      return self.client.getSourcesQuery(link.href);
    });
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getChanges
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description
   * Get change history for a child and parents relationship
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Change_History_resource FamilySearch API Docs}
   *
   *
   * @param {String} caprid id of the child and parents relationship or full URL of the child and parents relationship changes endpoint
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @return {Object} promise for the response
   */
  getChanges: function(params) { 
    var self = this;
    return self.getLinkPromise('change-history').then(function(link) {
      return self.client.getChanges(link.href, params);
    });
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#setFather
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @param {Person|string} father person or URL or id
   * @return {ChildAndParents} this relationship
   */
  setFather: function(father) {
    relHelpers.setMember.call(this, 'father', father);
    this.fatherChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#setMother
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @param {Person|string} mother person or URL or id
   * @return {ChildAndParents} this relationship
   */
  setMother: function(mother) {
    relHelpers.setMember.call(this, 'mother', mother);
    this.motherChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#setChild
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description NOTE: Once the relationship has been saved, the child can no longer be changed
   * @param {Person|string} child person or URL or id
   * @return {ChildAndParents} this relationship
   */
  setChild: function(child) {
    relHelpers.setMember.call(this, 'child', child);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#deleteFather
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description remove father from the relationship
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  deleteFather: function(changeMessage) {
    relHelpers.deleteMember.call(this, 'father', changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#deleteMother
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description remove mother from the relationship
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  deleteMother: function(changeMessage) {
    relHelpers.deleteMember.call(this, 'mother', changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#setFatherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact[]|Object[]} facts facts to set; if an array element is not a Fact, it is passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {ChildAndParents} this relationship
   */
  setFatherFacts: function(facts, changeMessage) {
    relHelpers.setFacts.call(this, 'fatherFacts', facts, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#addFatherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {ChildAndParents} this relationship
   */
  addFatherFact: function(value) {
    relHelpers.addFact.call(this, 'fatherFacts', value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#deleteFatherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  deleteFatherFact: function(value, changeMessage) {
    relHelpers.deleteFact.call(this, 'fatherFacts', value, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#setMotherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact[]|Object[]} facts facts to set; if an array element is not a Fact, it is passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {ChildAndParents} this relationship
   */
  setMotherFacts: function(facts, changeMessage) {
    relHelpers.setFacts.call(this, 'motherFacts', facts, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#addMotherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {ChildAndParents} this relationship
   */
  addMotherFact: function(value) {
    relHelpers.addFact.call(this, 'motherFacts', value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#deleteMotherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  deleteMotherFact: function(value, changeMessage) {
    relHelpers.deleteFact.call(this, 'motherFacts', value, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },
  
  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#addSource
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * 
   * @description
   * Attach a source to this child and parents relationship. This will create a source description (if
   * it doesn't already exist) and a source reference for you.
   * 
   * @param {Object} sourceDescription Data for the source description or a
   * {@link sources.types:constructor.SourceDescription SourceDescription} object.
   * @param {String=} changeMessage change message
   * @param {String[]=} tags an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
   * @return {Object} promise for the {@link sources.types:constructor.SourceRef#save SourceRef.save()} response
   */
  addSource: function(sourceDescription, changeMessage, tags){
    return this.client._createAndAttachSource(this, sourceDescription, changeMessage, tags);
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#save
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description
   * Create a new relationship if this relationship does not have an id, or update the existing relationship.
   * When a new relationship is created the Id and links will be set from the HTTP response headers.
   *
   *
   * @param {String=} changeMessage default change message to use when fact/deletion-specific changeMessage was not specified
   * @return {Object} promise that is resolved with an array of responses for all HTTP requests that were made
   */
  save: function(changeMessage) {
    var postData = this.client.createChildAndParents();
    var isChanged = false;
    var caprid = this.getId();
    var self = this;

    // send father if new or changed
    if (!caprid || this.fatherChanged) {
      postData.setFather(this.data.father);
      isChanged = true;
    }

    // send mother if new or changed
    if (!caprid || this.motherChanged) {
      postData.setMother(this.data.mother);
      isChanged = true;
    }

    // send child if new (can't change child)
    if (!caprid) {
      postData.setChild(this.data.child);
      isChanged = true;
    }

    // set global changeMessage
    if (changeMessage) {
      postData.setAttribution(changeMessage);
    }

    // send facts if new or changed
    utils.forEach(['fatherFacts', 'motherFacts'], function(prop) {
      utils.forEach(self.data[prop], function(fact) {
        if (!caprid || !fact.getId() || fact.changed) {
          relHelpers.addFact.call(postData, prop, fact);
          isChanged = true;
        }
      });
    });
    
    var promises = [];

    // post update
    if (isChanged) {
      var urlPromise = self.getChildAndParentsUrl() ? Promise.resolve(self.getChildAndParentsUrl()) :
                   self.plumbing.getCollectionUrl('FSFT', 'relationships');
      promises.push(
        urlPromise.then(function(url) {
          utils.forEach(['father', 'mother', 'child'], function(role) {
            if (postData.data[role] && !postData.data[role].resource && postData.data[role].resourceId) {
              postData.data[role].resource = postData.data[role].resourceId;
            }
          });
          return self.plumbing.post(url, { childAndParentsRelationships: [ postData ] }, {'Content-Type': 'application/x-fs-v1+json'});
        }).then(function(response){
          self.updateFromResponse(response, 'relationship');
          return response;
        })
      );
    }

    // post deleted members that haven't been re-set to something else
    utils.forEach(['father', 'mother'], function(role) {
      if (self.getId() && self.deletedMembers && self.deletedMembers.hasOwnProperty(role) && !self.data[role]) {
        var msg = self.deletedMembers[role] || changeMessage; // default to global change message
        promises.push(
          self.getLinkPromise(role + '-role').then(function(link) {
            var headers = {'Content-Type': 'application/x-fs-v1+json'};
            if (msg) {
              headers['X-Reason'] = msg;
            }
            return self.plumbing.del(link.href, headers);
          })
        );
      }
    });

    // post deleted facts
    if (caprid && self.deletedFacts) {
      utils.forEach(self.deletedFacts, function(value, key) {
        value = value || changeMessage; // default to global change message
        var headers = {'Content-Type': 'application/x-fs-v1+json'};
        if (value) {
          headers['X-Reason'] = value;
        }
        promises.push(self.plumbing.del(key, headers));
      });
    }

    // wait for all promises to be fulfilled
    return Promise.all(promises);
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#delete
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description delete this relationship - see {@link parentsAndChildren.functions:deleteChildAndParents deleteChildAndPArents}
   * @param {string} changeMessage change message
   * @return {Object} promise for response
   */
  delete: function(changeMessage) {
    return this.client.deleteChildAndParents(this.getChildAndParentsUrl(), changeMessage);
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#restore
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description restore this relationship - see {@link parentsAndChildren.functions:restoreChildAndPArents restoreChildAndPArents}
   * @return {Object} promise for the response
   */
  restore: function() {
    var self = this;
    return self.getLinkPromise('restore').then(function(link){
      return self.client.restoreChildAndParents(link.href);
    });
  }
  
});
},{"../FamilySearch":5,"../relationshipHelpers":56,"../utils":57}],11:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name sourceBox.types:constructor.Collection
 * @description
 *
 * Collection
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Folder_resource FamilySearch API Docs}
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var Collection = FS.Collection = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name sourceBox.functions:createCollection
 * @param {Object} data [Collection](https://familysearch.org/developers/docs/api/gx/Collection_json) data
 * @return {Object} {@link sourceBox.types:constructor.Collection Collection}
 * @description Create a {@link sourceBox.types:constructor.Collection Collection} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createCollection = function(data){
  return new Collection(this, data);
};

Collection.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Collection,
  
  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#getId
   * @methodOf sourceBox.types:constructor.Collection
   * @return {String} Id of the collection
   */

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#getTitle
   * @methodOf sourceBox.types:constructor.Collection
   * @return {String} title of the collection
   */
  getTitle: function(){ return this.data.title; },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#getSize
   * @methodOf sourceBox.types:constructor.Collection
   * @return {Number} number of source descriptions in the collection
   */
  getSize: function(){ return this.data.size; },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#getAttribution
   * @methodOf sourceBox.types:constructor.Collection
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#getCollectionUrl
   * @methodOf sourceBox.types:constructor.Collection

   * @return {String} Url of the person
   */
  getCollectionUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('self')).href); },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#getSourceDescriptions
   * @methodOf sourceBox.types:constructor.Collection

   * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
   * @return {Object} promise for the {@link sourceBox.functions:getCollectionSourceDescriptions getCollectionSourceDescriptions} response
   */
  getSourceDescriptions: function(params) {
    return this.client.getCollectionSourceDescriptions(this.helpers.removeAccessToken(maybe(this.getLink('source-descriptions')).href), params);
  },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#save
   * @methodOf sourceBox.types:constructor.Collection

   * @description
   * Create a new user-defined collection (folder)
   *
   *
   * @return {Object} promise for the response
   */
  save: function() {
    var self = this,
        urlPromise = self.getCollectionUrl() ? Promise.resolve(self.getCollectionUrl()) : self.plumbing.getCollectionUrl('FSUDS', 'subcollections');
    return urlPromise.then(function(url) {
      return self.plumbing.post(url, { collections: [ self ] });
    }).then(function(response){
      self.updateFromResponse(response, 'self');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#delete
   * @methodOf sourceBox.types:constructor.Collection

   * @description delete this collection (must be empty)
   * - see {@link sources.functions:deleteCollection deleteCollection}
   *
   * @return {Object} promise for the response
   */
  delete: function() {
    return this.client.deleteCollection(this.getCollectionUrl());
  }

});
},{"./../FamilySearch":5,"./../utils":57}],12:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name discussions.types:constructor.Comment
 * @description
 *
 * Comment on a discussion or memory
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */

var Comment = FS.Comment = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name discussions.functions:createComment
 * @param {Object} data [Comment](https://familysearch.org/developers/docs/api/fs/Comment_json) data
 * @return {Object} {@link discussions.types:constructor.Comment Comment}
 * @description Create a {@link discussions.types:constructor.Comment Comment} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createComment = function(data){
  return new Comment(this, data);
};

Comment.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Comment,
  
  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#getId
   * @methodOf discussions.types:constructor.Comment
   * @return {String} Id of the comment
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#getText
   * @methodOf discussions.types:constructor.Comment
   * @return {String} text of the comment
   */
  getText: function(){ return this.data.text; },

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#getCreatedTimestamp
   * @methodOf discussions.types:constructor.Comment
   * @return {Number} timestamp
   */
  getCreatedTimestamp: function(){ return this.data.created; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#getCommentUrl
   * @methodOf discussions.types:constructor.Comment

   * @return {String} URL of this comment; _NOTE_ however, that individual comments cannot be read
   */
  getCommentUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('comment')).href); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#getAgentId
   * @methodOf discussions.types:constructor.Comment

   * @return {String} id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentId: function() { return maybe(this.data.contributor).resourceId; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#getAgentUrl
   * @methodOf discussions.types:constructor.Comment

   * @return {String} URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.contributor).resource); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#getAgent
   * @methodOf discussions.types:constructor.Comment

   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  getAgent: function() { return this.client.getAgent(this.getAgentUrl() || this.getAgentId()); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#save
   * @methodOf discussions.types:constructor.Comment

   * @description
   * Create a new comment or update an existing comment
   *
   * _NOTE_: there's no _refresh_ parameter because it's not possible to read individual comments;
   * however, the comment's id and URL is set when creating a new comment
   *
   *
   * @param {string} url url of the discussion or memory comments list; required for both creating and updating comments; updating is distinguished from creating by the presence of an id on the comment.
   * @return {Object} promise for the response
   */
  save: function(url) {
    var self = this;
    var payload = {discussions: [{ comments: [ self ] }] };
    return self.plumbing.post(url, payload, {'Content-Type' : 'application/x-fs-v1+json'}).then(function(response){
      self.updateFromResponse(response, 'comment');
      return response;  
    });
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#delete
   * @methodOf discussions.types:constructor.Comment

   * @description delete this comment
   * @description delete this comment - see {@link discussions.functions:deleteDiscussionComment deleteDiscussionComment}
   * or {@link memories.functions:deleteMemoryComment deleteMemoryComment}
   * @param {string=} changeMessage change message (currently ignored)
   * @return {Object} promise for the response
   */
  delete: function(url, changeMessage) {
    return this.client.deleteComment(this.getCommentUrl(), changeMessage);
  }

});
},{"./../FamilySearch":5,"./../utils":57}],13:[function(require,module,exports){
var FS = require('../FamilySearch'),
    relHelpers = require('../relationshipHelpers'),
    utils = require('../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name spouses.types:constructor.Couple
 * @description
 *
 * Couple relationship
 *
 * Two methods to note below are _save_ and _delete_.
 * _save_ persists the changes made to husband, wife, and facts;
 * _delete_ removes the relationship.
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {husband, wife, facts}.
 * _husband_ and _wife_ are Person objects, URLs, or ids.
 * _facts_ is an array of Facts or objects to be passed into the Fact constructor.
 */
var Couple = FS.Couple = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.husband) {
      //noinspection JSUnresolvedFunction
      this.setHusband(data.husband);
      delete data.husband;
    }
    if (data.wife) {
      //noinspection JSUnresolvedFunction
      this.setWife(data.wife);
      delete data.wife;
    }
    if (data.facts) {
      utils.forEach(this.data.facts, function(fact, i){
        if(!(fact instanceof FS.Fact)){
          this.data.facts[i] = client.createFact(fact);
        }
      }, this);
    }
  }
};

/**
 * @ngdoc function
 * @name spouses.functions:createCouple
 * @param {Object} data [Relationship](https://familysearch.org/developers/docs/api/gx/Relationship_json) data
 * @return {Object} {@link spouses.types:constructor.Couple Couple}
 * @description Create a {@link spouses.types:constructor.Couple Couple} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createCouple = function(data){
  return new Couple(this, data);
};

Couple.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Couple,
  
  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getId
   * @methodOf spouses.types:constructor.Couple
   * @return {String} Id of the relationship
   */

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getCoupleUrl
   * @methodOf spouses.types:constructor.Couple

   * @return {String} Url of this couple relationship
   */
  getCoupleUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('relationship')).href); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getFacts
   * @methodOf spouses.types:constructor.Couple
   * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., marriage
   */
  getFacts: function() { return this.data.facts || []; },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getMarriageFact
   * @methodOf spouses.types:constructor.Couple
   * @return {Fact} {@link fact.types:constructor.Fact Fact} of type http://gedcomx.org/Marriage (first one if multiple)
   */
  getMarriageFact: function() { return utils.find(this.data.facts, function(fact){
      return fact.getType() === 'http://gedcomx.org/Marriage';
    }); 
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getHusbandId
   * @methodOf spouses.types:constructor.Couple
   * @return {String} Id of the husband
   */
  getHusbandId: function() { return maybe(this.data.person1).resourceId; },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getHusbandUrl
   * @methodOf spouses.types:constructor.Couple
   * @return {String} URL of the husband
   */
  getHusbandUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.person1).resource); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getHusband
   * @methodOf spouses.types:constructor.Couple
   * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
   */
  getHusband: function() { return this.client.getPerson(this.getHusbandUrl()); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getWifeId
   * @methodOf spouses.types:constructor.Couple
   * @return {String} Id of the wife
   */
  getWifeId: function() { return maybe(this.data.person2).resourceId; },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getWifeUrl
   * @methodOf spouses.types:constructor.Couple
   * @return {String} URL of the wife
   */
  getWifeUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.person2).resource); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getWife
   * @methodOf spouses.types:constructor.Couple
   * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
   */
  getWife: function() { return this.client.getPerson(this.getWifeUrl()); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getSpouseId
   * @methodOf spouses.types:constructor.Couple
   * @description Use this method when you know the ID of one person in the relationship and you want to fetch the ID of the other person.
   * @param {string} ID of the spouse which you already know
   * @return {String} Id of the other spouse
   */
  getSpouseId: function(knownSpouseId) { 
    if(maybe(this.data.person1).resourceId === knownSpouseId) {
      return maybe(this.data.person2).resourceId;
    } else {
      return maybe(this.data.person1).resourceId;
    }
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getSpouseUrl
   * @methodOf spouses.types:constructor.Couple
   * @description Use this method when you know the ID of one person in the relationship and you want to fetch the URL of the other person.
   * @param {string} ID of the spouse which you already know
   * @return {String} URL of the other spouse
   */
  getSpouseUrl: function(knownSpouseId) {
    if(maybe(this.data.person1).resourceId === knownSpouseId) {
      return this.helpers.removeAccessToken(maybe(this.data.person2).resource);
    } else {
      return this.helpers.removeAccessToken(maybe(this.data.person1).resource);
    }
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getSpouse
   * @methodOf spouses.types:constructor.Couple
   * @description Use this method when you know the ID of one person in the relationship and you want to fetch the other person.
   * @param {string} ID of the spouse which you already know
   * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
   */
  getSpouse: function(knownSpouseId) { 
    return this.client.getPerson(this.getSpouseUrl(knownSpouseId));
  },
  
  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getNotes
   * @methodOf spouses.types:constructor.Couple
   * @return {Object} promise for the {@link notes.functions:getNotes getNotes} response
   */
  getNotes: function() { 
    var self = this;
    return self.getLinkPromise('notes').then(function(link){
      return self.client.getNotes(link.href);
    });
  },


  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getSourceRefs
   * @methodOf spouses.types:constructor.Couple
   * @return {Object} promise for the {@link sources.functions:getCoupleSourceRefs getCoupleSourceRefs} response
   */
  getSourceRefs: function() { 
    var self = this;
    return self.getLinkPromise('source-references').then(function(link){
      return self.client.getSourceRefs(link.href);
    });
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getSources
   * @methodOf spouses.types:constructor.Couple
   * @return {Object} promise for the {@link sources.functions:getSourcesQuery getSourcesQuery} response
   */
  getSources: function() { 
    var self = this;
    return self.getLinkPromise('source-descriptions').then(function(link){
      return self.client.getSourcesQuery(link.href);
    });
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getChanges
   * @methodOf spouses.types:constructor.Couple
   * @description
   * Get change history for a couple relationship
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Change_History_resource FamilySearch API Docs}
   *
   *
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @return {Object} promise for the response
   */
  getChanges: function(params) { 
    var self = this;
    return self.getLinkPromise('change-history').then(function(link) {
      return self.client.getChanges(link.href, params);
    });
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#setHusband
   * @methodOf spouses.types:constructor.Couple
   * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
   * @param {Person|string} husband person or URL or id
   * @return {Couple} this relationship
   */
  setHusband: function(husband) {
    relHelpers.setMember.call(this, 'person1', husband);
    this.husbandChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#setWife
   * @methodOf spouses.types:constructor.Couple
   * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
   * @param {Person|string} wife person or URL or id
   * @return {Couple} this relationship
   */
  setWife: function(wife) {
    relHelpers.setMember.call(this, 'person2', wife);
    this.wifeChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#setFacts
   * @methodOf spouses.types:constructor.Couple
   * @param {Fact[]|Object[]} facts facts to set; if array elements are not Facts, they are passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {Couple} this relationship
   */
  setFacts: function(facts, changeMessage) {
    relHelpers.setFacts.call(this, 'facts', facts, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#addFact
   * @methodOf spouses.types:constructor.Couple
   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {Couple} this relationship
   */
  addFact: function(value) {
    relHelpers.addFact.call(this, 'facts', value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#deleteFact
   * @methodOf spouses.types:constructor.Couple
   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {Couple} this relationship
   */
  deleteFact: function(value, changeMessage) {
    relHelpers.deleteFact.call(this, 'facts', value, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },
  
  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#addSource
   * @methodOf spouses.types:constructor.Couple
   * 
   * @description
   * Attach a source to this couple. This will create a source description (if
   * it doesn't already exist) and a source reference for you.
   * 
   * @param {Object} sourceDescription Data for the source description or a
   * {@link sources.types:constructor.SourceDescription SourceDescription} object.
   * @param {String=} changeMessage change message
   * @param {String[]=} tags an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
   * @return {Object} promise for the {@link sources.types:constructor.SourceRef#save SourceRef.save()} response
   */
  addSource: function(sourceDescription, changeMessage, tags){
    return this.client._createAndAttachSource(this, sourceDescription, changeMessage, tags);
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#save
   * @methodOf spouses.types:constructor.Couple
   * @description
   * Create a new relationship if this relationship does not have an id, or update the existing relationship.
   *
   *
   * @param {String=} changeMessage default change message to use when fact/deletion-specific changeMessage was not specified
   * @return {Object} promise that resolves to an array of responses
   */
  save: function(changeMessage) {
    var postData = this.client.createCouple();
    var isChanged = false;
    var crid = this.getId();
    var self = this;

    // send husband and wife if new or either has changed
    if (!crid || this.husbandChanged || this.wifeChanged) {
      postData.data.person1 = this.data.person1;
      postData.data.person2 = this.data.person2;
      isChanged = true;
    }

    // set global changeMessage
    if (changeMessage) {
      postData.setAttribution(self.client.createAttribution(changeMessage));
    }

    utils.forEach(this.data.facts, function(fact) {
      if (!crid || !fact.getId() || fact.changed) {
        relHelpers.addFact.call(postData, 'facts', fact);
        isChanged = true;
      }
    });

    var promises = [];

    // post update
    if (isChanged) {
      if (!crid) {
        postData.data.type = 'http://gedcomx.org/Couple'; // set type on new relationships
      }
      // as of 9 July 2014 it's possible to update relationships using the relationships endpoint,
      // but the way we're doing it is fine as well
      var urlPromise = self.getCoupleUrl() ? Promise.resolve(self.getCoupleUrl()) : self.plumbing.getCollectionUrl('FSFT', 'relationships');
      promises.push(
        urlPromise.then(function(url) {
          // set url from id
          utils.forEach(['person1', 'person2'], function(role) {
            if (postData.data[role] && !postData.data[role].resource && postData.data[role].resourceId) {
              postData.data[role].resource = postData.data[role].resourceId;
            }
          });
          return self.plumbing.post(url, { relationships: [ postData ] });
        }).then(function(response){
          self.updateFromResponse(response);
          return response;
        })
      );
    }

    // post deleted facts
    if (crid && this.deletedFacts) {
      utils.forEach(this.deletedFacts, function(value, key) {
        value = value || changeMessage; // default to global change message
        promises.push(self.plumbing.del(key, value ? {'X-Reason' : value} : {}));
      });
    }

    // wait for all promises to be fulfilled
    return Promise.all(promises);
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#delete
   * @methodOf spouses.types:constructor.Couple
   * @description delete this relationship - see {@link spouses.functions:deleteCouple deleteCouple}
   * @param {string} changeMessage change message
   * @return {Object} promise for the relationship URL
   */
  delete: function(changeMessage) {
    return this.client.deleteCouple(this.getCoupleUrl(), changeMessage);
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#restore
   * @methodOf spouses.types:constructor.Couple
   * @description restore this relationship - see {@link spouses.functions:restoreCouple restoreCouple}
   * @return {Object} promise for the relationship URL
   */
  restore: function() {
    var self = this;
    return self.getLinkPromise('restore').then(function(link){
      return self.client.restoreCouple(link.href);
    });
  }
});
},{"../FamilySearch":5,"../relationshipHelpers":56,"../utils":57}],14:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('../utils');

/**
 * @ngdoc function
 * @name authorities.types:constructor.Date
 * @description
 *
 * Date
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var FSDate = FS.Date = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(utils.isString(data.normalized)){
      this.setNormalized(data.normalized);
    }
  }
};

/**
 * @ngdoc function
 * @name authorities.functions:createDate
 * @param {Object} data [Date](https://familysearch.org/developers/docs/api/gx/Date_json) data
 * @return {Object} {@link authorities.types:constructor.Date Date}
 * @description Create a {@link authorities.types:constructor.Date Date} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createDate = function(data){
  return new FSDate(this, data);
};

FSDate.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: FSDate,

  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#getOriginal
   * @methodOf authorities.types:constructor.Date
   * @return {string} original date string
   */
  getOriginal: function(){
    return this.data.original;
  },
   
  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#getFormal
   * @methodOf authorities.types:constructor.Date
   * @return {string} formal date string
   */
  getFormal: function(){
    return this.data.formal;
  },
  
  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#getNormalized
   * @methodOf authorities.types:constructor.Date
   * @return {string} normalized date string
   */
  getNormalized: function(){
    // Return the first because, for now, FS only ever returns one
    return utils.maybe(utils.maybe(this.data.normalized)[0]).value;
  },

  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#setOriginal
   * @methodOf authorities.types:constructor.Date
   * @param {string} original Original date
   * @return {Date} Date object
   */
  setOriginal: function(original){
    this.data.original = original;
    return this;
  },
   
  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#setFormal
   * @methodOf authorities.types:constructor.Date
   * @param {string} formal Formal date
   * @return {Date} Date object
   */
  setFormal: function(formal){
    this.data.formal = formal;
    return this;
  },
  
  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#setNormalized
   * @methodOf authorities.types:constructor.Date
   * @param {string} normalized Normalized date
   * @return {Date} Date object
   */
  setNormalized: function(normalized){
    // Always set the first because, for now, FS only ever uses one
    this.data.normalized = [ { value: normalized } ];
    return this;
  }
  
});

},{"../utils":57,"./../FamilySearch":5}],15:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name discussions.types:constructor.Discussion
 * @description
 *
 * Discussion
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */ 
var Discussion = FS.Discussion = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name discussions.functions:createDiscussion
 * @param {Object} data [Discussion](https://familysearch.org/developers/docs/api/fs/Discussion_json) data
 * @return {Object} {@link discussions.types:constructor.Discussion Discussion}
 * @description Create a {@link discussions.types:constructor.Discussion Discussion} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createDiscussion = function(data){
  return new Discussion(this, data);
};

// TODO consider disallowing save()'ing or delete()'ing discussions

Discussion.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Discussion,
  
  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getId
   * @methodOf discussions.types:constructor.Discussion
   * @return {String} Id of the discussion
   */

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getTitle
   * @methodOf discussions.types:constructor.Discussion
   * @return {String} title of the discussion
   */
  getTitle: function(){ return this.data.title; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getDetails
   * @methodOf discussions.types:constructor.Discussion
   * @return {String} description / text of the discussion
   */
  getDetails: function(){ return this.data.details; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getCreatedTimestamp
   * @methodOf discussions.types:constructor.Discussion
   * @return {Number} timestamp in millis
   */
  getCreatedTimestamp: function(){ return this.data.created; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getModifiedTimestamp
   * @methodOf discussions.types:constructor.Discussion
   * @return {Number} timestamp in millis
   */
  getModifiedTimestamp: function(){ return this.data.modified; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getNumberOfComments
   * @methodOf discussions.types:constructor.Discussion
   * @return {Number} number of comments
   */
  getNumberOfComments: function(){ return this.data.numberOfComments; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getDiscussionUrl
   * @methodOf discussions.types:constructor.Discussion

   * @return {String} URL of this discussion
   */
  getDiscussionUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('discussion')).href); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getCommentsUrl
   * @methodOf discussions.types:constructor.Discussion

   * @return {String} URL of the comments endpoint - pass into {@link discussions.functions:getDiscussionComments getDiscussionComments} for details
   */
  getCommentsUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('comments')).href); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getComments
   * @methodOf discussions.types:constructor.Discussion

   * @return {Object} promise for the {@link discussions.functions:getDiscussionComments getDiscussionComments} response
   */
  getComments: function() { return this.client.getDiscussionComments(this.getCommentsUrl()); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getAgentId
   * @methodOf discussions.types:constructor.Discussion

   * @return {String} id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentId: function() { return maybe(this.data.contributor).resourceId; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getAgentUrl
   * @methodOf discussions.types:constructor.Discussion

   * @return {String} URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.contributor).resource); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getAgent
   * @methodOf discussions.types:constructor.Discussion

   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  getAgent: function() { return this.client.getAgent(this.getAgentUrl()); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#save
   * @methodOf discussions.types:constructor.Discussion

   * @description
   * Create a new discussion (if this discussion does not have an id) or update the existing discussion
   *
   *
   * @return {Object} promise of the discussion id, which is fulfilled after the discussion has been updated or,
   * if refresh is true, after the discussion has been read.
   */
  save: function() {
    var self = this,
        urlPromise = self.getDiscussionUrl() ? Promise.resolve(self.getDiscussionUrl()) : self.plumbing.getCollectionUrl('FSDF', 'discussions');
    return urlPromise.then(function(url){
        return self.plumbing.post(url, { discussions: [ self ] }, {'Content-Type' : 'application/x-fs-v1+json'});
    }).then(function(response){
      self.updateFromResponse(response, 'discussion');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#delete
   * @methodOf discussions.types:constructor.Discussion

   * @description delete this discussion - see {@link discussions.functions:deleteDiscussion deleteDiscussion}
   *
   * __NOTE__ if you delete a discussion, it's up to you to delete the corresponding Discussion Refs
   * Since there is no way to tell which people a discussion has been linked to, your best best is to
   * attach a discussion to a single person and to delete the discussion when you delete the discussion-reference
   * FamilySearch is aware of this issue but hasn't committed to a fix.
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @return {Object} promise for the discussion id
   */
  delete: function(changeMessage) {
    return this.client.deleteDiscussion(this.getDiscussionUrl(), changeMessage);
  }

});
},{"./../FamilySearch":5,"./../utils":57}],16:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name discussions.types:constructor.DiscussionRef
 * @description
 *
 * Reference to a discussion on a person.
 * To create a new discussion reference, you must set personId and discussion.
 * _NOTE_: discussion references cannot be updated. They can only be created or deleted.
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object
 * _discussion_ can be a {@link discussions.types:constructor.Discussion Discussion} or a discussion URL or a discussion id
 */
var DiscussionRef = FS.DiscussionRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
  if (data && data.discussion) {
    //noinspection JSUnresolvedFunction
    this.setDiscussion(data.discussion);
    delete data.discussion;
  }
};

/**
 * @ngdoc function
 * @name discussions.functions:createDiscussionRef
 * @param {Object} data [DiscussionReference](https://familysearch.org/developers/docs/api/fs/DiscussionReference_json) data
 * @return {Object} {@link discussions.types:constructor.DiscussionRef DiscussionRef}
 * @description Create a {@link discussions.types:constructor.DiscussionRef DiscussionRef} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createDiscussionRef = function(data){
  return new DiscussionRef(this, data);
};

DiscussionRef.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: DiscussionRef,

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getId
   * @methodOf discussions.types:constructor.DiscussionRef
   * @return {String} Discussion Ref Id
   */

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getResourceId
   * @methodOf discussions.types:constructor.DiscussionRef
   * @return {String} Discussion Id
   */
  getResourceId: function(){ return this.data.resourceId; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getResource
   * @methodOf discussions.types:constructor.DiscussionRef
   * @return {String} Discussion URL
   */
  getResource: function(){ return this.data.resource; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getAttribution
   * @methodOf discussions.types:constructor.DiscussionRef
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getDiscussionRefUrl
   * @methodOf discussions.types:constructor.DiscussionRef

   * @return {String} URL of this discussion reference; _NOTE_ however, that individual discussion references cannot be read
   */
  getDiscussionRefUrl: function() {
    return this.helpers.removeAccessToken(maybe(this.getLink('discussion-reference')).href);
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getDiscussionUrl
   * @methodOf discussions.types:constructor.DiscussionRef

   * @return {string} URL of the discussion (without the access token) -
   * pass into {@link discussions.functions:getDiscussion getDiscussion} for details
   */
  getDiscussionUrl: function() {
    return this.helpers.removeAccessToken(this.data.resource);
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getDiscussion
   * @methodOf discussions.types:constructor.DiscussionRef

   * @return {Object} promise for the {@link discussions.functions:getDiscussion getDiscussion} response
   */
  getDiscussion: function() {
    return this.client.getDiscussion(this.getDiscussionUrl() || this.resourceId);
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#setDiscussion
   * @methodOf discussions.types:constructor.DiscussionRef

   * @param {Discussion|string} discussion Discussion object or discussion url or discussion id
   * @return {DiscussionRef} this discussion ref
   */
  setDiscussion: function(discussion) {
    if (discussion instanceof FS.Discussion) {
      this.data.resource = discussion.getDiscussionUrl();
      this.data.resourceId = discussion.getId();
    }
    else if (this.helpers.isAbsoluteUrl(discussion)) {
      this.data.resource = this.helpers.removeAccessToken(discussion);
    }
    else {
      this.data.resourceId = discussion;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#save
   * @methodOf discussions.types:constructor.DiscussionRef

   * @description
   * Create a new discussion reference
   *
   * NOTE: there's no _refresh_ parameter because it's not possible to read individual discussion references;
   * however, the discussion reference's URL is set when creating a new discussion reference
   *
   *
   * @param {string} url url of the discussions references list. this is only need for new discussion refs. you can set it to null (or anything else) for existing refs that you are updating
   * @param {string} personId id of the person which the discussion ref will be attached to
   * @param {string} changeMessage change message - unused - discussion reference attributions do not contain change messages
   * @return {Object} promise for the response
   */
  save: function(url, personId, changeMessage) {
    var self = this;
    if (self.getDiscussionRefUrl()) {
      url = self.getDiscussionRefUrl();
    }
    if (!self.data.resource && self.data.resourceId) {
      self.data.resource = self.data.resourceId;
    }
    var payload = {
      persons: [{
        id: personId,
        'discussion-references' : [ { resource: self.data.resource } ]
      }]
    };
    if (changeMessage) {
      payload.persons[0].attribution = self.client.createAttribution(changeMessage);
    }
    var headers = {'Content-Type': 'application/x-fs-v1+json'};
    return self.plumbing.post(url, payload, headers).then(function(response){
      self.updateFromResponse(response, 'discussion-reference');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#delete
   * @methodOf discussions.types:constructor.DiscussionRef

   * @description delete this discussion reference - see {@link discussions.functions:deleteDiscussionRef deleteDiscussionRef}
   * @param {string=} changeMessage change message
   * @return {Object} promise for the response
   */
  delete: function(changeMessage) {
    return this.client.deleteDiscussionRef(this.getDiscussionRefUrl(), changeMessage);
  }

});
},{"./../FamilySearch":5,"./../utils":57}],17:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name fact
 * @description
 * Fact
 */

/**
 * @ngdoc function
 * @name fact.types:constructor.Fact
 * @description
 *
 * Fact
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var Fact = FS.Fact = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.date) {
      this.setDate(data.date);
    }
    if (data.place) {
      this.setPlace(data.place);
    }
    if (data.attribution && !(data.attribution instanceof FS.Attribution)) {
      this.setAttribution(client.createAttribution(data.attribution));
    }
  }
  
  this.changed = false;
};

/**
 * @ngdoc function
 * @name fact.functions:createFact
 * @param {Object} data [Fact](https://familysearch.org/developers/docs/api/gx/Fact_json) data
 * @return {Object} {@link fact.types:constructor.Fact Fact}
 * @description Create a {@link fact.types:constructor.Fact Fact} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createFact = function(data){
  return new Fact(this, data);
};

Fact.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Fact,
  
  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getId
   * @methodOf fact.types:constructor.Fact
   * @return {String} Id of the name
   */

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getType
   * @methodOf fact.types:constructor.Fact
   * @return {String} http://gedcomx.org/Birth, etc.
   */
  getType: function() { return this.data.type; },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getValue
   * @methodOf fact.types:constructor.Fact
   * @return {String} Description (some facts have descriptions)
   */
  getValue: function() { return this.data.value; },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getDate
   * @methodOf fact.types:constructor.Fact
   * @return {Date} date
   */
  getDate: function() { return this.data.date; },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getOriginalDate
   * @methodOf fact.types:constructor.Fact
   * @return {String} original date
   */
  getOriginalDate: function() { 
    if(this.data.date){
      return this.data.date.getOriginal();
    }
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getNormalizedDate
   * @methodOf fact.types:constructor.Fact
   * @return {String} normalized place text
   */
  getNormalizedDate: function() { 
    if(this.data.date) {
      return this.data.date.getNormalized(); 
    }
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getFormalDate
   * @methodOf fact.types:constructor.Fact
   * @return {String} date in gedcomx format; e.g., +1836-04-13
   */
  getFormalDate: function() {  
    if(this.data.date) {
      return this.data.date.getFormal(); 
    }
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getPlace
   * @methodOf fact.types:constructor.Fact
   * @return {PlaceReference} event place
   */
  getPlace: function() { return this.data.place; },
  
  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getOriginalPlace
   * @methodOf fact.types:constructor.Fact
   * @return {String} original place text
   */
  getOriginalPlace: function(){ 
    if(this.data.place) {
      return this.data.place.getOriginal();
    }
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getNormalizedPlace
   * @methodOf fact.types:constructor.Fact
   * @return {String} normalized place text
   */
  getNormalizedPlace: function() { 
    if(this.data.place) {
      return this.data.place.getNormalized();
    }
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getNormalizedPlaceId
   * @methodOf fact.types:constructor.Fact
   * @return {String} normalized place id
   */
  getNormalizedPlaceId: function() {
    var desc = maybe(this.data.place).description;
    return (desc && desc.charAt(0) === '#') ? desc.substr(1) : '';
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#isCustomNonEvent
   * @methodOf fact.types:constructor.Fact
   * @return {Boolean} true if this custom item is a non-event (i.e., fact)
   */
  isCustomNonEvent: function() {
    if (!!this.data.qualifiers) {
      var qual = utils.find(this.data.qualifiers, {name: 'http://familysearch.org/v1/Event'});
      return !!qual && qual.value === 'false';
    }
    return false;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setType
   * @methodOf fact.types:constructor.Fact
   * @description sets the fact type
   * @param {String} type e.g., http://gedcomx.org/Birth
   * @return {Fact} this fact
   */
  setType: function(type) {
    this.changed = true;
    this.data.type = type;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setCustomNonEvent
   * @methodOf fact.types:constructor.Fact
   * @description declares whether this custom item is a fact or an event
   * @param {boolean} isNonEvent true for non-event (i.e., fact)
   * @return {Fact} this fact
   */
  setCustomNonEvent: function(isNonEvent) {
    var pos;
    if (isNonEvent) {
      if (!this.data.qualifiers) {
        this.data.qualifiers = [];
      }
      pos = utils.findIndex(this.data.qualifiers, {name: 'http://familysearch.org/v1/Event'});
      if (pos < 0) {
        pos = this.data.qualifiers.push({name: 'http://familysearch.org/v1/Event'}) - 1;
      }
      this.data.qualifiers[pos].value = 'false';
    }
    else {
      if (!!this.data.qualifiers) {
        pos = utils.findIndex(this.data.qualifiers, {name: 'http://familysearch.org/v1/Event'});
        if (pos >= 0) {
          this.data.qualifiers.splice(pos, 1);
        }
        if (this.data.qualifiers.length === 0) {
          delete this.data.qualifiers;
        }
      }
    }
    this.changed = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setDate
   * @methodOf fact.types:constructor.Fact
   * @description sets the fact date
   * @param {Date|Object} date a {@link authorities.types:constructor.Date Date} object
   * @return {Fact} this fact
   */
  setDate: function(date) {
    this.changed = true;
    if (date instanceof FS.Date) {
      this.data.date = date;
    } else {
      this.data.date = this.client.createDate(date);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setOriginalDate
   * @methodOf fact.types:constructor.Fact
   * @description sets the fact's original date
   * @param {string} original original date string
   * @return {Fact} this fact
   */
  setOriginalDate: function(original) {
    this.changed = true;
    if(!this.data.date) {
      this.data.date = this.client.createDate();
    }
    this.data.date.setOriginal(original);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setFormalDate
   * @methodOf fact.types:constructor.Fact
   * @description sets the formal date
   * @param {String} formalDate from the date authority; e.g., +1836-04-06
   * @return {Fact} this fact
   */
  setFormalDate: function(formalDate) {
    this.changed = true;
    if(!this.data.date) {
      this.data.date = this.client.createDate();
    }
    this.data.date.setFormal(formalDate);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setNormalizedDate
   * @methodOf fact.types:constructor.Fact
   * @description sets the normalized date
   * @param {String} normalizedDate; e.g., 6 April 1836
   * @return {Fact} this fact
   */
  setNormalizedDate: function(normalizedDate) {
    this.changed = true;
    if(!this.data.date) {
      this.data.date = this.client.createDate();
    }
    this.data.date.setNormalized(normalizedDate);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setPlace
   * @methodOf fact.types:constructor.Fact
   * @description sets the place; original and normalized forms must be set
   * @param {String|Object|Date} place either a place string as written by the user (in which case you must also call setNormalizedPlace()),
   * or a {original, normalized} object, or a {@link places.types:constructor.PlaceDescription PlaceDescription} object
   * @return {Fact} this fact
   */
  setPlace: function(place) {
    this.changed = true;
    if (place instanceof FS.PlaceReference) {
      this.data.place = place;
    } else if(place instanceof FS.PlaceDescription){
      this.data.place = this.client.createPlaceReference({
        original: place.getFullName(),
        normalized: place.getFullName()
      });
    } else {
      this.data.place = this.client.createPlaceReference(place);
    }
    //noinspection JSValidateTypes
    return this;
  },
  
  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setOriginalPlace
   * @methodOf fact.types:constructor.Fact
   * @description sets the original place text
   * @param {String} original place from the place authority
   * @return {Fact} this fact
   */
  setOriginalPlace: function(originalPlace){
    this.changed = true;
    if(!this.data.place){
      this.data.place = this.client.createPlaceReference();
    }
    this.data.place.setOriginal(originalPlace);
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setNormalizedPlace
   * @methodOf fact.types:constructor.Fact
   * @description sets the standard place text
   * @param {String} normalized place name
   * @return {Fact} this fact
   */
  setNormalizedPlace: function(normalizedPlace) {
    this.changed = true;
    if(!this.data.place){
      this.data.place = this.client.createPlaceReference();
    }
    this.data.place.setNormalized(normalizedPlace);
    return this;
  }
});

},{"./../FamilySearch":5,"./../utils":57}],18:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('../utils');

/**
 * @ngdoc function
 * @name gender.types:constructor.Gender
 * @description
 *
 * Gender
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var Gender = FS.Gender = function(client, data) {
  FS.BaseClass.call(this, client, data);
  this.changed = false;
};

/**
 * @ngdoc function
 * @name gender.functions:createGender
 * @param {Object} data [Gender](https://familysearch.org/developers/docs/api/gx/Gender_json) data
 * @return {Object} {@link gender.types:constructor.Gender Gender}
 * @description Create a {@link gender.types:constructor.Gender Gender} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createGender = function(data){
  return new Gender(this, data);
};

Gender.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Gender,

  /**
   * @ngdoc function
   * @name gender.types:constructor.Gender#getType
   * @methodOf gender.types:constructor.Gender
   * @return {string} [gender type](https://familysearch.org/developers/docs/api/types/genderType_json)
   */
  getType: function(){
    return this.data.type;
  },
   
  /**
   * @ngdoc function
   * @name gender.types:constructor.Gender#setType
   * @methodOf gender.types:constructor.Gender
   * @param {string} type [gender type](https://familysearch.org/developers/docs/api/types/genderType_json)
   * @return {Gender} this Gender object
   */
  setType: function(type){
    this.changed = true;
    this.data.type = type;
    return this;
  }
  
});

},{"../utils":57,"./../FamilySearch":5}],19:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name memories.types:constructor.Memory
 * @description
 *
 * Memory
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
 *
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {title, description, artifactFilename, data}.
 * data_ is a string for Stories, or a FormData for Images or Documents
 * - if FormData, the field name of the file to upload _must_ be `artifact`.
 * data_ is ignored when updating a memory.
 * _description_ doesn't appear to apply to stories.
 *
 * __NOTE__ it is not currently possible to update memory contents - not even for stories
 */
var Memory = FS.Memory = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name memories.functions:createMemory
 * @param {Object} data Memory data which is a [SourceDescription](https://familysearch.org/developers/docs/api/gx/SourceDescription_json) data
 * @return {Object} {@link memories.types:constructor.Memory Memory}
 * @description Create a {@link memories.types:constructor.Memory Memory} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createMemory = function(data){
  return new Memory(this, data);
};

Memory.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Memory,
  
  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getId
   * @methodOf memories.types:constructor.Memory
   * @return {String} Id of the Memory
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getMediaType
   * @methodOf memories.types:constructor.Memory
   * @return {String} media type; e.g., image/jpeg
   */
  getMediaType: function(){ return this.data.mediaType; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getResourceType
   * @methodOf memories.types:constructor.Memory
   * @return {String} resource type; e.g., http://gedcomx.org/DigitalArtifact
   */
  getResourceType: function(){ return this.data.resourceType; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getAbout
   * @methodOf memories.types:constructor.Memory
   * @return {String} memory artifact URL
   */
  getAbout: function(){ return this.data.about; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getArtifactMetadata
   * @methodOf memories.types:constructor.Memory
   * @return {Object[]} array of { `artifactType`, `filename` }
   */
  getArtifactMetadata: function(){ return maybe(this.data.artifactMetadata); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getAttribution
   * @methodOf memories.types:constructor.Memory
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getTitle
   * @methodOf memories.types:constructor.Memory
   * @return {String} title
   */
  getTitle: function() { return maybe(maybe(this.data.titles)[0]).value; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getDescription
   * @methodOf memories.types:constructor.Memory
   * @return {String} description (may not apply to story memories)
   */
  getDescription: function() { return maybe(maybe(this.data.description)[0]).value; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getIconUrl
   * @methodOf memories.types:constructor.Memory
   * @return {String} URL of the icon with access token
   */
  getIconUrl: function() { return this.helpers.appendAccessToken(maybe(this.getLink('image-icon')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getThumbnailUrl
   * @methodOf memories.types:constructor.Memory
   * @return {String} URL of the thumbnail with access token
   */
  getThumbnailUrl: function() { return this.helpers.appendAccessToken(maybe(this.getLink('image-thumbnail')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getImageUrl
   * @methodOf memories.types:constructor.Memory
   * @return {String} URL of the full image with access token
   */
  getImageUrl: function() { return this.helpers.appendAccessToken(maybe(this.getLink('image')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getMemoryArtifactUrl
   * @methodOf memories.types:constructor.Memory
   * @return {String} URL of the memory artifact (image, story, or document) with access token
   */
  getMemoryArtifactUrl: function() {
    // remove old access token and append a new one in case they are different
    return this.helpers.appendAccessToken(this.helpers.removeAccessToken(this.data.about));
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getMemoryUrl
   * @methodOf memories.types:constructor.Memory
   * @return {String} memory URL (without the access token)
   */
  getMemoryUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('description')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getArtifactFilename
   * @methodOf memories.types:constructor.Memory
   * @return {String} filename (provided by the user or a default name)
   */
  getArtifactFilename: function() { return maybe(maybe(this.data.artifactMetadata)[0]).filename; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getArtifactType
   * @methodOf memories.types:constructor.Memory
   * @return {String} type; e.g., http://familysearch.org/v1/Image
   */
  getArtifactType: function() { return maybe(maybe(this.data.artifactMetadata)[0]).artifactType; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getArtifactHeight
   * @methodOf memories.types:constructor.Memory
   * @return {number} image height
   */
  getArtifactHeight: function() { return maybe(maybe(this.data.artifactMetadata)[0]).height; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getArtifactWidth
   * @methodOf memories.types:constructor.Memory
   * @return {number} image width
   */
  getArtifactWidth: function() { return maybe(maybe(this.data.artifactMetadata)[0]).width; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getCommentsUrl
   * @methodOf memories.types:constructor.Memory
   * @return {String} URL of the comments endpoint
   * - pass into {@link memories.functions:getMemoryComments getMemoryComments} for details
   */
  getCommentsUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('comments')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getComments
   * @methodOf memories.types:constructor.Memory
   * @return {Object} promise for the {@link memories.functions:getMemoryComments getMemoryComments} response
   */
  getComments: function() { return this.client.getMemoryComments(this.getCommentsUrl()); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#setTitle
   * @methodOf memories.types:constructor.Memory
   * @param {String} title memory title
   * @return {Memory} this memory
   */
  setTitle: function(title) {
    this.data.titles = [ { value: title } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#setDescription
   * @methodOf memories.types:constructor.Memory
   * @param {String} description memory description (may not apply to story memories)
   * @return {Memory} this memory
   */
  setDescription: function(description) {
    this.data.description = [ { value: description } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#setArtifactFilename
   * @methodOf memories.types:constructor.Memory
   * @param {String} filename uploaded file
   * @return {Memory} this memory
   */
  setArtifactFilename: function(filename) {
    if (!utils.isArray(this.data.artifactMetadata) || !this.artifactMetadata.length) {
      this.data.artifactMetadata = [ {} ];
    }
    this.data.artifactMetadata[0].filename = filename;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#save
   * @methodOf memories.types:constructor.Memory
   * @description
   * Create a new memory (if this memory does not have an id) or update the existing memory
   *
   *
   * @return {Object} promise for the response
   */
  save: function() {
    var self = this,
        urlPromise = self.getMemoryUrl() ? Promise.resolve(self.getMemoryUrl()) : self.plumbing.getCollectionUrl('FSMEM', 'artifacts');
    return urlPromise.then(function(url) {
      if (self.getId()) {
        // update memory
        return self.plumbing.post(url, { sourceDescriptions: [ self ] });
      }
      else {
        // create memory
        var params = {};
        if (self.getTitle()) {
          params.title = self.getTitle();
        }
        if (self.getDescription()) {
          params.description = self.getDescription();
        }
        if (self.getArtifactFilename()) {
          params.filename = self.getArtifactFilename();
        }
        return self.plumbing.post(self.helpers.appendQueryParameters(url, params),
          self.data.data, { 'Content-Type': utils.isString(self.data.data) ? 'text/plain' : 'multipart/form-data' }).then(function(response){
            self.updateFromResponse(response, 'description');
            return response;
          });
      }
    });
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#delete
   * @methodOf memories.types:constructor.Memory
   * @description delete this memory - see {@link memories.functions:deleteMemory deleteMemory}
   * @return {Object} promise for the response
   */
  delete: function() {
    return this.client.deleteMemory(this.getMemoryUrl());
  }

});
},{"./../FamilySearch":5,"./../utils":57}],20:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name memories.types:constructor.MemoryArtifactRef
 * @description
 *
 * Memory Artifact Reference
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {description, qualifierValue, qualifierName}.
 * _description_ is required; it should be the memory URL
 * _qualifierValue_ is a comma-separated string of 4 numbers: "x-start,y-start,x-end,y-end".
 * Each number ranges from 0 to 1, with 0 corresponding to top-left and 1 corresponding to bottom-right.
 * _qualifierName_ is required if _qualifierValue_ is set; it should be http://gedcomx.org/RectangleRegion
 */
var MemoryArtifactRef = FS.MemoryArtifactRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(data.qualifierName && data.qualifierValue){
      this.setQualifierName(data.qualifierName);
      this.setQualifierValue(data.qualifierValue);
      delete data.qualifierName;
      delete data.qualifierValue;
    }
  }
};

/**
 * @ngdoc function
 * @name memories.functions:createMemoryArtifactRef
 * @param {Object} data [SourceReference](https://familysearch.org/developers/docs/api/gx/SourceReference_json) data
 * @return {Object} {@link memories.types:constructor.MemoryArtifactRef MemoryArtifactRef}
 * @description Create a {@link memories.types:constructor.MemoryArtifactRef MemoryArtifactRef} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createMemoryArtifactRef = function(data){
  return new MemoryArtifactRef(this, data);
};

MemoryArtifactRef.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: MemoryArtifactRef,
  
  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#getId
   * @methodOf memories.types:constructor.MemoryArtifactRef
   * @return {String} Id of the Memory Artifact
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#getDescription
   * @methodOf memories.types:constructor.MemoryArtifactRef
   * @return {String} URL of the memory
   */
  getDescription: function(){ return this.data.description; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#getQualifierName
   * @methodOf memories.types:constructor.MemoryArtifactRef

   * @return {String} qualifier name (http://gedcomx.org/RectangleRegion)
   */
  getQualifierName: function() { return maybe(maybe(this.data.qualifiers)[0]).name; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#getQualifierValue
   * @methodOf memories.types:constructor.MemoryArtifactRef

   * @return {String} qualifier value (e.g., 0.0,.25,.5,.75)
   */
  getQualifierValue: function() { return maybe(maybe(this.data.qualifiers)[0]).value; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#setQualifierName
   * @methodOf memories.types:constructor.MemoryArtifactRef

   * @param {string} qualifierName qualifier name
   * @return {MemoryArtifactRef} this memory artifact ref
   */
  setQualifierName: function(qualifierName) {
    if (!utils.isArray(this.data.qualifiers) || !this.data.qualifiers.length) {
      this.data.qualifiers = [{}];
    }
    this.data.qualifiers[0].name = qualifierName;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#setQualifierValue
   * @methodOf memories.types:constructor.MemoryArtifactRef

   * @param {string} qualifierValue qualifier value
   * @return {MemoryArtifactRef} this memory artifact ref
   */
  setQualifierValue: function(qualifierValue) {
    if (!utils.isArray(this.data.qualifiers) || !this.data.qualifiers.length) {
      this.data.qualifiers = [{}];
    }
    this.data.qualifiers[0].value = qualifierValue;
    //noinspection JSValidateTypes
    return this;
  }

});
},{"./../FamilySearch":5,"./../utils":57}],21:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name memories.types:constructor.MemoryPersona
 * @description
 *
 * Memory Persona (not a true persona; can only contain a name and a media artifact reference)
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {name, memoryArtifactRef}.
 * To create a new memory persona, you must set memoryArtifactRef and name.
 * _name_ can be a {@link name.types:constructor.Name Name} object or a fullText string.
 * _NOTE_ memory persona names don't have given or surname parts, only fullText
 */
var MemoryPersona = FS.MemoryPersona = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data){
    
    if(data.name){
      this.setName(data.name);
    }
    
    if(data.memoryArtifactRef){
      this.setMemoryArtifactRef(data.memoryArtifactRef);
    }
    
  }
};

/**
 * @ngdoc function
 * @name memories.functions:createMemoryPersona
 * @param {Object} data MemoryPerson data which is a [Person](https://familysearch.org/developers/docs/api/gx/Person_json) with additional memory data.
 * @return {Object} {@link memories.types:constructor.MemoryPersona MemoryPersona}
 * @description Create a {@link memories.types:constructor.MemoryPersona MemoryPersona} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createMemoryPersona = function(data){
  return new MemoryPersona(this, data);
};

MemoryPersona.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: MemoryPersona,
  
  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getId
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {String} Id of the Memory Persona
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#isExtracted
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {Boolean} should always be true; probably useless
   */
  isExtracted: function(){ return this.data.extracted; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getMemoryPersonaUrl
   * @methodOf memories.types:constructor.MemoryPersona

   * @return {String} memory persona URL
   */
  getMemoryPersonaUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('persona')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getMemoryArtifactRef
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {MemoryArtifactRef} {@link memories.types:constructor.MemoryArtifactRef MemoryArtifactRef}
   */
  getMemoryArtifactRef: function() { return maybe(this.data.media)[0]; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getNames
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {Name} a {@link name.types:constructor.Name Name}
   */
  getName: function() { return maybe(this.data.names)[0]; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getDisplayName
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {string} display name
   */
  getDisplayName: function() { return maybe(this.data.display).name; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getMemoryUrl
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {string} url of the memory
   */
  getMemoryUrl: function() { return this.helpers.removeAccessToken(maybe(this.getMemoryArtifactRef()).description); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getMemory
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {Object} promise for the {@link memories.functions:getMemory getMemory} response
   */
  getMemory:  function() {
    return this.client.getMemory(this.getMemoryUrl());
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#setName
   * @methodOf memories.types:constructor.MemoryPersona
   * @param {Name|string} value name
   * @return {MemoryPersona} this memory persona
   */
  setName: function(value) {
    if (!(value instanceof FS.Name)) {
      value = this.client.createName(value);
    }
    this.data.names = [ value ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#setMemoryArtifactRef
   * @methodOf memories.types:constructor.MemoryPersona
   * @param {MemoryArtifactRef} value memory artifact ref
   * @return {MemoryPersona} this memory persona
   */
  setMemoryArtifactRef: function(value) {
    this.data.media = [ value ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#save
   * @methodOf memories.types:constructor.MemoryPersona
   * @description
   * Create a new memory persona (if this memory persona does not have an id) or update the existing memory persona.
   * Only the name can be updated, not the memory id or the memory artifact reference.
   *
   *
   * @param {string} url full url of the memory personas endpoint
   * @return {Object} promise for the response
   */
  save: function(url) {
    var self = this;
    return Promise.resolve(url ? url : self.getMemoryPersonaUrl()).then(function(url){
      return self.plumbing.post(url, { persons: [ self ] });
    }).then(function(response){
      self.updateFromResponse(response, 'persona');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#delete
   * @methodOf memories.types:constructor.MemoryPersona
   * @description delete this memory persona - see {@link memories.functions:deleteMemoryPersona deleteMemoryPersona}
   * @return {Object} promise for the response
   */
  delete: function() {
    return this.client.deleteMemoryPersona(this.getMemoryPersonaUrl());
  }

});
},{"./../FamilySearch":5,"./../utils":57}],22:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name memories.types:constructor.MemoryPersonaRef
 * @description
 *
 * Reference from a person to a memory persona
 * To create a new memory persona reference you must set memoryPersona
 *
 * _NOTE_: memory persona references cannot be updated. They can only be created or deleted.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {memoryPersona}.
 * _memoryPersona_ can be a {@link memories.types:constructor.MemoryPersona MemoryPersona} or a memory persona url
 */
var MemoryPersonaRef = FS.MemoryPersonaRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data && data.memoryPersona){
    this.setMemoryPersona(data.memoryPersona);
    delete data.memoryPersona;
  }
};

/**
 * @ngdoc function
 * @name memories.functions:createMemoryPersonaRef
 * @param {Object} data [EvidenceReference](https://familysearch.org/developers/docs/api/gx/EvidenceReference_json) data
 * @return {Object} {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRef}
 * @description Create a {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRef} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createMemoryPersonaRef = function(data){
  return new MemoryPersonaRef(this, data);
};

MemoryPersonaRef.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: MemoryPersonaRef,
  
  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getId
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {String} Id of the Memory Persona Reference
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getResource
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {String} URL of the Memory Persona
   */
  getResource: function(){ return this.data.resource; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getResourceId
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {String} Id of the Memory Persona
   */
  getResourceId: function(){ return this.data.resourceId; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getMemoryPersonaRefUrl
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {String} URL of this memory persona reference; _NOTE_ however, that individual memory persona references cannot be read
   */
  getMemoryPersonaRefUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('evidence-reference')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getMemoryPersonaUrl
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {String} URL of the memory persona (without the access token);
   * pass into {@link memories.functions:getMemoryPersona getMemoryPersona} for details
   */
  getMemoryPersonaUrl: function() { return this.helpers.removeAccessToken(this.data.resource); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getMemoryPersona
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {Object} promise for the {@link memories.functions:getMemoryPersona getMemoryPersona} response
   */
  getMemoryPersona:  function() {
    return this.client.getMemoryPersona(this.getMemoryPersonaUrl());
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getMemoryUrl
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {String} URL of the memory; pass into {@link memories.functions:getMemory getMemory} for details
   */
  getMemoryUrl:  function() {
    return this.helpers.removeAccessToken(maybe(this.getLink('memory')).href);
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getMemory
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {Object} promise for the {@link memories.functions:getMemory getMemory} response
   */
  getMemory:  function() {
    return this.client.getMemory(this.getMemoryUrl());
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#setMemoryPersona
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @param {MemoryPersona|string} memoryPersona MemoryPersona object or memory persona URL
   * @return {MemoryPersonaRef} this memory persona ref
   */
  setMemoryPersona: function(memoryPersona) {
    if (memoryPersona instanceof FS.MemoryPersona) {
      //noinspection JSUnresolvedFunction
      memoryPersona = memoryPersona.getMemoryPersonaUrl();
    }
    // we must remove the access token in order to pass this into addMemoryPersonaRef
    this.data.resource = this.helpers.removeAccessToken(memoryPersona);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#save
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @description
   * Create a new memory persona ref
   *
   * NOTE: there's no _refresh_ parameter because it's not possible to read individual memory persona references;
   * however, the memory persona ref's id and URL is set when creating a new memory persona ref
   *
   *
   * @param {string} url full url for the person memory persona references endpoint
   * @return {Object} promise for the response
   */
  save: function(url) {
    var self = this;
    return self.plumbing.post(url, { persons: [{ evidence: [ self ] }] }).then(function(response){
      self.updateFromResponse(response, 'evidence-reference');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#delete
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @description delete this memory persona reference - see {@link memories.functions:deleteMemoryPersonaRef deleteMemoryPersonaRef}
   * @return {Object} promise for the response
   */
  delete: function() {
    return this.client.deleteMemoryPersonaRef(this.getMemoryPersonaRefUrl());
  }

});
},{"./../FamilySearch":5,"./../utils":57}],23:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc overview
 * @name name
 * @description
 * Name
 */

/**
 * @ngdoc function
 * @name name.types:constructor.Name
 * @description
 *
 * Name
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object|String=} data either a fullText string or an object with optional attributes
 * {type, givenName, surname, prefix, suffix, fullText, preferred, changeMessage}
 */
var Name = FS.Name = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(utils.isString(data)){
      this.data = {};
      this.setFullText(data);
    } else {
      if (data.type) {
        //noinspection JSUnresolvedFunction
        this.setType(data.type);
      }
      if (data.givenName) {
        //noinspection JSUnresolvedFunction
        this.setGivenName(data.givenName);
        delete data.givenName;
      }
      if (data.surname) {
        //noinspection JSUnresolvedFunction
        this.setSurname(data.surname);
        delete data.surname;
      }
      if (data.prefix) {
        //noinspection JSUnresolvedFunction
        this.setPrefix(data.prefix);
        delete data.prefix;
      }
      if (data.suffix) {
        //noinspection JSUnresolvedFunction
        this.setSuffix(data.suffix);
        delete data.suffix;
      }
      if (data.fullText) {
        //noinspection JSUnresolvedFunction
        this.setFullText(data.fullText);
        delete data.fullText;
      }
      //noinspection JSUnresolvedFunction
      this.setPreferred(!!data.preferred);
      if (data.changeMessage) {
        //noinspection JSUnresolvedFunction
        this.setChangeMessage(data.changeMessage);
        delete data.changeMessage;
      }
      if (data.attribution && !(data.attribution instanceof FS.Attribution)) {
        this.attribution = client.createAttribution(data.attribution);
      }
    }
  }
};

/**
 * @ngdoc function
 * @name name.functions:createName
 * @param {Object} data [Name](https://familysearch.org/developers/docs/api/gx/Name_json) data
 * @return {Object} {@link name.types:constructor.Name Name}
 * @description Create a {@link name.types:constructor.Name Name} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createName = function(data){
  return new Name(this, data);
};

// return the i'th name form; add it if it doesn't exist
function ensureNameForm(name, i) {
  var pos = i || 0; // just to be clear
  if (!utils.isArray(name.data.nameForms)) {
    name.data.nameForms = [];
  }
  while (pos >= name.data.nameForms.length) {
    name.data.nameForms.push({});
  }
  return name.data.nameForms[pos];
}

Name.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Name,
  
  /**
   * @ngdoc function
   * @name name.types:constructor.Name#getId
   * @methodOf name.types:constructor.Name
   * @return {String} Id of the name
   */

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#getType
   * @methodOf name.types:constructor.Name
   * @return {String} http://gedcomx.org/BirthName, etc.
   */
  getType: function(){ return this.data.type; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#isPreferred
   * @methodOf name.types:constructor.Name
   * @return {Boolean} true if this name is preferred
   */
  isPreferred: function(){ return this.data.preferred; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#getAttribution
   * @methodOf name.types:constructor.Name
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#getNameFormsCount
   * @methodOf name.types:constructor.Name

   * @return {Number} get the number of name forms
   */
  getNameFormsCount: function() { return this.data.nameForms ? this.data.nameForms.length : 0; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#getNameForm
   * @methodOf name.types:constructor.Name

   * @param {Number=} i name form to read; defaults to 0
   * @return {Number} get the `i`'th name form: each name form has `lang`, `fullText`, and `parts` properties
   */
  getNameForm: function(i) { return maybe(this.data.nameForms)[i || 0]; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#getFullText
   * @methodOf name.types:constructor.Name

   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the full text of the `i`'th name form
   */
  getFullText: function(i) { return maybe(this.getNameForm(i)).fullText; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#getLang
   * @methodOf name.types:constructor.Name

   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the language of the `i`'th name form
   */
  getLang: function(i) { return maybe(this.getNameForm(i)).lang; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#getNamePart
   * @methodOf name.types:constructor.Name

   * @description you can call getGivenName, getSurname, getPrefix, or getSuffix instead of this function
   * @param {String} type http://gedcomx.org/Given or http://gedcomx.org/Surname
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the specified part of the `i`'th name form
   */
  getNamePart: function(type, i) {
    return maybe(utils.find(maybe(this.getNameForm(i)).parts, {type: type})).value;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#getGivenName
   * @methodOf name.types:constructor.Name

   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the given part of the `i`'th name form
   */
  getGivenName: function(i) {
    return this.getNamePart('http://gedcomx.org/Given', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#getSurname
   * @methodOf name.types:constructor.Name

   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the surname part of the `i`'th name form
   */
  getSurname: function(i) {
    return this.getNamePart('http://gedcomx.org/Surname', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#getPrefix
   * @methodOf name.types:constructor.Name

   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the prefix part of the `i`'th name form
   */
  getPrefix: function(i) {
    return this.getNamePart('http://gedcomx.org/Prefix', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#getSuffix
   * @methodOf name.types:constructor.Name

   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the suffix part of the `i`'th name form
   */
  getSuffix: function(i) {
    return this.getNamePart('http://gedcomx.org/Suffix', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#setType
   * @methodOf name.types:constructor.Name

   * @description sets the changed flag as well as the value
   * @param {String} type e.g., http://gedcomx.org/BirthName
   * @return {Name} this name
   */
  setType: function(type) {
    this.changed = true;
    if (!!type) {
      this.data.type = type;
    }
    else {
      delete this.data.type;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#setPreferred
   * @methodOf name.types:constructor.Name

   * @description sets the changed flag as well as the value
   *
   * __NOTE__: the preferred name flag can be set only when the person is initially created; after that it is read-only
   * @param {boolean} isPreferred true if preferred
   * @return {Name} this name
   */
  setPreferred: function(isPreferred) {
    this.changed = true;
    this.data.preferred = isPreferred;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#setFullText
   * @methodOf name.types:constructor.Name

   * @description sets the changed flag as well as the value
   * @param {String} fullText value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  setFullText: function(fullText, i) {
    this.changed = true;
    var nameForm = ensureNameForm(this, i);
    if (!!fullText) {
      nameForm.fullText = fullText;
    }
    else {
      delete nameForm.fullText;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#setNamePart
   * @methodOf name.types:constructor.Name

   * @description sets the changed flag as well as the value;
   * you can call setGivenName, setSurname, setPrefix, and setSuffix instead of this function
   * @param {String} name value
   * @param {String} type http://gedcomx.org/Given or http://gedcomx.org/Surname
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  setNamePart: function(name, type, i) {
    this.changed = true;
    var nameForm = ensureNameForm(this, i);
    if (!utils.isArray(nameForm.parts)) {
      nameForm.parts = [];
    }
    var part = utils.find(nameForm.parts, {type: type});
    if (!!name) {
      if (!part) {
        part = {type: type};
        nameForm.parts.push(part);
      }
      part.value = name;
    }
    else if (!!part) {
      nameForm.parts.splice(nameForm.parts.indexOf(part), 1);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#setGivenName
   * @methodOf name.types:constructor.Name

   * @description sets the changed flag as well as the value
   * @param {String} givenName value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  setGivenName: function(givenName, i) {
    return this.setNamePart(givenName, 'http://gedcomx.org/Given', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#setSurname
   * @methodOf name.types:constructor.Name

   * @description sets the changed flag as well as the value
   * @param {String} surname value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  setSurname: function(surname, i) {
    return this.setNamePart(surname, 'http://gedcomx.org/Surname', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#setPrefix
   * @methodOf name.types:constructor.Name

   * @description sets the changed flag as well as the value
   * @param {String} prefix value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  setPrefix: function(prefix, i) {
    return this.setNamePart(prefix, 'http://gedcomx.org/Prefix', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#setSuffix
   * @methodOf name.types:constructor.Name

   * @description sets the changed flag as well as the value
   * @param {String} suffix value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  setSuffix: function(suffix, i) {
    return this.setNamePart(suffix, 'http://gedcomx.org/Suffix', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#setChangeMessage
   * @methodOf name.types:constructor.Name

   * @description sets the changeMessage used to update the name
   * @param {String} changeMessage change message
   * @return {Name} this name
   */
  setChangeMessage: function(changeMessage) {
    this.setAttribution(this.client.createAttribution(changeMessage));
    //noinspection JSValidateTypes
    return this;
  }
});

},{"./../FamilySearch":5,"./../utils":57}],24:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name notes.types:constructor.Note
 * @description
 *
 * Note
 * 
 * To create a new note, you must set subject and text.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {subject, text, attribution}
 */
var Note = FS.Note = function(client, data) {
  FS.BaseClass.call(this, client, data);
  if(this.attribution && !(this.attribution instanceof FS.Attribution)){
    this.attribution = client.createAttribution(this.attribution);
  }
};

/**
 * @ngdoc function
 * @name notes.functions:createNote
 * @param {Object} data [Note](https://familysearch.org/developers/docs/api/gx/Note_json) data
 * @return {Object} {@link notes.types:constructor.Note Note}
 * @description Create a {@link notes.types:constructor.Note Note} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createNote = function(data){
  return new Note(this, data);
};

Note.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Note,
  
  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#getId
   * @methodOf notes.types:constructor.Note
   * @return {String} Id of the note
   */

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#getSubject
   * @methodOf notes.types:constructor.Note
   * @return {String} subject / title of the note
   */
  getSubject: function() { return this.data.subject; },

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#getText
   * @methodOf notes.types:constructor.Note
   * @return {String} text of the note
   */
  getText: function() { return this.data.text; },

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#getNoteUrl
   * @methodOf notes.types:constructor.Note

   * @return {String} note URL (without the access token)
   */
  getNoteUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('note')).href); },

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#save
   * @methodOf notes.types:constructor.Note

   * @description
   * Create a new note (if this note does not have an id) or update the existing note.
   *
   *
   * @param {string} url url of the notes list endpoint; only necessary when creating a new note
   * @param {string} changeMessage change message
   * @return {Object} promise for the response
   * and if refresh is true, after the note has been read.
   */
  save: function(url, changeMessage) {
    var self = this;
    if(!url){
      url = self.getNoteUrl();
    }
    var headers = {};
    var entityType = self.helpers.getEntityType(url);
    if (entityType === 'childAndParentsRelationships') {
      headers['Content-Type'] = 'application/x-fs-v1+json';
    }
    var payload = {};
    payload[entityType] = [ { notes: [ self ] } ];
    if (changeMessage) {
      payload[entityType][0].attribution = self.client.createAttribution(changeMessage);
    }
    return self.plumbing.post(url, payload, headers).then(function(response){
      self.updateFromResponse(response, 'note');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#delete
   * @methodOf notes.types:constructor.Note

   * @description delete this note
   * @param {string=} changeMessage change message
   * @return {Object} promise for the response
   */
  delete: function(changeMessage) {
    return this.client.deleteNote(this.getNoteUrl(), changeMessage);
  }

});
},{"./../FamilySearch":5,"./../utils":57}],25:[function(require,module,exports){
var FS = require('../FamilySearch'),
    utils = require('../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc function
 * @name person.types:constructor.Person
 * @description
 *
 * Person
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 * Two methods to note below are _save_ and _delete_.
 * _save_ persists the changes made to names, facts, and gender;
 * _delete_ removes the person.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {gender, names, facts}.
 * _gender_ is a string.
 * _names_ is an array of Name's, or Objects or strings to pass into the Name constructor.
 * _facts_ is an array of Fact's or Objects to pass into the Fact constructor.
 */
var Person = FS.Person = function(client, data) {
  FS.BaseClass.call(this, client, data);
  if (data) {
    if (data.gender) {
      this.setGender(data.gender);
    }
    if (data.names) {
      utils.forEach(this.data.names, function(name, i){
        if(!(name instanceof FS.Name)){
          this.data.names[i] = client.createName(name);
        }
      }, this);
    }
    if (data.facts) {
      utils.forEach(this.data.facts, function(fact, i){
        if(!(fact instanceof FS.Fact)){
          this.data.facts[i] = client.createFact(fact);
        }
      }, this);
    }
  }
};

/**
 * @ngdoc function
 * @name person.functions:createPerson
 * @param {Object} data [Person](https://familysearch.org/developers/docs/api/gx/Person_json) data
 * @return {Object} {@link person.types:constructor.Person Person}
 * @description Create a {@link person.types:constructor.Person Person} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createPerson = function(data){
  return new Person(this, data);
};

function spacePrefix(namePiece) {
  return namePiece ? ' ' + namePiece : '';
}

Person.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Person,
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getId
   * @methodOf person.types:constructor.Person
   * @return {String} Id of the person
   */

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#isLiving
   * @methodOf person.types:constructor.Person
   * @return {Boolean} true or false
   */
  isLiving: function() { return this.data.living; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplay
   * @methodOf person.types:constructor.Person
   * @return {Object} includes `birthDate`, `birthPlace`, `deathDate`, `deathPlace`, `gender`, `lifespan`, and `name` attributes
   */
  getDisplay: function() { return maybe(this.data.display); },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getIdentifiers
   * @methodOf person.types:constructor.Person
   * @return {Object} map of identifiers to arrays of values
   */
  getIdentifiers: function() { return maybe(this.data.identifiers); },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getGender
   * @methodOf person.types:constructor.Person
   * @return {Gender} gender
   */
  getGender: function() { return this.data.gender; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#isReadOnly
   * @methodOf person.types:constructor.Person
   * @description
   * This function is available only if the person is read with `getPerson` or `getPersonWithRelationships`.
   * @returns {Boolean} true if the person is read-only
   */
  // this function is added when an api response is processed because the information
  // is contained in the http headers

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getFacts
   * @methodOf person.types:constructor.Person

   * @param {string=} type if present, return only facts with this type
   * @return {Fact[]} an array of {@link fact.types:constructor.Fact Facts}
   */
  getFacts: function(type) {
    return (type ? utils.filter(this.data.facts, {type: type}) : this.data.facts) || [];
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getFact
   * @methodOf person.types:constructor.Person

   * @param {string} type fact type; e.g., http://gedcomx.org/Birth
   * @return {Fact} return first {@link fact.types:constructor.Fact Fact} having specified type
   */
  getFact: function(type) {
    return utils.find(this.data.facts, function(fact){
      return fact.getType() === type;
    });
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getBirth
   * @methodOf person.types:constructor.Person

   * @return {Fact} Birth {@link fact.types:constructor.Fact Fact}
   */
  getBirth: function() {
    return this.getFact('http://gedcomx.org/Birth');
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getBirthDate
   * @methodOf person.types:constructor.Person

   * @return {string} Birth date
   */
  getBirthDate: function() {
    var fact = this.getBirth();
    return fact ? fact.getOriginalDate() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getBirthPlace
   * @methodOf person.types:constructor.Person

   * @return {string} Birth place
   */
  getBirthPlace: function() {
    var fact = this.getBirth();
    return fact ? fact.getOriginalPlace() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getChristening
   * @methodOf person.types:constructor.Person

   * @return {Fact} Christening {@link fact.types:constructor.Fact Fact}
   */
  getChristening: function() {
    return this.getFact('http://gedcomx.org/Christening');
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getChristeningDate
   * @methodOf person.types:constructor.Person

   * @return {string} Christening date
   */
  getChristeningDate: function() {
    var fact = this.getChristening();
    return fact ? fact.getOriginalDate() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getChristeningPlace
   * @methodOf person.types:constructor.Person

   * @return {string} Christning place
   */
  getChristeningPlace: function() {
    var fact = this.getChristening();
    return fact ? fact.getOriginalPlace() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDeath
   * @methodOf person.types:constructor.Person

   * @return {Fact} Death {@link fact.types:constructor.Fact Fact}
   */
  getDeath: function() {
    return this.getFact('http://gedcomx.org/Death');
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDeathDate
   * @methodOf person.types:constructor.Person

   * @return {string} Death date
   */
  getDeathDate: function() {
    var fact = this.getDeath();
    return fact ? fact.getOriginalDate() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDeathPlace
   * @methodOf person.types:constructor.Person

   * @return {string} Death place
   */
  getDeathPlace: function() {
    var fact = this.getDeath();
    return fact ? fact.getOriginalPlace() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getBurial
   * @methodOf person.types:constructor.Person

   * @return {Fact} Burial {@link fact.types:constructor.Fact Fact}
   */
  getBurial: function() {
    return this.getFact('http://gedcomx.org/Burial');
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getBurialDate
   * @methodOf person.types:constructor.Person

   * @return {string} Burial date
   */
  getBurialDate: function() {
    var fact = this.getBurial();
    return fact ? fact.getOriginalDate() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getBurialPlace
   * @methodOf person.types:constructor.Person

   * @return {string} Birth place
   */
  getBurialPlace: function() {
    var fact = this.getBurial();
    return fact ? fact.getOriginalPlace() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayBirthDate
   * @methodOf person.types:constructor.Person

   * @return {String} birth date
   */
  getDisplayBirthDate: function() { return this.getDisplay().birthDate; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayBirthPlace
   * @methodOf person.types:constructor.Person

   * @return {String} birth place
   */
  getDisplayBirthPlace: function() { return this.getDisplay().birthPlace; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayDeathDate
   * @methodOf person.types:constructor.Person

   * @return {String} death date
   */
  getDisplayDeathDate: function() { return this.getDisplay().deathDate; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayDeathPlace
   * @methodOf person.types:constructor.Person

   * @return {String} death place
   */
  getDisplayDeathPlace: function() { return this.getDisplay().deathPlace; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayGender
   * @methodOf person.types:constructor.Person

   * @return {String} gender - Male or Female
   */
  getDisplayGender: function() { return this.getDisplay().gender; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayLifeSpan
   * @methodOf person.types:constructor.Person

   * @returns {string} birth year - death year
   */
  getDisplayLifeSpan: function() { return this.getDisplay().lifespan; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayName
   * @methodOf person.types:constructor.Person

   * @return {string} display name
   */
  getDisplayName: function() { return this.getDisplay().name; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getNames
   * @methodOf person.types:constructor.Person

   * @param {string=} type if present, return only names with this type
   * @return {Name[]} an array of {@link name.types:constructor.Name Names}
   */
  getNames: function(type) {
    return (type ? utils.filter(this.data.names, function(n){ return n.getType() === type; }) : this.data.names) || [];
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getPreferredName
   * @methodOf person.types:constructor.Person

   * @return {string} preferred {@link name.types:constructor.Name Name}
   */
  getPreferredName: function() { return utils.findOrFirst(this.data.names, function(n){ return n.isPreferred(); }); },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getGivenName
   * @methodOf person.types:constructor.Person

   * @return {String} preferred given name
   */
  getGivenName: function() {
    var name = this.getPreferredName();
    if (name) {
      name = name.getGivenName();
    }
    return name;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getSurname
   * @methodOf person.types:constructor.Person

   * @return {String} preferred surname
   */
  getSurname: function() {
    var name = this.getPreferredName();
    if (name) {
      name = name.getSurname();
    }
    return name;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getPersistentIdentifier
   * @methodOf person.types:constructor.Person

   * @return {String} persistent identifier
   */
  getPersistentIdentifier: function() { return maybe(this.getIdentifiers()['http://gedcomx.org/Persistent'])[0]; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getPersonUrl
   * @methodOf person.types:constructor.Person

   * @return {String} Url of the person
   */
  getPersonUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('person')).href); },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getChanges
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Get change history for a person
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_History_resource FamilySearch API Docs}
   *
   *
   * @param {String} pid id of the person or full URL of the person changes endpoint
   * @param {Object=} params `count` is the number of change entries to return, `from` to return changes following this id
   * @return {Object} promise for the {@link changeHistory.functions:getPersonChanges getPersonChanges} response
   */
  getChanges: function(params) {
    var self = this;
    return self.getLinkPromise('change-history').then(function(link) {
      return self.client.getChanges(link.href, params);
    });
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDiscussionRefs
   * @methodOf person.types:constructor.Person

   * @return {Object} promise for the {@link discussions.functions:getPersonDiscussionRefs getPersonDiscussionRefs} response
   */
  getDiscussionRefs: function() {
    return this.client.getPersonDiscussionRefs(this.helpers.removeAccessToken(maybe(this.getLink('discussion-references')).href));
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getMemoryPersonaRefs
   * @methodOf person.types:constructor.Person

   * @return {Object} promise for the {@link memories.functions:getMemoryPersonaRefs getMemoryPersonaRefs} response
   */
  getMemoryPersonaRefs: function() {
    return this.client.getMemoryPersonaRefs(this.helpers.removeAccessToken(maybe(this.getLink('evidence-references')).href));
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getNotes
   * @methodOf person.types:constructor.Person

   * @return {Object} promise for the {@link notes.functions:getPersonNotes getPersonNotes} response
   */
  getNotes: function() {
    return this.client.getPersonNotes(this.helpers.removeAccessToken(maybe(this.getLink('notes')).href));
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getSourceRefs
   * @methodOf person.types:constructor.Person

   * @return {Object} promise for the {@link sources.functions:getPersonSourceRefs getPersonSourceRefs} response
   */
  getSourceRefs: function() {
    return this.client.getPersonSourceRefs(this.getId());
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getSources
   * @methodOf person.types:constructor.Person

   * @return {Object} promise for the {@link sources.functions:getPersonSourcesQuery getPersonSourcesQuery} response
   */
  getSources: function() {
    return this.client.getPersonSourcesQuery(this.getId());
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getSpouses
   * @methodOf person.types:constructor.Person
   *
   * @description
   * Get the relationships to a person's spouses. The response may include child and parents
   * relationships because two people can be the parent of a child without an explicit
   * couple relationship; this method returns those implied relationships.
   * The response includes the following convenience functions:
   *
   * - `getCoupleRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents}
   * relationships for children of the couples
   * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship except children
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Spouses_of_a_Person_resource FamilySearch API Docs}
   *
   *
   * @return {Object} promise for the response
   */
  getSpouses: function() {
    var self = this;
    return self.getLinkPromise('spouses').then(function(link) {
      return self.plumbing.get(link.href);
    }).then(function(response){
      return self.client._personsAndRelationshipsMapper(response);
    });
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getSpouseRelationships
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Get the spouse relationships for a person. Use the `persons` param to also
   * get {@link person.types:constructor.Person Person} objects for the spouses. 
   * Use {@link person.types:constructor.Person#getSpouses getSpouses}
   * method if you also want implied spouse relationships (listed together as 
   * parents in a child and parents relationship but no explicit couple relationship).
   * The response includes the following convenience function:
   * 
   * - `getCoupleRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships.
   * - `getPerson(id)` - a {@link person.types:constructor.Person Person} for any person id in any
   * couple relationship in the response.
   * 
   * @param {Object=} params if `persons` is set (the value doesn't matter) then the response will include
   * person objects for the spouses in the couple relationships.
   * @return {Object} promise for the response. This is only available when the `persons` parameter is set.
   */
  getSpouseRelationships: function(params){
    var self = this;
    return self.getLinkPromise('spouse-relationships').then(function(link){
      return self.plumbing.get(link.href, params);
    }).then(function(response){
      return self.client._personsAndRelationshipsMapper(response);
    });
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getParents
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Get the relationships to a person's parents, person objects for the
   * parents, and couple relationships for the parents (when a relationship exists).
   * The response includes the following convenience functions
   *
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
   * - `getCoupleRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships for parents
   * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Parents_of_a_Person_resource FamilySearch API Docs}
   *
   *
   * @return {Object} promise for the response
   */
  getParents: function() {
    var self = this;
    return self.getLinkPromise('parents').then(function(link) {
      return self.plumbing.get(link.href);
    }).then(function(response){
      return self.client._personsAndRelationshipsMapper(response);
    });
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getParentRelationships
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Get the parent relationships for a person. Use the `persons` param to also
   * get {@link person.types:constructor.Person Person} objects for the parents.
   * Use {@link person.types:constructor.Person#getParents getParents} method 
   * if you also want couple relationships for the parents.
   * The response includes the following convenience function:
   * 
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
   * - `getPerson(id)` - a {@link person.types:constructor.Person Person} for any person id in any
   * relationship in the response.
   * 
   * @param {Object=} params if `persons` is set (the value doesn't matter) then the response will include
   * person objects for all parents in the relationships.
   * @return {Object} promise for the response. This is only available when the `persons` parameter is set.
   */
  getParentRelationships: function(params){
    var self = this;
    return self.getLinkPromise('parent-relationships').then(function(link){
      return self.plumbing.get(link.href, params);
    }).then(function(response){
      return self.client._personsAndRelationshipsMapper(response);
    });
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getChildren
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Get the relationships to a person's children
   * The response includes the following convenience functions
   *
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
   * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Children_of_a_Person_resource FamilySearch API Docs}
   *
   *
   * @return {Object} promise for the response
   */
  getChildren: function() {
    var self = this;
    return self.getLinkPromise('children').then(function(link) {
      return self.plumbing.get(link.href);
    }).then(function(response){
      return self.client._personsAndRelationshipsMapper(response);
    });
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getChildRelationships
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Get the child relationships for a person. Use the `persons` param to also
   * get {@link person.types:constructor.Person Person} objects for the children.
   * You may also use {@link person.types:constructor.Person#getChildren getChildren} method 
   * to get {@link person.types:constructor.Person Person} objects for the children.
   * The response includes the following convenience function:
   * 
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
   * - `getPerson(id)` - a {@link person.types:constructor.Person Person} for any person id in any
   * relationship in the response. This is only available when the `persons` parameter is set.
   * 
   * @param {Object=} params if `persons` is set (the value doesn't matter) then the response will include
   * person objects for all children in the relationships.
   * @return {Object} promise for the response
   */
  getChildRelationships: function(params){
    var self = this;
    return self.getLinkPromise('child-relationships').then(function(link){
      return self.plumbing.get(link.href, params);
    }).then(function(response){
      return self.client._personsAndRelationshipsMapper(response);
    });
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getMatches
   * @methodOf person.types:constructor.Person
   * @return {Object} promise for the {@link searchAndMatch.functions:getPersonMatches getPersonMatches} response
   */
  getMatches: function() {
    return this.client.getPersonMatches(this.getId());
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getAncestry
   * @methodOf person.types:constructor.Person
   * @param {Object=} params include `generations` to retrieve max 8, `spouse` id to get ancestry of person and spouse,
   * `personDetails` set to true to retrieve full person objects for each ancestor
   * @return {Object} promise for the {@link pedigree.functions:getAncestry getAncestry} response
   */
  getAncestry: function(params) {
    return this.client.getAncestry(this.getId(), params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDescendancy
   * @methodOf person.types:constructor.Person
   * @param {Object=} params include `generations` to retrieve max 2, `spouse` id to get descendency of person and spouse
   * @return {Object} promise for the {@link pedigree.functions:getDescendancy getDescendancy} response
   */
  getDescendancy: function(params) {
    return this.client.getDescendancy(this.getId(), params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getPersonPortraitUrl
   * @methodOf person.types:constructor.Person
   * @param {Object=} params `default` URL to redirect to if portrait doesn't exist;
   * `followRedirect` if true, follow the redirect and return the final URL
   * @return {Object} promise for the {@link memories.functions:getPersonPortraitUrl getPersonPortraitUrl} response
   */
  getPersonPortraitUrl: function(params) {
    return this.client.getPersonPortraitUrl(this.getLink('portrait').href, params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#setNames
   * @methodOf person.types:constructor.Person

   * @param {Name[]|Object[]|string[]} values names to set; if an array element is not a Name, it is passed into the Name constructor
   * @param {string=} changeMessage change message to use for deleted names if any
   * @return {Person} this person
   */
  setNames: function(values, changeMessage) {
    if (utils.isArray(this.data.names)) {
      utils.forEach(this.data.names, function(name) {
        this.deleteName(name, changeMessage);
      }, this);
    }
    this.data.names = [];
    utils.forEach(values, function(value) {
      this.addName(value);
    }, this);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#addName
   * @methodOf person.types:constructor.Person

   * @param {Name|Object|string} value name to add; if value is not a Name, it is passed into the Name constructor
   * @return {Person} this person
   */
  addName: function(value) {
    if (!utils.isArray(this.data.names)) {
      this.data.names = [];
    }
    if (!(value instanceof FS.Name)) {
      value = this.client.createName(value);
    }
    this.data.names.push(value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#deleteName
   * @methodOf person.types:constructor.Person

   * @param {Name|string} value name or name id to remove
   * @param {String=} changeMessage change message
   * @return {Person} this person
   */
  deleteName: function(value, changeMessage) {
    if (!(value instanceof FS.Name)) {
      value = utils.find(this.data.names, function(name){
        return name.getId() === value;
      });
    }
    var pos = utils.indexOf(this.data.names, value);
    if (pos >= 0) {
      // add name to deleted map
      if (!this.deletedConclusions) {
        this.deletedConclusions = {};
      }
      this.deletedConclusions[value.getId()] = changeMessage;
      // remove name from array
      this.data.names.splice(pos,1);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#setFacts
   * @methodOf person.types:constructor.Person

   * @param {Fact[]|Object[]} values facts to set; if an array element is not a Fact, it is passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {Person} this person
   */
  setFacts: function(values, changeMessage) {
    if (utils.isArray(this.data.facts)) {
      utils.forEach(this.data.facts, function(fact) {
        this.deleteFact(fact, changeMessage);
      }, this);
    }
    this.data.facts = [];
    utils.forEach(values, function(value) {
      this.addFact(value);
    }, this);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#addFact
   * @methodOf person.types:constructor.Person

   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {Person} this person
   */
  addFact: function(value) {
    if (!utils.isArray(this.data.facts)) {
      this.data.facts = [];
    }
    if (!(value instanceof FS.Fact)) {
      value = this.client.createFact(value);
    }
    this.data.facts.push(value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#deleteFact
   * @methodOf person.types:constructor.Person

   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {Person} this person
   */
  deleteFact: function(value, changeMessage) {
    if (!(value instanceof FS.Fact)) {
      value = utils.find(this.data.facts, function(fact){
        return fact.getId() === value;
      });
    }
    var pos = utils.indexOf(this.data.facts, value);
    if (pos >= 0) {
      // add fact to deleted map
      if (!this.deletedConclusions) {
        this.deletedConclusions = {};
      }
      this.deletedConclusions[value.getId()] = changeMessage;
      // remove fact from array
      this.data.facts.splice(pos,1);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#setGender
   * @methodOf person.types:constructor.Person

   * @param {String|Object} gender e.g., http://gedcomx.org/Female
   * @param {String=} changeMessage change message
   * @return {Person} this person
   */
  setGender: function(gender, changeMessage) {
    if (utils.isString(gender)) {
      this.data.gender = this.client.createGender().setType(gender);
    } else {
      this.data.gender = this.client.createGender(gender);
    }
    if (changeMessage) {
      this.data.gender.setAttribution(changeMessage);
    }
    return this;
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#addSource
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Attach a source to this person. This will create a source description (if
   * it doesn't already exist) and a source reference for you.
   * 
   * @param {Object} sourceDescription Data for the source description or a
   * {@link sources.types:constructor.SourceDescription SourceDescription} object.
   * @param {String=} changeMessage change message
   * @param {String[]=} tags an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
   * @return {Object} promise for the {@link sources.types:constructor.SourceRef#save SourceRef.save()} response
   */
  addSource: function(sourceDescription, changeMessage, tags){
    return this.client._createAndAttachSource(this, sourceDescription, changeMessage, tags);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#save
   * @methodOf person.types:constructor.Person
   * @description
   * Create a new person (if this person does not have an id) or update the existing person.
   * Multiple HTTP requests may be needed when conslusions are deleted. Therefore
   * the returned promises resolves with an array of responses. After being created,
   * the person's ID and links will be updated from HTTP headers in the response.
   *
   * 
   * {@link https://familysearch.org/developers/docs/api/tree/Create_Person_usecase API Docs}
   *
   * @param {String=} changeMessage default change message to use when name/fact/gender-specific changeMessage is not specified
   * @return {Object} promise that is resolved with an array of responses for all HTTP requests that were made
   */
  save: function(changeMessage) {
    var postData = this.client.createPerson();
    var isChanged = false;
    
    // updating existing person
    if (this.getId()) {
      postData.setId(this.getId()); 
    }

    // if person is new, default a few things
    else {
      // default gender to unknown
      if (!this.data.gender) {
        this.setGender('http://gedcomx.org/Unknown');
      }
      // default name to Unknown if no names
      if (this.getNames().length === 0) {
        this.addName({fullText: 'Unknown', givenName: 'Unknown'});
      }
      // default first name to preferred if no names are preferred
      if (!utils.find(this.getNames(), function(name){ return name.isPreferred(); })) {
        this.getNames()[0].setPreferred(true);
      }
      // default name type to birth name if there is only one name
      if (this.getNames().length === 1 && !this.getNames()[0].type) {
        this.getNames()[0].setType('http://gedcomx.org/BirthName');
      }
      // default living status to false
      if (utils.isUndefined(this.data.living)) {
        this.data.living = false;
      }
    }

    // set global changeMessage
    if (changeMessage) {
      postData.setAttribution(changeMessage);
    }
    
    // if new person, send living status
    if (!this.getId()) {
      postData.data.living = this.data.living;
    }

    // send gender if gender is new or changed
    if (this.data.gender && (!this.data.gender.id || this.data.gender.changed)) {
      postData.data.gender = this.data.gender;
      delete postData.data.gender.changed;
      isChanged = true;
    }

    // send names that are new or updated
    utils.forEach(this.getNames(), function(name) {
      if (!name.getId() || name.changed) {
        // default full text if not set
        if (!name.getFullText()) {
          name.setFullText((spacePrefix(name.getPrefix()) + spacePrefix(name.getGivenName()) +
                             spacePrefix(name.getSurname()) + spacePrefix(name.getSuffix())).trim());
        }
        postData.addName(name);
        isChanged = true;
      }
    });

    // send facts that are new or updated
    utils.forEach(this.getFacts(), function(fact) {
      if (!fact.getId() || fact.changed) {
        postData.addFact(fact);
        isChanged = true;
      }
    });

    var promises = [],
        self = this;

    // post update
    if (isChanged) {
      var urlPromise = postData.getId() ? self.plumbing.getCollectionUrl('FSFT', 'person', {pid: postData.getId()}) : self.plumbing.getCollectionUrl('FSFT', 'persons');
      promises.push(
        urlPromise.then(function(url) {
          return self.plumbing.post(url, { persons: [ postData ] });
        }).then(function(response){
          self.updateFromResponse(response, 'person');
          return response;
        })
      );
    }

    // post deletions
    if (this.getId() && this.deletedConclusions) {
      utils.forEach(this.deletedConclusions, function(value, key) {
        value = value || changeMessage; // default to global change message
        promises.push(self.plumbing.getCollectionUrl('FSFT', 'person', {pid: postData.getId()})
        .then(function(personUrl) {
          // TODO: Conclusions have their url embedded; use that
          return self.plumbing.del(personUrl + '/conclusions/' + key, value ? {'X-Reason': value} : {});
        }));
      });
    }

    // wait for all promises to be fulfilled
    return Promise.all(promises);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#delete
   * @methodOf person.types:constructor.Person

   * @description delete this person - see {@link person.functions:deletePerson deletePerson}
   * @param {string} changeMessage change message
   * @return {Object} promise for the person URL
   */
  delete: function(changeMessage) {
    return this.client.deletePerson(this.getPersonUrl(), changeMessage);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#restore
   * @methodOf person.types:constructor.Person

   *
   * @description
   * Restore a person that was deleted.
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Restore_resource FamilySearch API Docs}
   * 
   *
   * @return {Object} promise for the request
   */
  restore: function() {
    var self = this;
    return self.getLinkPromise('restore').then(function(link){
      return self.plumbing.post(link.href, null, {'Content-Type': 'application/x-fs-v1+json'});
    });
  }
});

},{"../FamilySearch":5,"../utils":57}],26:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name places.types:constructor.PlaceDescription
 * @description
 *
 * Place description returned by the Place Authority.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var PlaceDescription = FS.PlaceDescription = function(client, data){ 
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(data.names){
      utils.forEach(this.data.names, function(name, i){
        if(!(name instanceof FS.TextValue)){
          this.data.names[i] = client.createTextValue(name);
        }
      }, this);
    }
  }
};

/**
 * @ngdoc function
 * @name places.functions:createPlaceDescription
 * @param {Object} data [PlaceDescription](https://familysearch.org/developers/docs/api/gx/PlaceDescription_json) data
 * @return {Object} {@link places.types:constructor.PlaceDescription PlaceDescription}
 * @description Create a {@link places.types:constructor.PlaceDescription PlaceDescription} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createPlaceDescription = function(data){
  return new PlaceDescription(this, data);
};

PlaceDescription.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: PlaceDescription,
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getId
   * @methodOf places.types:constructor.PlaceDescription
   * @return {string} place id
   */
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getNames
   * @methodOf places.types:constructor.PlaceDescription
   * @return {TextValue[]} An array of names. The preferred value is first.
   */
  getNames: function(){ return utils.maybe(this.data.names);  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getLang
   * @methodOf places.types:constructor.PlaceDescription
   * @return {string} The language of the Place Description. See [http://www.w3.org/International/articles/language-tags/](http://www.w3.org/International/articles/language-tags/)
   */
  getLang: function(){ return this.data.lang; },

  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getIdentifiers
   * @methodOf places.types:constructor.PlaceDescription
   * @return {Object} map of identifiers to arrays of values
   */
  getIdentifiers: function(){ return utils.maybe(this.data.identifiers); },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getTypeUri
   * @methodOf places.types:constructor.PlaceDescription
   * @return {string} A URI used to identify the type of a place.
   */
  getTypeUri: function(){ return this.data.type; },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getLatitude
   * @methodOf places.types:constructor.PlaceDescription
   * @return {number} Degrees north or south of the Equator (0.0 degrees). Values range from −90.0 degrees (south) to 90.0 degrees (north).
   */
  getLatitude: function(){ return this.data.latitude; },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getLongitude
   * @methodOf places.types:constructor.PlaceDescription
   * @return {number} Angular distance in degrees, relative to the Prime Meridian. Values range from −180.0 degrees (west of the Meridian) to 180.0 degrees (east of the Meridian).
   */
  getLongitude: function(){ return this.data.longitude; },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getTemporalDescription
   * @methodOf places.types:constructor.PlaceDescription
   * @return {Object} A description of the time period to which this place description is relevant.
   */
  getTemporalDescription: function(){ return utils.maybe(this.data.temporalDescription); },

  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getDisplay
   * @methodOf places.types:constructor.PlaceDescription
   * @return {Object} includes `name`, `fullName`, and `type` attributes
   */
  getDisplay: function(){ return utils.maybe(this.data.display); },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getName
   * @methodOf places.types:constructor.PlaceDescription
   * @return {String} The name of this place as listed in the display properties.
   */
  getName: function(){
    return this.getDisplay().name;
  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getFullName
   * @methodOf places.types:constructor.PlaceDescription
   * @return {String} The fully qualified name (e.g. includes the name of parent jursdictions) of this place as listed in the display properties
   */
  getFullName: function(){
    return this.getDisplay().fullName;
  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getType
   * @methodOf places.types:constructor.PlaceDescription
   * @return {String} The type as listed in the display properties.
   */
  getType: function(){
    return this.getDisplay().type;
  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getPlaceDescriptionUrl
   * @methodOf places.types:constructor.PlaceDescription
   * @return {String} The place description's url without the access token
   */
  getPlaceDescriptionUrl: function(){
    return this.helpers.removeAccessToken(utils.maybe(this.getLink('description')).href);
  },
   
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getJurisdictionSummary
   * @methodOf places.types:constructor.PlaceDescription
   * @description Get a summary of the jurisdiction's place description, when available. Useful
   * for place descriptions returned by {@link places.functions:getPlaceDescription} if you just
   * want the names and ids of all place descriptions in the jurisdiction chain. If you want
   * more details then use {@link places.types:constructor.PlaceDescription#getJurisdictionDetails}.
   * @return {PlaceDescription} A summary PlaceDescription for this PlaceDescription's jurisdiction.
   */
  getJurisdictionSummary: function() {
    if(this.data.jurisdiction instanceof FS.PlaceDescription){
      return this.data.jurisdiction;
    }
  },
   
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#getJurisdictionDetails
   * @methodOf places.types:constructor.PlaceDescription
   * @description Get the full details of the jurisdiction's PlaceDescription. The promise
   * will fail if no jurisdiction is available.
   * @return {Object} A promise for the response of retrieving the details for the jursdiction
   */
  getJurisdictionDetails: function() {
    if(this.data.jurisdiction instanceof FS.PlaceDescription){
      return this.client.getPlaceDescription(this.data.jurisdiction.getPlaceDescriptionUrl());
    } else {
      return Promise.reject(new Error('No jurisdiction available'));
    }
  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#setJurisdiction
   * @methodOf places.types:constructor.PlaceDescription
   * @param {Object} A json object representing the new jursidication data, or a PlaceDescription object.
   * @return {PlaceDescription} this object
   */
  setJurisdiction: function(jurisdiction){
    if(!(jurisdiction instanceof FS.PlaceDescription)){
      jurisdiction = this.client.createPlaceDescription(jurisdiction);
    }
    this.data.jurisdiction = jurisdiction;
    return this;
  }

});
},{"./../FamilySearch":5,"./../utils":57}],27:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name places.types:constructor.PlaceReference
 * @description
 *
 * Place reference as used in Facts.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var PlaceReference = FS.PlaceReference = function(client, data){ 
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(utils.isString(data.normalized)){
      this.setNormalized(data.normalized);
    }
  }
};

/**
 * @ngdoc function
 * @name places.functions:createPlaceReference
 * @param {Object} data [PlaceReference](https://familysearch.org/developers/docs/api/gx/PlaceReference_json) data
 * @return {Object} {@link places.types:constructor.PlaceReference PlaceReference}
 * @description Create a {@link places.types:constructor.PlaceReference PlaceReference} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createPlaceReference = function(data){
  return new PlaceReference(this, data);
};

PlaceReference.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: PlaceReference,
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceReference#getOriginal
   * @methodOf places.types:constructor.PlaceReference
   * @return {string} The original place value.
   */
  getOriginal: function(){ return this.data.original; },
   
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceReference#getNormalized
   * @methodOf places.types:constructor.PlaceReference
   * @return {string} The normalized place value.
   */
  getNormalized: function(){ return utils.maybe(utils.maybe(this.data.normalized)[0]).value; },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceReference#setOriginal
   * @methodOf places.types:constructor.PlaceReference
   * @param {string} original original place value
   * @return {PlaceReference} this PlaceReference
   */
  setOriginal: function(original){
    this.data.original = original;
    return this;
  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceReference#setOriginal
   * @methodOf places.types:constructor.PlaceReference
   * @param {string} normalized normalized place value
   * @return {PlaceReference} this PlaceReference
   */
  setNormalized: function(normalized){
    this.data.normalized = [{
      value: normalized
    }];
    return this;
  }
  
});
},{"./../FamilySearch":5,"./../utils":57}],28:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name places.types:constructor.PlacesSearchResult
 * @description
 *
 * A places search result entry.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var PlacesSearchResult = FS.PlacesSearchResult = function(client, data){ 
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(data.content && data.content.gedcomx && data.content.gedcomx.places){
      var places = data.content.gedcomx.places,
          placesMap = {};
        
      utils.forEach(places, function(place, index, obj){
        if(!(place instanceof FS.PlaceDescription)){
          obj[index] = placesMap[place.id] = client.createPlaceDescription(place);
        }
      });
      
      utils.forEach(places, function(place){
        if(place.data.jurisdiction && place.data.jurisdiction.resource){
          var jurisdictionId = place.data.jurisdiction.resource.substring(1);
          if(placesMap[jurisdictionId]){
            place.setJurisdiction(placesMap[jurisdictionId]);
          }
        }
      });
    }
  }
  
  
};

/**
 * @ngdoc function
 * @name places.functions:createPlacesSearchResult
 * @param {Object} data [Entry](https://familysearch.org/developers/docs/api/atom/Entry_json) data
 * @return {Object} {@link places.types:constructor.PlacesSearchResult PlacesSearchResult}
 * @description Create a {@link places.types:constructor.PlacesSearchResult PlacesSearchResult} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createPlacesSearchResult = function(data){
  return new PlacesSearchResult(this, data);
};

PlacesSearchResult.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  constructor: PlacesSearchResult,
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlacesSearchResult#getId
   * @methodOf places.types:constructor.PlacesSearchResult
   * @return {string} place id
   */
   
  /**
   * @ngdoc function
   * @name places.types:constructor.PlacesSearchResult#getScore
   * @methodOf places.types:constructor.PlacesSearchResult
   * @return {number} higher is better
   */
  getScore: function(){ return this.data.score; },
   
  /**
   * @ngdoc function
   * @name places.types:constructor.PlacesSearchResult#getPlace
   * @methodOf places.types:constructor.PlacesSearchResult

   * @return {PlaceDescription} The {@link places.types:constructor.PlaceDescription Place Description}.
   */
  getPlace: function(){
    var maybe = utils.maybe;
    return maybe(maybe(maybe(this.data.content).gedcomx).places)[0];
  }
   
});
},{"./../FamilySearch":5,"./../utils":57}],29:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name searchAndMatch.types:constructor.SearchResult
 * @description
 *
 * A person search result entry.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var SearchResult = FS.SearchResult = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  utils.forEach(maybe(maybe(maybe(data).content).gedcomx).persons, function(person, index, obj){
    if(!(person instanceof FS.Person)){
      obj[index] = client.createPerson(person);
    }
  });
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:createSearchResult
 * @param {Object} data [Entry](https://familysearch.org/developers/docs/api/atom/Entry_json) data
 * @return {Object} {@link searchAndMatch.types:constructor.SearchResult SearchResult}
 * @description Create a {@link searchAndMatch.types:constructor.SearchResult SearchResult} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createSearchResult = function(data){
  return new SearchResult(this, data);
};

SearchResult.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: SearchResult,
  
  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getId
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @return {String} Id of the person for this search result
   */

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getTitle
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @return {String} Id and name
   */
  getTitle: function(){ return this.data.title; },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getScore
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @return {Number} higher is better
   */
  getScore: function(){ return this.data.score; },
  
  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getConfidence
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @return {Number} between 1 and 5; higher is better
   */
  getConfidence: function(){ return this.data.confidence; },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getPerson
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @description
   *
   * **Note: Be aware that the `Person` objects returned from SearchResults do not have as much information
   * as `Person` objects returned from the various person and pedigree functions.**
   *
   * @param {string} pid id of the person
   * @return {Person} the {@link person.types:constructor.Person Person} for this Id in this search result
   */
  getPerson: function(pid) {
    return utils.find(maybe(maybe(this.data.content).gedcomx).persons, function(person){
      return person.getId() === pid;
    });
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getPrimaryPerson
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {Person} the primary {@link person.types:constructor.Person Person} for this search result
   */
  getPrimaryPerson: function() {
    return this.getPerson(this.getId());
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getFullPrimaryPerson
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  getFullPrimaryPerson: function() { return this.client.getPerson(this.getId()); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getFatherIds
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {String[]} array of father Id's for this search result
   */
  getFatherIds: function() {
    var primaryId = this.getId(), self = this;
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.data.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person2.resourceId === primaryId &&
          r.person1 &&
          self.getPerson(r.person1.resourceId).getGender().getType() === 'http://gedcomx.org/Male';
      }),
      function(r) { return r.person1.resourceId; }
    ));
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getFathers
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {Person[]} array of father {@link person.types:constructor.Person Persons} for this search result
   */
  getFathers: function() { return utils.map(this.getFatherIds(), this.getPerson, this); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getMotherIds
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {String[]} array of mother Id's for this search result
   */
  getMotherIds: function() {
    var primaryId = this.getId(), self = this;
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.data.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person2.resourceId === primaryId &&
          r.person1 &&
          self.getPerson(r.person1.resourceId).getGender().getType() !== 'http://gedcomx.org/Male';
      }),
      function(r) { return r.person1.resourceId; }
    ));
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getMothers
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {Person[]} array of mother {@link person.types:constructor.Person Persons} for this search result
   */
  getMothers: function() { return utils.map(this.getMotherIds(), this.getPerson, this); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getSpouseIds
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {String[]} array of spouse Id's for this search result
   */
  getSpouseIds:  function() {
    var primaryId = this.getId();
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.data.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/Couple' &&
          (r.person1.resourceId === primaryId || r.person2.resourceId === primaryId);
      }),
      function(r) { return r.person1.resourceId === primaryId ? r.person2.resourceId : r.person1.resourceId; }
    ));
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getSpouses
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {Person[]} array of spouse {@link person.types:constructor.Person Persons} for this search result
   */
  getSpouses: function() { return utils.map(this.getSpouseIds(), this.getPerson, this); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getChildIds
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {String[]} array of child Id's for this search result
   */
  getChildIds:  function() {
    var primaryId = this.getId();
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.data.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person1.resourceId === primaryId &&
          r.person2;
      }),
      function(r) { return r.person2.resourceId; }
    ));
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getChildren
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {Person[]} array of spouse {@link person.types:constructor.Person Persons} for this search result
   */
  getChildren: function() { return utils.map(this.getChildIds(), this.getPerson, this); }
});
},{"./../FamilySearch":5,"./../utils":57}],30:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name sources.types:constructor.SourceDescription
 * @description
 *
 * Description of a source
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Descriptions_resource FamilySearch API Docs}
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object
 * _about_ is a URL (link to the record) it can be a memory URL.
 */
var SourceDescription = FS.SourceDescription = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.citation) {
      this.setCitation(data.citation);
      delete data.citation;
    }
    if (data.title) {
      this.setTitle(data.title);
      delete data.title;
    }
    if (data.text) {
      this.setText(data.text);
      delete data.text;
    }
  }
};

/**
 * @ngdoc function
 * @name sources.functions:createSourceDescription
 * @param {Object} data [SourceDescription](https://familysearch.org/developers/docs/api/gx/SourceDescription_json) data
 * @return {Object} {@link sources.types:constructor.SourceDescription SourceDescription}
 * @description Create a {@link sources.types:constructor.SourceDescription SourceDescription} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createSourceDescription = function(data){
  return new SourceDescription(this, data);
};

SourceDescription.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: SourceDescription,
  
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getId
   * @methodOf sources.types:constructor.SourceDescription
   * @return {String} Id of the source description
   */

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getAbout
   * @methodOf sources.types:constructor.SourceDescription
   * @return {String} URL (link to the record)
   */
  getAbout: function(){ return this.data.about; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getAttribution
   * @methodOf sources.types:constructor.SourceDescription
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getCitation
   * @methodOf sources.types:constructor.SourceDescription

   * @return {String} source citation
   */
  getCitation: function() { return maybe(maybe(this.data.citations)[0]).value; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getTitle
   * @methodOf sources.types:constructor.SourceDescription

   * @return {String} title of the source description
   */
  getTitle: function() { return maybe(maybe(this.data.titles)[0]).value; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getText
   * @methodOf sources.types:constructor.SourceDescription

   * @return {String} Text / Description of the source
   */
  getText: function() { return maybe(maybe(this.data.notes)[0]).text; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getSourceDescriptionUrl
   * @methodOf sources.types:constructor.SourceDescription

   * @return {String} Url of the of this source description
   */
  getSourceDescriptionUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('description')).href); },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getSourceRefsQuery
   * @methodOf sources.types:constructor.SourceDescription

   * @return {Object} promise for the {@link sources.functions:getSourceRefsQuery getSourceRefsQuery} response
   */
  getSourceRefsQuery: function() {
    return this.client.getSourceRefsQuery(maybe(this.getLink('source-references-query')).href);
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#setCitation
   * @methodOf sources.types:constructor.SourceDescription

   * @param {String} citation source description citation
   * @return {SourceDescription} this source description
   */
  setCitation: function(citation) {
    this.data.citations = [ { value: citation } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#setTitle
   * @methodOf sources.types:constructor.SourceDescription

   * @param {String} title source description title
   * @return {SourceDescription} this source description
   */
  setTitle: function(title) {
    this.data.titles = [ { value: title } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#setText
   * @methodOf sources.types:constructor.SourceDescription

   * @param {String} text source description text
   * @return {SourceDescription} this source description
   */
  setText: function(text) {
    this.data.notes = [ { text: text } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#save
   * @methodOf sources.types:constructor.SourceDescription

   * @description
   * Create a new source description (if this source description does not have an id) or update the existing source description
   *
   *
   * @param {string=} changeMessage change message
   * @return {Object} promise for the response
   */
  save: function(changeMessage) {
    var self = this;
    if (changeMessage) {
      self.setAttribution(self.client.createAttribution(changeMessage));
    }
    var urlPromise = self.getSourceDescriptionUrl() ? Promise.resolve(self.getSourceDescriptionUrl()) : self.plumbing.getCollectionUrl('FSUDS', 'source-descriptions');
    return urlPromise.then(function(url){
      return self.plumbing.post(url, { sourceDescriptions: [ self ] });
    }).then(function(response){
      self.updateFromResponse(response, 'description');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#delete
   * @methodOf sources.types:constructor.SourceDescription

   * @description delete this source description as well as all source references that refer to this source description
   * - see {@link sources.functions:deleteSourceDescription deleteSourceDescription}
   *
   * @param {string} changeMessage reason for the deletion
   * @return {Object} promise for the response
   */
  delete: function(changeMessage) {
    return this.client.deleteSourceDescription(this.getSourceDescriptionUrl(), changeMessage);
  }

});
},{"./../FamilySearch":5,"./../utils":57}],31:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name sources.types:constructor.SourceRef
 * @description Reference from a person or relationship to a source.
 *
 * FamilySearch API Docs:
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource Person SourceRef},
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_References_resource Couple SourceRef}, and
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource ChildAndParents SourceRef}
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var SourceRef = FS.SourceRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if (data.sourceDescription) {
      //noinspection JSUnresolvedFunction
      this.setSourceDescription(data.sourceDescription);
      delete data.sourceDescription;
    }
  }
};

/**
 * @ngdoc function
 * @name sources.functions:createSourceRef
 * @param {Object} data [SourceReference](https://familysearch.org/developers/docs/api/gx/SourceReference_json) data
 * @return {Object} {@link sources.types:constructor.SourceRef SourceRef}
 * @description Create a {@link sources.types:constructor.SourceRef SourceRef} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createSourceRef = function(data){
  return new SourceRef(this, data);
};

SourceRef.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: SourceRef,
  
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getId
   * @methodOf sources.types:constructor.SourceRef
   * @return {string} Id of the source reference
   */

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getAttribution
   * @methodOf sources.types:constructor.SourceRef
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */
   
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getDescription
   * @methodOf sources.types:constructor.SourceRef
   * @returns {String} description
   */
  getDescription: function(){ return this.data.description; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getSourceRefUrl
   * @methodOf sources.types:constructor.SourceRef

   * @return {string} URL of this source reference - _NOTE_ however that you cannot read individual source references
   */
  getSourceRefUrl: function() {
    return this.helpers.removeAccessToken(maybe(this.getLink('source-reference')).href);
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getSourceDescriptionUrl
   * @methodOf sources.types:constructor.SourceRef

   * @return {string} URL of the source description - pass into {@link sources.functions:getSourceDescription getSourceDescription} for details
   */
  getSourceDescriptionUrl: function() {
    if(this.getDescription().charAt(0) !== '#'){
      return this.helpers.removeAccessToken(this.getDescription());
    }
  },
  
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getSourceDescriptionId
   * @methodOf sources.types:constructor.SourceRef

   * @return {string} Id of the source description
   */
  getSourceDescriptionId: function() {
    if(this.getDescription().charAt(0) === '#'){
      return this.getDescription().substr(1);
    } else {
      return this.getSourceDescriptionUrl().split('/').pop();
    }
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getSourceDescription
   * @methodOf sources.types:constructor.SourceRef
   * @return {Object} promise for the {@link sources.functions:getSourceDescription getSourceDescription} response
   */
  getSourceDescription: function() {
    return this.client.getSourceDescription(this.getSourceDescriptionUrl());
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getTags
   * @methodOf sources.types:constructor.SourceRef
   * @return {string[]} an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
   */
  getTags: function() { 
    return utils.map(this.data.tags, function(tag) {
      return tag.resource;
    });
  },
  
  /**
   * @ngdoc function
   * @name sources.type:constructor.SourceRef#getAttachedEntityId
   * @methodOf sources.types:constructor.SourceRef
   * @return {String} ID of the person, couple, or child and parents that this source ref is attached to
   */
  getAttachedEntityId: function() {
    // We store it outside of the data object so that it doesn't get serialized
    return this.attachedEntityId;
  },
  
  /**
   * @ngdoc function
   * @name sources.type:constructor.SourceRef#getAttachedEntityUrl
   * @methodOf sources.types:constructor.SourceRef
   * @return {String} URL of the person, couple, or child and parents that this source ref is attached to
   */
  getAttachedEntityUrl: function() {
    // We store it outside of the data object so that it doesn't get serialized
    return this.attachedEntityUrl;
  },
  
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#setAttachedEntityId
   * @methodOf sources.types:constructor.SourceRef
   * @param {string} entityId ID of the person, couple, or child and parents that this source ref is attached to
   * @return {SourceRef} this source reference
   */
  setAttachedEntityId: function(entityId) {
    this.attachedEntityId = entityId;
    return this;
  },
  
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#setAttachedEntityUrl
   * @methodOf sources.types:constructor.SourceRef
   * @param {string} entityUrl URL of the person, couple, or child and parents that this source ref is attached to
   * @return {SourceRef} this source reference
   */
  setAttachedEntityUrl: function(entityUrl) {
    this.attachedEntityUrl = this.helpers.removeAccessToken(entityUrl);
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#setSourceDescription
   * @methodOf sources.types:constructor.SourceRef
   * @param {SourceDescription|string} srcDesc SourceDescription object or URL of the source description
   * @return {SourceRef} this source reference
   */
  setSourceDescription: function(srcDesc) {
    if (srcDesc instanceof FS.SourceDescription) {
      this.data.description = srcDesc.getSourceDescriptionUrl();
    }
    else {
      this.data.description = this.helpers.removeAccessToken(srcDesc);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#setTags
   * @methodOf sources.types:constructor.SourceRef

   * @param {string[]} tags an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
   * @return {SourceRef} this source reference
   */
  setTags: function(tags) {
    this.data.tags = utils.map(tags, function(tag) {
      return {resource: tag};
    });
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#addTag
   * @methodOf sources.types:constructor.SourceRef

   * @param {string} tag tag to add
   * @return {SourceRef} this source reference
   */
  addTag: function(tag) {
    if (!utils.isArray(this.data.tags)) {
      this.tags = [];
    }
    this.data.tags.push({resource: tag});
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#removeTag
   * @methodOf sources.types:constructor.SourceRef

   * @param {string} tag tag to remove
   * @return {SourceRef} this source reference
   */
  removeTag: function(tag) {
    tag = utils.find(this.data.tags, {resource: tag});
    if (tag) {
      this.data.tags.splice(utils.indexOf(this.data.tags, tag), 1);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#save
   * @methodOf sources.types:constructor.SourceRef

   * @description
   * Create a new source reference (if this source reference does not have an id) or update the existing source reference
   *
   * _NOTE_: there's no _refresh_ parameter because it's not possible to read individual source references;
   * however, the source reference's id and URL are set when creating a new source reference.
   *
   * _NOTE_: the person/couple/childAndParents id and the source description are not updateable.
   * Only the tags are updateable.
   *
   *
   * @param {string} url url for a person, couple, or child and parents source references endpoint
   * @param {string} changeMessage change message
   * @return {Object} promise of the source reference id, which is fulfilled after the source reference has been updated
   */
  save: function(url, changeMessage) {
    var self = this;
    if (changeMessage) {
      self.setAttribution(self.client.createAttribution(changeMessage));
    }
    var entityType = self.helpers.getEntityType(url);
    var headers = {};
    if (entityType === 'childAndParentsRelationships') {
      headers['Content-Type'] = 'application/x-fs-v1+json';
    }

    var payload = {};
    payload[entityType] = [ { sources: [ self ] } ];
    return self.plumbing.post(url, payload, headers).then(function(response){
      self.updateFromResponse(response, 'source-reference');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#delete
   * @methodOf sources.types:constructor.SourceRef

   * @description delete this source reference
   * - see {@link sources.functions:deletePersonSourceRef deletePersonSourceRef},
   * {@link sources.functions:deleteCoupleSourceRef deleteCoupleSourceRef}, or
   * {@link sources.functions:deleteChildAndParentsSourceRef deleteChildAndParentsSourceRef}
   *
   * @param {string} changeMessage reason for the deletion
   * @return {Object} promise for the source reference URL
   */
  delete: function(changeMessage) {
    return this.client.deleteSourceRef(this.getSourceRefUrl(), changeMessage);
  }

});
},{"./../FamilySearch":5,"./../utils":57}],32:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('../utils');

/**
 * @ngdoc function
 * @name places.types:constructor.TextValue
 * @description
 *
 * Place description returned by the Place Authority.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var TextValue = FS.TextValue = function(client, data){ 
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name places.functions:createTextValue
 * @param {Object} data [PlaceDescription](https://familysearch.org/developers/docs/api/gx/TextValue_json) data
 * @return {Object} {@link places.types:constructor.TextValue TextValue}
 * @description Create a {@link places.types:constructor.TextValue TextValue} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createTextValue = function(data){
  return new TextValue(this, data);
};

TextValue.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: TextValue,
  
  /**
   * @ngdoc function
   * @name places.types:constructor.TextValue#getLang
   * @methodOf places.types:constructor.TextValue
   * @return {string} The language of the text value. See [http://www.w3.org/International/articles/language-tags/](http://www.w3.org/International/articles/language-tags/)
   */
  getLang: function(){ return this.data.lang; },
   
  /**
   * @ngdoc function
   * @name places.types:constructor.TextValue#getValue
   * @methodOf places.types:constructor.TextValue
   * @return {string} The text value.
   */ 
  getValue: function(){ return this.data.value; }
});
},{"../utils":57,"./../FamilySearch":5}],33:[function(require,module,exports){
var FS = require('../FamilySearch'),
    utils = require('../utils');

/**
 * @ngdoc function
 * @name user.types:constructor.User
 * @description
 *
 * User - a user is returned from {@link user.functions:getCurrentUser getCurrentUser};
 * Contributor Ids are agent ids, not user ids.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var User = FS.User = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name user.functions:createUser
 * @param {Object} data [User](https://familysearch.org/developers/docs/api/fs/User_json) data
 * @return {Object} {@link user.types:constructor.User User}
 * @description Create a {@link user.types:constructor.User User} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createUser = function(data){
  return new User(this, data);
};

User.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: User,
  
  /**
   * @ngdoc function
   * @name user.types:constructor.User#getId
   * @methodOf user.types:constructor.User
   * @return {String} Id of the user
   */
  getId: function() { return this.data.id; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getPersonId
   * @methodOf user.types:constructor.User
   * @return {String} id of the {@link person.types:constructor.Person Person} for this user
   */
  getPersonId: function() { return this.data.personId; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getTreeUserId
   * @methodOf user.types:constructor.User
   * @return {String} agent (contributor) id of the user
   */
  getTreeUserId: function() { return this.data.treeUserId; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getContactName
   * @methodOf user.types:constructor.User
   * @return {String} contact name
   */
  getContactName: function() { return this.data.contactName; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getDisplayName
   * @methodOf user.types:constructor.User
   * @return {String} full display name
   */
  getDisplayName: function() { return this.data.displayName; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getGivenName
   * @methodOf user.types:constructor.User
   * @return {String} given name
   */
  getGivenName: function() { return this.data.givenName; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getFamilyName
   * @methodOf user.types:constructor.User
   * @return {String} family name
   */
  getFamilyName: function() { return this.data.familyName; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getGender
   * @methodOf user.types:constructor.User
   * @return {String} MALE or FEMALE
   */
  getGender: function() { return this.data.gender; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getEmail
   * @methodOf user.types:constructor.User
   * @return {String} email address
   */
  getEmail: function() { return this.data.email; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getPreferredLanguage
   * @methodOf user.types:constructor.User
   * @return {String} e.g., en
   */
  getPreferredLanguage: function() { return this.data.preferredLanguage; }
});
},{"../FamilySearch":5,"../utils":57}],34:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name vocabularies.types:constructor.VocabularyElement
 * @description
 *
 * An element in a vocabulary list.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var VocabularyElement = FS.VocabularyElement = function(client, data){ 
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name vocabularies.functions:createVocabularyElement
 * @param {Object} data object with vocabulary element data
 * @return {Object} {@link vocabularies.types:constructor.VocabularyElement VocabularyElement}
 * @description Create a {@link vocabularies.types:constructor.VocabularyElement VocabularyElement} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createVocabularyElement = function(data){
  return new VocabularyElement(this, data);
};

VocabularyElement.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  constructor: VocabularyElement,
  
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyElement#getId
   * @methodOf vocabularies.types:constructor.VocabularyElement
   * @return {string} place id
   */
   
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyElement#getLabel
   * @methodOf vocabularies.types:constructor.VocabularyElement

   * @return {String} The label of this element.
   */
  getLabel: function(){
    return utils.maybe(utils.maybe(this.data.labels)[0])['@value'];
  },
  
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyElement#getDescription
   * @methodOf vocabularies.types:constructor.VocabularyElement

   * @return {String} The description of this element.
   */
  getDescription: function(){
    return utils.maybe(utils.maybe(this.data.descriptions)[0])['@value'];
  }
   
});
},{"./../FamilySearch":5,"./../utils":57}],35:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name vocabularies.types:constructor.VocabularyList
 * @description
 *
 * A vocabulary list.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var VocabularyList = FS.VocabularyList = function(client, data){ 
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(data.elements){
      utils.forEach(this.data.elements, function(element, i, list){
        if(!(element instanceof FS.VocabularyElement)){
          list[i] = client.createVocabularyElement(element);
        }
      });
    }
  }
};

/**
 * @ngdoc function
 * @name vocabularies.functions:createVocabularyList
 * @param {Object} data object with vocabulary list data
 * @return {Object} {@link vocabularies.types:constructor.VocabularyList VocabularyList}
 * @description Create a {@link vocabularies.types:constructor.VocabularyList VocabularyList} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createVocabularyList = function(data){
  return new VocabularyList(this, data);
};

VocabularyList.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: VocabularyList,
   
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyList#getTitle
   * @methodOf vocabularies.types:constructor.VocabularyList

   * @return {String} The label of this element.
   */
  getTitle: function(){
    return this.data.title;
  },
  
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyList#getDescription
   * @methodOf vocabularies.types:constructor.VocabularyList

   * @return {String} The description of this element.
   */
  getDescription: function(){
    return this.data.description;
  },
  
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyList#getElements
   * @methodOf vocabularies.types:constructor.VocabularyList

   * @return {Array} An array of {@link vocabularies.types:constructor.VocabularyElement VocabularyElements}.
   */
  getElements: function(){
    return utils.maybe(this.data.elements);
  }
   
});
},{"./../FamilySearch":5,"./../utils":57}],36:[function(require,module,exports){
/**
 * TODO: Add interface for modifying these so that you
 * don't have to pass the same config options
 * to each new instance
 */

module.exports = {
  clientId: null,
  environment: null,
  redirectUri: null,
  autoSignin: false,
  autoExpire: false,
  accessToken: null,
  saveAccessToken: false,
  logging: false,
  // constants for now, but could become options in the future
  accessTokenCookie: 'FS_ACCESS_TOKEN',
  authCodePollDelay: 50,
  defaultThrottleRetryAfter: 1000,
  maxHttpRequestRetries: 4,
  maxAccessTokenInactivityTime: 3540000, // 59 minutes to be safe
  maxAccessTokenCreationTime:  86340000, // 23 hours 59 minutes to be safe
  apiServer: {
    'sandbox'   : 'https://sandbox.familysearch.org',
    'staging'   : 'https://stage.familysearch.org',
    'beta'      : 'https://beta.familysearch.org',
    'production': 'https://familysearch.org'
  },
  oauthServer: {
    'sandbox'   : 'https://integration.familysearch.org/cis-web/oauth2/v3',
    'staging'   : 'https://identbeta.familysearch.org/cis-web/oauth2/v3',
    'beta'      : 'https://identbeta.familysearch.org/cis-web/oauth2/v3',
    'production': 'https://ident.familysearch.org/cis-web/oauth2/v3'
  },
  collectionsUrl: '/platform/collections'
};

},{}],37:[function(require,module,exports){
var utils = require('./utils'),
    forEach = utils.forEach;

/**
 * Internal utility functions. This differs from utils.js in that it contains
 * functions which are specific to FamilySearch or need access to a client instance.
 */

var Helpers = function(client){
  this.settings = client.settings;
  this.client = client;
  this.accessTokenInactiveTimer = null;
  this.accessTokenCreationTimer = null;
};

/**
 * Prepend server onto path if path does not start with https?://
 * @param {string} server
 * @param {string} path
 * @returns {string} server + path
 */
Helpers.prototype.getAbsoluteUrl = function(server, path) {
  if (!this.isAbsoluteUrl(path)) {
    return server + (path.charAt(0) !== '/' ? '/' : '') + path;
  }
  else {
    return path;
  }
};

/**
 * Return true if this url is for the OAuth server
 * @param url
 * @returns {boolean}
 */
Helpers.prototype.isOAuthServerUrl = function(url) {
  return url.indexOf(this.settings.oauthServer[this.settings.environment]) === 0;
};

/**
 * Prepend api server to path if path doesn't start with https?://
 * @param path
 * @returns {string} server + path
 */
Helpers.prototype.getAPIServerUrl = function(path) {
  return this.getAbsoluteUrl(this.settings.apiServer[this.settings.environment], path);
};

/**
 * Append the access token to the url
 * @param {string} url url
 * @returns {string} url with access token
 */
Helpers.prototype.appendAccessToken = function(url) {
  if (url) {
    var params = this.decodeQueryString(url);
    url = this.removeQueryString(url);
    params['access_token'] = this.settings.accessToken;
    url = this.appendQueryParameters(url, params);
  }
  return url;
};

/**
 * log to console only if debugging is turned on
 */
Helpers.prototype.log = function() {
  if (this.settings.debug && console.log) {
    console.log.apply(console, arguments);
  }
};

/**
 * Set a timer, optionally clearing the old timer first
 * @param {Function} fn Function to call
 * @param {number} delay
 * @param {number=} oldTimer Old timer to clear
 * @returns {number} timer
 */
Helpers.prototype.setTimer = function(fn, delay, oldTimer) {
  if (oldTimer) {
    clearTimeout(oldTimer);
  }
  setTimeout(function() {
    fn();
  }, delay);
};

Helpers.prototype.setAccessTokenInactiveTimer = function(delay) {
  this.accessTokenInactiveTimer = this.setTimer(this.settings.eraseAccessToken, delay, this.accessTokenInactiveTimer);
};

Helpers.prototype.setAccessTokenCreationTimer = function(delay) {
  this.accessTokenCreationTimer = this.setTimer(this.settings.eraseAccessToken, delay, this.accessTokenCreationTimer);
};

Helpers.prototype.clearAccessTokenTimers = function() {
  clearTimeout(this.accessTokenInactiveTimer);
  this.accessTokenInactiveTimer = null;
  clearTimeout(this.accessTokenCreationTimer);
  this.accessTokenCreationTimer = null;
};

/**
 * Return the name of the cookie that stores the access token
 */
Helpers.prototype.getAccessTokenCookieName = function(){
  return this.settings.accessTokenCookie + '_' + this.settings.instanceId;
};

/**
 * Read the access token from the cookie and start the expiry timers
 */
Helpers.prototype.readAccessToken = function() {
  if (typeof window === 'undefined') {
    return;
  }
  var now = (new Date()).getTime(),
      self = this;
  var cookie = this.readCookie(this.getAccessTokenCookieName());
  if (cookie) {
    var parts = cookie.split('|', 3);
    if (parts.length === 3) {
      var inactiveMillis = now - parseInt(parts[0],10);
      var creationMillis = now - parseInt(parts[1],10);
      if (inactiveMillis < this.settings.maxAccessTokenInactivityTime && creationMillis < this.settings.maxAccessTokenCreationTime) {
        this.settings.accessToken = parts[2];
        if (this.settings.autoExpire) {
          self.setAccessTokenInactiveTimer(this.settings.maxAccessTokenInactivityTime - inactiveMillis);
          self.setAccessTokenCreationTimer(this.settings.maxAccessTokenCreationTime - creationMillis);
        }
      }
    }
  }
};

/**
 * Set the access token, start the expiry timers, and write the cookie
 */
Helpers.prototype.setAccessToken = function(accessToken) {
  this.settings.accessToken = accessToken;
  if (typeof window === 'undefined') {
    return;
  }
  if (this.settings.autoExpire) {
    this.setAccessTokenInactiveTimer(this.settings.maxAccessTokenInactivityTime);
    this.setAccessTokenCreationTimer(this.settings.maxAccessTokenCreationTime);
  }
  if (this.settings.saveAccessToken) {
    var now = (new Date()).getTime();
    var cookie = now+'|'+now+'|'+accessToken;
    this.createCookie(this.getAccessTokenCookieName(), cookie, 0);
  }
};

/**
 * Refresh the access token by updating the inactive timer
 */
Helpers.prototype.refreshAccessToken = function() {
  var now = (new Date()).getTime();
  if (this.settings.autoExpire) {
    this.setAccessTokenInactiveTimer(this.settings.maxAccessTokenInactivityTime);
  }
  if (this.settings.saveAccessToken) {
    var cookie = this.readCookie(this.getAccessTokenCookieName());
    if (cookie) {
      var parts = cookie.split('|', 3);
      if (parts.length === 3) {
        cookie = now+'|'+parts[1]+'|'+parts[2];
        this.createCookie(this.getAccessTokenCookieName(), cookie, 0);
      }
    }
  }
};

/**
 * Erase access token, clear the expiry timers, and erase the cookie
 */
Helpers.prototype.eraseAccessToken = function(omitCallback) {
  this.settings.accessToken = null;
  if (typeof window === 'undefined') {
    return;
  }
  if (this.settings.autoExpire) {
    this.clearAccessTokenTimers();
  }
  if (this.settings.saveAccessToken) {
    this.eraseCookie(this.getAccessTokenCookieName());
  }
  if (!!this.settings.expireCallback && !omitCallback) {
    this.settings.expireCallback(this.client);
  }
};

/**
 * The following functions are more like utility functions that
 * don't need access to any instance data
 */

/**
 * Return true if url starts with https?://
 * @param {string} url
 * @returns {boolean} true if url starts with https?://
 */
Helpers.prototype.isAbsoluteUrl = function(url) {
  return (/^https?:\/\//).test(url);
};

/**
 * Return true if this url is for the Authorities server
 * @param url
 * @returns {boolean}
 */
Helpers.prototype.isAuthoritiesServerUrl = function(url) {
  return url.indexOf('/authorities/v1/') !== -1;
};

/**
 * Create a URL-encoded query string from an object
 * @param {Object} params Parameters
 * @returns {string} URL-encoded string
 */
Helpers.prototype.encodeQueryString = function(params) {
  var arr = [];
  forEach(params, function(value, key) {
    key = encodeURIComponent(key);
    var param;
    if (utils.isArray(value)) {
      param = utils.map(value, function(elm) {
        //noinspection JSValidateTypes
        return key + '=' + encodeURIComponent(elm);
      }).join('&');
    }
    else if (value != null) { // catches null and undefined
      param = key + '=' + encodeURIComponent(value);
    }
    else {
      param = key;
    }
    arr.push(param);
  });
  return arr.join('&');
};

/**
 * Append query parameters object to a url
 * @param {string} url
 * @param {Object} params
 * @returns {String} url + query string
 */
Helpers.prototype.appendQueryParameters = function(url, params) {
  var queryString = this.encodeQueryString(params);
  if (queryString.length === 0) {
    return url;
  }
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + queryString;
};

/**
 * Decode query string part of a url into an object
 * @param {string} url url
 * @returns {Object} parameters object
 */
Helpers.prototype.decodeQueryString = function(url) {
  var obj = {};
  if (url) {
    var pos = url.indexOf('?');
    if (pos !== -1) {
      var segments = url.substring(pos+1).split('&');
      forEach(segments, function(segment) {
        var kv = segment.split('=', 2);
        if (kv && kv[0]) {
          var key = decodeURIComponent(kv[0]);
          var value = (kv[1] != null ? decodeURIComponent(kv[1]) : kv[1]); // catches null and undefined
          if (obj[key] != null && !utils.isArray(obj[key])) {
            obj[key] = [ obj[key] ];
          }
          if (obj[key] != null) {
            obj[key].push(value);
          }
          else {
            obj[key] = value;
          }
        }
      });
    }
  }
  return obj;
};

/**
 * Remove the query string from the url
 * @param {string} url url
 * @returns {string} url without query string
 */
Helpers.prototype.removeQueryString = function(url) {
  if (url) {
    var pos = url.indexOf('?');
    if (pos !== -1) {
      url = url.substring(0, pos);
    }
  }
  return url;
};

/**
 * Remove the access token from the url
 * @param {string} url url
 * @returns {string} url without access token
 */
Helpers.prototype.removeAccessToken = function(url) {
  if (url) {
    var params = this.decodeQueryString(url);
    url = this.removeQueryString(url);
    delete params['access_token'];
    url = this.appendQueryParameters(url, params);
  }
  return url;
};

/**
 * Populate template with uri-encoded parameters
 * @param {string} template template with {param}'s to replace; e.g., /platform/tree/persons/{pid}/source-references/{srid}
 * @param {Object} params parameters; e.g., {pid: 'X', srid: 'Y'}
 * @returns {string} populated template
 */
Helpers.prototype.populateUriTemplate = function(template, params) {
  var segments = template.split(/[{}]/);
  var inQuery = false;
  for (var i = 0, len = segments.length; i < len; i++) {
    if (i % 2 === 1) {
      var param = params[segments[i]];
      segments[i] = inQuery ? encodeURIComponent(param) : encodeURI(param);
    }
    else if (segments[i].indexOf('?') !== -1) {
      inQuery = true;
    }
  }
  return segments.join('');
};

/**
 * Turn the Link header into a json object of links. The header may either
 * be an array of link values or an array with one value that is a concatenated
 * list of header values. The header format for a link is `<href>; rel="relname"`
 * 
 * @param {array} headers array of link header values
 * @returns {object} json object of links
 */
Helpers.prototype.parseLinkHeaders = function(headers){
  var links = {};
  if(utils.isArray(headers)){
    utils.forEach(headers, function(header){
      var values = header.split(', ');
      utils.forEach(values, function(value){
        var pieces = value.split('; '),
            href = pieces[0].slice(1, -1), // remove leading and trailing <>
            rel = pieces[1].slice(5, -1);
        links[rel] = { href: href };
      });
    });
  }
  return links;
};

/**
 * get a URL from the provided collection by combining resourceName with params
 * 
 * @param collection collection
 * @param resourceName resource name
 * @param params object of params to populate in template
 * @returns {string} url
 */
Helpers.prototype.getUrlFromCollection = function(collection, resourceName, params) {
  var url = '';
  var resource = collection.links[resourceName];
  if (resource['href']) {
    url = this.removeAccessToken(resource['href']);
  }
  else if (resource['template']) {
    var template = resource['template'].replace(/{\?[^}]*}/,''); // we will add query parameters later
    url = this.populateUriTemplate(template, params || {});
  }
  return url;
};

/**
 * Return the entity type for a given url. For example, /platform/tree/child-and-parents-relationships/DDD/notes
 * will return childAndParentsRelationships. This is used by notes and sources to
 * determine where in a gedcomx document the data should go.
 * 
 * @param {string} url
 * @returns {string} entity type: persons, relationships, or childAndParentsRelationships
 */
Helpers.prototype.getEntityType = function(url){
  if(utils.isString(url)){
    var matches = url.match(/platform\/tree\/([^\/]+)/);
    if(matches && matches[1]){
      if (matches[1] === 'persons') {
        return 'persons';
      }
      else if (matches[1] === 'couple-relationships') {
        return 'relationships';
      }
      else if (matches[1] === 'child-and-parents-relationships') {
        return 'childAndParentsRelationships';
      }
    }
  }
};

/**
 * borrowed from http://www.quirksmode.org/js/cookies.html
 * Create a cookie
 * @param {string} name Cookie name
 * @param {string} value Cookie value
 * @param {number} days Number of days to expiration; set to 0 for a session cookie
 */
Helpers.prototype.createCookie = function(name, value, days) {
  var expires = '';
  var isSecure = document.location.protocol === 'https' && document.location.hostname !== 'localhost'; // can't set secure cookies on localhost in chrome
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*86400));
    expires = '; expires='+date.toUTCString();
  }
  //noinspection JSValidateTypes
  document.cookie = name + '=' + value + expires + '; path=/' + (isSecure ? '; secure' : '');
};

/**
 * borrowed from http://www.quirksmode.org/js/cookies.html
 * Read a cookie
 * @param {string} name Cookie name
 * @returns {string} Cookie value
 */
Helpers.prototype.readCookie = function(name) {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0) ===' ') {
      c = c.substring(1,c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length,c.length);
    }
  }
  return null;
};

/**
 * borrowed from http://www.quirksmode.org/js/cookies.html
 * Erase a cookie
 * @param {string} name Cookie name
 */
Helpers.prototype.eraseCookie = function(name) {
  this.createCookie(name,'',-1);
};

module.exports = Helpers;
},{"./utils":57}],38:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc overview
 * @name authentication
 * @description
 * These are the authentication functions. `getAccessToken` is the main function.
 * If you do not pass in an authorization code to `getAccessToken`, it will call the `getAuthCode` function to get one.
 *
 * {@link https://familysearch.org/developers/docs/api/resources#authentication FamilySearch API docs}
 */

/**
 * @ngdoc function
 * @name authentication.functions:getAuthCode

 *
 * @description
 * Open a popup window to allow the user to authenticate and authorize this application.
 * You do not have to call this function. If you call `getAccessToken` without passing in an authorization code,
 * that function will call this function to get one.
 *
 * @link https://familysearch.org/developers/docs/api/authentication/Authorization_resource FamilySearch API docs}
 *
 * @return {Object} a promise of the (string) auth code
 */
FS.prototype.getAuthCode = function() {
  var self = this,
      settings = self.settings;
      
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('This method can only be used in browsers.'));
  } else if(!!settings.expireCallback && !settings.autoSignin) {
    settings.expireCallback(this);
    // TODO: figure this out
    return Promise.reject(new Error('Not sure why we are rejecting here'));
  } else {
    var url = self.settings.oauthServer[self.settings.environment] + '/authorization';
    var popup = self.openPopup(url, {
      'response_type' : 'code',
      'client_id'     : settings.clientId,
      'redirect_uri'  : settings.redirectUri
    });
    return self._pollForAuthCode(popup);
  }
};

/**
 * Process the response from the access token endpoint
 *
 * @param {Object} promise promise from the access token endpoint
 * @param {Object} accessTokenDeferred deferred that needs to be resolved or rejected
 * @return {Object} promise for the access token
 */
FS.prototype.handleAccessTokenResponse = function(response) {
  var self = this,
      data = response.getData();
  var accessToken = data['access_token'];
  if (accessToken) {
    self.helpers.setAccessToken(accessToken);
    return Promise.resolve(accessToken);
  }
  else {
    return Promise.reject(new Error(data['error']));
  }
};

/**
 * @ngdoc function
 * @name authentication.functions:getAccessToken

 *
 * @description
 * Get the access token for the user.
 * Call this function before making any requests that require authentication.
 *
 * You don't need to store the access token returned by this function; you just need to ensure that the promise
 * returned by this function resolves before making calls that require authentication.
 *
 * {@link https://familysearch.org/developers/docs/api/authentication/Access_Token_resource FamilySearch API docs}
 *
 *
 * @param {String=} authCode auth code from getAuthCode; if not passed in, this function will call getAuthCode
 * @return {Object} a promise for the (string) access token.
 */
FS.prototype.getAccessToken = function(authCode) {
  var self = this,
      settings = self.settings,
      plumbing = self.plumbing;
      
  // Just return the access token if we already have one
  if (settings.accessToken) {
    return Promise.resolve(settings.accessToken);
  }
  
  else {
    
    // get auth code if not passed in
    var authCodePromise;
    if (authCode) {
      authCodePromise = Promise.resolve(authCode);
    }
    else {
      authCodePromise = self.getAuthCode();
    }
    
    return authCodePromise.then(function(authCode) {
      var url = self.settings.oauthServer[self.settings.environment] + '/token';
      return plumbing.post(url, {
            'grant_type' : 'authorization_code',
            'code'       : authCode,
            'client_id'  : settings.clientId
          },
          // access token endpoint says it accepts json but it doesn't
          {'Content-Type': 'application/x-www-form-urlencoded'}).then(function(response){
        return self.handleAccessTokenResponse(response);
      });
    });
  }
};

/**
 * @ngdoc function
 * @name authentication.functions:getAccessTokenForMobile

 *
 * @description
 * Get the access token for the user, passing in their user name and password
 * Call this only for mobile apps; otherwise call {@link authentication.functions:getAccessToken getAccessToken}
 *
 * You don't need to store the access token returned by this function; you just need to ensure that the promise
 * returned by this function resolves before making calls that require authentication.
 *
 * {@link https://familysearch.org/developers/docs/api/authentication/Access_Token_resource FamilySearch API docs}
 *
 * @param {String} userName name of the user
 * @param {String} password of the user
 * @return {Object} a promise for the (string) access token.
 */
FS.prototype.getAccessTokenForMobile = function(userName, password) {
  var self = this;
  if (self.settings.accessToken) {
    return Promise.resolve(self.settings.accessToken);
  }
  else {
    var url = self.settings.oauthServer[self.settings.environment] + '/token';
    return self.plumbing.post(url, {
          'grant_type': 'password',
          'client_id' : self.settings.clientId,
          'username'  : userName,
          'password'  : password
        },
        // access token endpoint says it accepts json but it doesn't
        {'Content-Type': 'application/x-www-form-urlencoded'}).then(function(response){
      return self.handleAccessTokenResponse(response);
    });
  }
};

/**
 * @ngdoc function
 * @name authentication.functions:getOAuth2AuthorizeURL

 * 
 * @description
 * Get the URL that a user should be redirected to to begin
 * OAuth2 authentication.
 * 
 * @param {String=} Optional state parameter
 * @return {string} The OAuth2 authorize URL the user should be sent to
 */
FS.prototype.getOAuth2AuthorizeURL = function(state){
  var self = this,
      settings = self.settings;
  var queryParams = {
    'response_type': 'code',
    'client_id': settings.clientId,
    'redirect_uri': settings.redirectUri
  };
  if(state){
    queryParams.state = state;
  }
  var url = settings.oauthServer[settings.environment] + '/authorization';
  return self.helpers.appendQueryParameters(url, queryParams);
};

/**
 * @ngdoc function
 * @name authentication.functions:hasAccessToken

 *
 * @description
 * Return whether the access token exists.
 * The access token may exist but be expired.
 * An access token is discovered to be expired and is erased if an API call returns a 401 unauthorized status
 *
 * @return {boolean} true if the access token exists
 */
FS.prototype.hasAccessToken = function() {
  return !!this.settings.accessToken;
};

/**
 * @ngdoc function
 * @name authentication.functions:invalidateAccessToken

 *
 * @description
 * Invalidate the current access token
 *
 * @return {Object} promise that is resolved once the access token has been invalidated
 */
FS.prototype.invalidateAccessToken = function() {
  var self = this,
      accessToken = self.settings.accessToken;
  self.helpers.eraseAccessToken(true);
  return self.plumbing.getCollectionUrl('FSFT', 'logout').then(function(url) {
    return self.plumbing.post(self.helpers.appendQueryParameters(url, {
      'access_token': accessToken
    }));
  });
};

/**
 * Open a popup window for user to authenticate and authorize this app
 *
 * @private
 * @param {String} url window url
 * @param {Object} params query parameters to append to the window url
 * @return {window} reference to the popup window
 */
FS.prototype.openPopup = function(url, params) {
  // figure out where the center is
  var
    screenX     = utils.isUndefined(window.screenX) ? window.screenLeft : window.screenX,
    screenY     = utils.isUndefined(window.screenY) ? window.screenTop : window.screenY,
    outerWidth  = utils.isUndefined(window.outerWidth) ? document.documentElement.clientWidth : window.outerWidth,
    outerHeight = utils.isUndefined(window.outerHeight) ? (document.documentElement.clientHeight - 22) : window.outerHeight,
    width       = params.width|| 780,
    height      = params.height || 500,
    left        = parseInt(screenX + ((outerWidth - width) / 2), 10),
    top         = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
    features    = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;
  return window.open(this.helpers.appendQueryParameters(url, params),'',features);
};

FS.prototype.getCode = function(href) {
  var params = this.helpers.decodeQueryString(href);
  if (params['code']) {
    return Promise.resolve(params['code']);
  }
  else {
    return Promise.reject(params['error']);
  }
};

/**
 * Polls the popup window location for the auth code
 *
 * @private
 * @param {window} popup window to poll
 * @return a promise of the auth code
 */
FS.prototype._pollForAuthCode = function(popup) {
  var self = this;

  if (popup) {
    return new Promise(function(resolve, reject){
      var interval = setInterval(function() {
        try {
          if (popup.location.hostname === window.location.hostname) {
            self.getCode(popup.location.href).then(function(code){
              resolve(code);
            }, function(e){
              reject(e);
            });
            clearInterval(interval);
            popup.close();
          }
        }
        catch(err) {}
      }, self.settings.authCodePollDelay);
  
      // Mobile safari opens the popup window in a new tab and doesn't run javascript in background tabs
      // The popup window needs to send us the href and close itself
      // (I know this is ugly, but I can't think of a cleaner way to do this that isn't intrusive.)
      window.FamilySearchOauthReceiver = function(href) {
        self.getCode(href).then(function(code){
          resolve(code);
        }, function(e){
          reject(e);
        });
        clearInterval(interval);
      };
    });
  }
  else {
    return Promise.reject('Popup blocked');
  }
};

},{"./../FamilySearch":5,"./../utils":57}],39:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc overview
 * @name authorities
 * @description
 * Functions related to authorities
 *
 * {@link https://familysearch.org/developers/docs/guides/authorities FamilySearch API Docs}
 */

/**
 * @ngdoc function
 * @name authorities.functions:getDate

 *
 * @description
 * Get the standardized date
 *
 * - `getDate()` - get the {@link authorities.types:constructor.Date Date} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/dates/Date_resource FamilySearch API Docs}
 *
 *
 * @param {String} date text to standardize
 * @return {Object} promise for the response
 */
FS.prototype.getDate = function(date) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSDA', 'normalized-date').then(function(url){
    return self.plumbing.get(url, {date: date}, {'Accept': 'text/plain'});
  }).then(function(response){
    var date;
    if(response.getData()){
      date = self.createDate({
        normalized: response.getData(),
        formal: response.getHeader('Location').split(':')[1]
      });
    }
    response.getDate = function() { 
      return utils.maybe(date);
    };
    return response;
  });
};

},{"./../FamilySearch":5,"./../utils":57}],40:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc overview
 * @name changeHistory
 * @description
 * Functions related to change histories
 *
 * {@link https://familysearch.org/developers/docs/api/resources#change-history FamilySearch API Docs}
 */

FS.prototype._changeHistoryResponseMapper = function(response){
  var self = this,
      data = utils.maybe(response.getData());
  for(var i = 0; i < data.entries.length; i++){
    data.entries[i] = self.createChange(data.entries[i]);
  }
  return utils.extend({
    getChanges: function() { 
      return data.entries || []; 
    }
  });
};

/**
 * @ngdoc function
 * @name changeHistory.functions:getChanges

 *
 * @description
 * Get change history for a person, couple, or child and parents.
 * The response includes the following convenience function
 *
 * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_History_resource Person Changes API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Change_History_resource Child and Parents Changes API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Change_History_resource Couple Changes API Docs}
 *
 *
 * @param {String} url full URL of the person changes, child and parent changes, or couple changes endpoint
 * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
 * @return {Object} promise for the response
 */
FS.prototype.getChanges = function(url, params) {
  var self = this;
  return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}).then(function(response){
    return self._changeHistoryResponseMapper(response);
  });
};

/**
 * @ngdoc function
 * @name changeHistory.functions:restoreChange

 *
 * @description
 * Restore the specified change
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Restore_Change_resource}
 *
 *
 * @param {string} url full URL of the restore changes endpoint
 * @return {Object} promise for the response
 */
FS.prototype.restoreChange = function(url) {
  return this.plumbing.post(url, null, {'Content-Type': void 0});
};
},{"./../FamilySearch":5,"./../utils":57}],41:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name discussions
 * @description
 * Functions related to discussions
 *
 * {@link https://familysearch.org/developers/docs/api/resources#discussions FamilySearch API Docs}
 */

/**
 * @ngdoc function
 * @name discussions.functions:getDiscussion

 *
 * @description
 * Get information about a discussion
 * The response includes the following convenience function
 *
 * - `getDiscussion()` - get the {@link discussions.types:constructor.Discussion Discussion} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the discussion to read
 * @return {Object} promise for the response
 */
FS.prototype.getDiscussion = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    utils.forEach(response.getData().discussions, function(discussion, i, obj){
      obj[i] = self.createDiscussion(discussion);
    });
    return utils.extend(response, {
      getDiscussion: function() {
        return maybe(maybe(this.getData()).discussions)[0];
      }
    });
  });
};

/**
 * @ngdoc function
 * @name discussions.functions:getMultiDiscussion

 *
 * @description
 * Get multiple discussions at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
 *
 *
 * @param {string[]|DiscussionRef[]} full URLs, or {@link discussions.types:constructor.DiscussionRef DiscussionRefs} of the discussions
 * @return {Object} promise that is fulfilled when all of the discussions have been read,
 * returning a map of {@link discussions.functions:getDiscussion getDiscussion} responses keyed by url
 */
FS.prototype.getMultiDiscussion = function(urls) {
  var self = this,
      promises = [],
      responses = {};
  utils.forEach(urls, function(url) {
    if (url instanceof FS.DiscussionRef) {
      url = url.$getDiscussionUrl();
    }
    promises.push(
      self.getDiscussion(url).then(function(response){
        responses[url] = response;
      })
    );
  });
  return Promise.all(promises).then(function(){
    return responses;
  });
};

/**
 * @ngdoc function
 * @name discussions.functions:getPersonDiscussionRefs

 *
 * @description
 * Get references to discussions for a person
 * The response includes the following convenience function
 *
 * - `getDiscussionRefs()` - get an array of {@link discussions.types:constructor.DiscussionRef DiscussionRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_References_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the person-discussion-references endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getPersonDiscussionRefs = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    var data = response.getData();
    if(data.persons && data.persons[0] && utils.isArray(data.persons[0]['discussion-references'])){
      var refs = data.persons[0]['discussion-references'];
      for(var i = 0; i < refs.length; i++){
        refs[i] = self.createDiscussionRef(refs[i]);
      }
    }
    return utils.extend(response, {
      getDiscussionRefs: function() {
        return maybe(maybe(maybe(this.getData()).persons)[0])['discussion-references'] || [];
      }
    });
  });
};

FS.prototype._commentsResponseMapper = function(response){
  var self = this,
      data = response.getData();
  if(data.discussions && data.discussions[0] && utils.isArray(data.discussions[0].comments)){
    var comments = data.discussions[0].comments;
    for(var i = 0; i < comments.length; i++){
      comments[i] = self.createComment(comments[i]);
    }
  }
  return utils.extend(response, {
    getComments: function() {
      return maybe(maybe(maybe(this.getData()).discussions)[0]).comments || [];
    }
  });
};

/**
 * @ngdoc function
 * @name discussions.functions:getDiscussionComments

 *
 * @description
 * Get comments for a discussion
 * The response includes the following convenience function
 *
 * - `getComments()` - get an array of {@link discussions.types:constructor.Comment Comments} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/discussions/Comments_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the discussion-comments endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getDiscussionComments = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    return self._commentsResponseMapper(response);
  });
};

/**
 * @ngdoc function
 * @name discussions.functions:deleteDiscussion

 *
 * @description
 * Delete the specified discussion
 *
 * __NOTE__ if you delete a discussion, it's up to you to delete the corresponding Discussion Refs
 * Since there is no way to tell which people a discussion has been linked to, your best best is to
 * attach a discussion to a single person and to delete the discussion when you delete the discussion-reference.
 * FamilySearch is aware of this issue but hasn't committed to a fix.
 *
 * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the discussion
 * @param {string=} changeMessage change message (currently ignored)
 * @return {Object} promise for the response
 */
FS.prototype.deleteDiscussion = function(url) {
  return this.plumbing.del(url, {'Content-Type': 'application/x-fs-v1+json'});
};

/**
 * @ngdoc function
 * @name discussions.functions:deleteDiscussionRef

 *
 * @description
 * Delete the specified discussion reference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_Reference_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the discussion reference
 * @param {string=} drid id of the discussion reference (must be set if pid is a person id and not the full URL)
 * @param {string=} changeMessage change message
 * @return {Object} promise for the response
 */
FS.prototype.deleteDiscussionRef = function(url, changeMessage) {
  var headers = {'Content-Type': 'application/x-fs-v1+json'};
  if (changeMessage) {
    headers['X-Reason'] = changeMessage;
  }
  return this.plumbing.del(url, headers);
};

/**
 * @ngdoc function
 * @name discussions.functions:deleteComment

 *
 * @description
 * Delete the specified discussion or memory comment
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Comment_resource FamilySearch API Docs}
 * {@link https://familysearch.org/developers/docs/api/discussions/Comment_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the comment
 * @return {Object} promise for the response
 */
FS.prototype.deleteComment = function(url) {
  return this.plumbing.del(url);
};

},{"./../FamilySearch":5,"./../utils":57}],42:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name memories
 * @description
 * Functions related to memories
 *
 * {@link https://familysearch.org/developers/docs/api/resources#memories FamilySearch API Docs}
 */

// TODO check whether it's possible now to update story contents (and how to do it)
// TODO add functions to attach & detach photos to a story when the API exists

FS.prototype._memoriesResponseMapper = function(response){
  var self = this,
      data = maybe(response.getData());
  utils.forEach(data.sourceDescriptions, function(descr, i){
    data.sourceDescriptions[i] = self.createMemory(descr);
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getPersonMemoriesQuery
 * @description
 * Get a paged list of memories for a person
 * The response includes the following convenience function
 *
 * - `getMemories()` - get the array of {@link memories.types:constructor.Memory Memories} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the person-memories-query endpoint
 * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0,
 * `type` type of artifacts to return - possible values are photo and story - defaults to both
 * @return {Object} promise for the response
 */
FS.prototype.getPersonMemoriesQuery = function(url, params) {
  var self = this;
  return self.plumbing.get(url, params).then(function(response){
    self._memoriesResponseMapper(response);
    return utils.extend(response, {
      getMemories: function() { 
        return maybe(this.getData()).sourceDescriptions || []; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getUserMemoriesQuery
 * @description
 * Get a paged list of memories for a user
 * The response includes the following convenience function
 *
 * - `getMemories()` - get the array of {@link memories.types:constructor.Memory Memories} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/User_Memories_resource FamilySearch API Docs}
 *
 *
 * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0
 * @return {Object} promise for the response
 */
FS.prototype.getUserMemoriesQuery = function(params) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSMEM', 'artifacts').then(function(url){
    return self.plumbing.get(url, null, {'X-Expect-Override':'200-ok'});
  }).then(function(response){
    return response.getHeader('Location');    
  }).then(function(url) {
    return self.plumbing.get(url, params);
  }).then(function(response){
    self._memoriesResponseMapper(response);
    return utils.extend(response, {
      getMemories: function() { 
        return maybe(this.getData()).sourceDescriptions || []; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemory
 * @description
 * Get information about a memory
 * The response includes the following convenience function
 *
 * - `getMemory()` - get the {@link memories.types:constructor.Memory Memory} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the memory
 * @return {Object} promise for the response
 */
FS.prototype.getMemory = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    self._memoriesResponseMapper(response);
    return utils.extend(response, {
      getMemory: function() { 
        return maybe(maybe(this.getData()).sourceDescriptions)[0]; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryComments
 * @description
 * Get comments for a memory
 * The response includes the following convenience function
 *
 * - `getComments()` - get the array of {@link discussions.types:constructor.Comment Comments} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Comments_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the memory-comments endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryComments = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    self._commentsResponseMapper(response);
    return response;
  });
};

FS.prototype._memoryPersonasMapper = function(response){
  var self = this,
      data = maybe(response.getData());
  
  utils.forEach(data.persons, function(person, i){
    utils.forEach(person.media, function(media, j){
      person.media[j] = self.createMemoryArtifactRef(media);
    });
    utils.forEach(person.names, function(name, j){
      person.names[j] = self.createName(name);
    });
    data.persons[i] = self.createMemoryPersona(person);
  }); 
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryPersonas
 * @description
 * Get personas for a memory
 * The response includes the following convenience function
 *
 * - `getMemoryPersonas()` - get the array of {@link memories.types:constructor.MemoryPersona MemoryPersonas} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the memory-personas endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryPersonas = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var data = maybe(response.getData());
    self._memoryPersonasMapper(response);
    return utils.extend(response, {
      getMemoryPersonas: function() {
        return data.persons || [];
      }
    });
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryPersona
 * @description
 * Get a single memory persona
 * The response includes the following convenience function
 *
 * - `getMemoryPersona()` - get the {@link memories.types:constructor.MemoryPersona MemoryPersona} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Persona_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the memory persona
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryPersona = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var data = maybe(response.getData());
    self._memoryPersonasMapper(response);
    return utils.extend(response, {
      getMemoryPersona: function() { 
        return maybe(data.persons)[0]; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryPersonaRefs
 * @description
 * Get references to memories for a person
 * The response includes the following convenience function
 *
 * - `getMemoryPersonaRefs()` - get an array of {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the person-memory-references endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryPersonaRefs = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var data = maybe(response.getData());
    utils.forEach(data.persons, function(person){
      utils.forEach(person.evidence, function(evidence, j){
        person.evidence[j] = self.createMemoryPersonaRef(evidence);
      });
    });
    return utils.extend(response, {
      getMemoryPersonaRefs: function() {
        return maybe(maybe(data.persons)[0]).evidence || [];
      }
    });
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getPersonPortraitUrl
 * @description
 * Get the URL of the portrait of a person.
 * The response includes the following convenience function
 * 
 * - `getPortraitUrl()` - get the portrait url from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_Portrait_resource FamilySearch API Docs}
 *
 *
 * @param {String} url of the person portrait endpoint
 * @param {Object=} params `default` URL to redirect to if portrait doesn't exist
 * @return {Object} promise for the response
 */
FS.prototype.getPersonPortraitUrl = function(url, params) {
  var self = this;
  return self.plumbing.get(url, params, { 'X-Expect-Override': '200-ok' }).then(function(response){
    response.getPortraitUrl = function(){
      return response.getStatusCode() === 204 ? '' : self.helpers.appendAccessToken(response.getHeader('Location'));
    };
    return response;
  });
};

// TODO wrap call to read all portrait urls

/**
 * @ngdoc function
 * @name memories.functions:deleteMemory
 * @description
 * Delete the specified memory
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the memory
 * @return {Object} promise for the response
 */
FS.prototype.deleteMemory = function(url) {
  return this.plumbing.del(url);
};

/**
 * @ngdoc function
 * @name memories.functions:deleteMemoryPersona
 * @description
 * Delete the specified memory persona
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Persona_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the memory persona
 * @return {Object} promise for the response
 */
FS.prototype.deleteMemoryPersona = function(url) {
  return this.plumbing.del(url);
};

/**
 * @ngdoc function
 * @name memories.functions:deleteMemoryPersonaRef
 * @description
 * Delete the specified memory persona ref
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_Reference_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the memory persona reference
 * @return {Object} promise for the response
 */
FS.prototype.deleteMemoryPersonaRef = function(url) {
  return this.plumbing.del(url);
};

},{"./../FamilySearch":5,"./../utils":57}],43:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name notes
 * @description
 * Functions related to notes
 *
 * {@link https://familysearch.org/developers/docs/api/resources#notes FamilySearch API Docs}
 */

function getRoot(response) {
  var obj = response.getData();
  if (obj) {
    if (obj.persons) {
      return obj.persons;
    }
    else if (obj.childAndParentsRelationships) {
      return obj.childAndParentsRelationships;
    }
    else if (obj.relationships) {
      return obj.relationships;
    }
  }
  return {};
}

/**
 * @ngdoc function
 * @name notes.functions:getNote

 *
 * @description
 * Get information about a note
 * The response includes the following convenience function
 *
 * - `getNote()` - get the {@link notes.types:constructor.Note Note} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource Person Note API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource Couple Relationship Note API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource Child and Parents Relationship API Docs}
 *
 *
 * @param {string} url full URL of the note
 * @return {Object} promise for the response
 */
FS.prototype.getNote = function(url, params) {
  var self = this;
  // child and parents note requires x-fs-v1; others allow fs or gedcomx
  return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    var notes = maybe(getRoot(response)[0]).notes;
    utils.forEach(notes, function(note, i){
      notes[i] = self.createNote(note);
    });
    return utils.extend(response, {
      getNote: function() {
        return maybe(maybe(getRoot(this)[0]).notes)[0];
      }
    });
  });
};

/**
 * @ngdoc function
 * @name notes.functions:getMultiNote

 *
 * @description
 * Get multiple notes at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource Person Note API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource Couple Relationship Note API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource Child and Parents Relationship API Docs}
 *
 *
 * @param {string[]} urls full URLs of the notes
 * @return {Object} promise that is fulfilled when all of the notes have been read,
 * returning a map of note id or URL to {@link notes.functions:getNote getNote} responses
 */
FS.prototype.getMultiNote = function(urls) {
  var self = this,
      promises = [],
      responses = {};
  utils.forEach(urls, function(u) {
    promises.push(
      self.getNote.call(self, u).then(function(response){
        responses[u] = response;
        return response;
      })
    );
  });
  return Promise.all(promises).then(function(){
    return responses;
  });
};

/**
 * @ngdoc function
 * @name notes.functions:getNotes

 *
 * @description
 * Get notes for a person, couple, or child and parents relationship
 * 
 * The response includes the following convenience function
 *
 * - `getNotes()` - get an array of {@link notes.types:constructor.Note Notes} from the response
 * 
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Notes_resource Person Notes API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Notes_resource Couple Notes API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Notes_resource Child and Parents Notes API Docs}
 *
 *
 * @param {String} url full URL of the person-notes, couple-notes, or child-and-parents-notes endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getNotes = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var notes = maybe(getRoot(response)[0]).notes;
    utils.forEach(notes, function(note, index){
      notes[index] = self.createNote(note);
    });
    return utils.extend(response, {
      getNotes: function() {
        return maybe(getRoot(this)[0]).notes || [];
      }
    });
  });
};

/**
 * @ngdoc function
 * @name notes.functions:deleteNote

 *
 * @description
 * Delete the specified person note
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the note
 * @param {string=} changeMessage change message
 * @return {Object} promise for the url
 */
FS.prototype.deleteNote = function(url, changeMessage) {
  var self = this;
  // x-fs-v1+json is required for child-and-parents notes
  var headers = {'Content-Type': 'application/x-fs-v1+json'};
  if (changeMessage) {
    headers['X-Reason'] = changeMessage;
  }
  return self.plumbing.del(url, headers);
};

},{"./../FamilySearch":5,"./../utils":57}],44:[function(require,module,exports){
var FS = require('./../FamilySearch');

/**
 * @ngdoc overview
 * @name ordinances
 * @description
 * Functions for interacting with the FamilySearch Ordinance API
 *
 * {@link https://familysearch.org/developers/docs/api/resources#ordinances FamilySearch API Docs}
 */
 
/**
 * @ngdoc function
 * @name ordinances.functions:hasOrdinancesAccess
 *
 * @description
 * Determine whether the current user has access to LDS ordinances. The returned
 * promise will be resolved if the user has access to LDS ordinances; it will be
 * rejected if the user does not have access.
 *
 * {@link https://familysearch.org/developers/docs/api/ordinances/Ordinances_resource API Docs}
 *
 * @return {Object} promise for the response
 */
FS.prototype.hasOrdinancesAccess = function(){
  return this.plumbing.get('/platform/ordinances/ordinances');
};

/**
 * @ngdoc function
 * @name ordinances.functions:getOrdinancesPolicy
 *
 * @description
 * Get the policy that must be agreed to by the user in order to reserve an LDS ordinance.
 * The policy text is retrieved from the response by calling `response.getData()`.
 *
 * {@link https://familysearch.org/developers/docs/api/ordinances/Ordinance_Policy_resource API Docs}
 *
 * @param {String=} format Response format: `text` or `html` (defaults to `text`)
 * @param {String=} language Value of the `Accept-Language` header that determines the language of the policy
 * @return {Object} promise for the response
 */
FS.prototype.getOrdinancesPolicy = function(format, language){
  var headers = {
    'Accept': 'text/plain'
  };
  if(format === 'html'){
    headers.Accept = 'text/html';
  }
  
  if(language){
    headers['Accept-Language'] = language;
  }
  
  // TODO: get url from the collection
  // It's not availabe in the collection as of 10/10/2015
  return this.plumbing.get('/platform/ordinances/policy', null, headers);
};
},{"./../FamilySearch":5}],45:[function(require,module,exports){
var FS = require('../FamilySearch'),
    utils = require('../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc overview
 * @name parentsAndChildren
 * @description
 * Functions related to parents and children relationships
 *
 * {@link https://familysearch.org/developers/docs/api/resources#parents-and-children FamilySearch API Docs}
 */

var childAndParentsConvenienceFunctions = {
  getRelationship: function() { return maybe(this.getData().childAndParentsRelationships)[0]; },
  getPerson:       function(id) { return utils.find(this.getData().persons, {id: id}); }
};

/**
 * @ngdoc function
 * @name parentsAndChildren.functions:getChildAndParents

 *
 * @description
 * Get information about a child and parents relationship.
 * The response includes the following convenience functions
 *
 * - `getRelationship()` - a {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship
 * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
 * {@link person.types:constructor.Person Person} for a person id in the relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the child-and-parents relationship
 * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
 * which you can access using the `getPerson(id)` convenience function.
 * @return {Object} promise for the response
 */
FS.prototype.getChildAndParents = function(url, params) {
  var self = this;
  return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    utils.forEach(response.getData().persons, function(person, index, obj){
      obj[index] = self.createPerson(person);
    });
    utils.forEach(response.getData().childAndParentsRelationships, function(rel, index, obj){
      obj[index] = self.createChildAndParents(rel);
    });
    return utils.extend(response, childAndParentsConvenienceFunctions);
  });
};

/**
 * @ngdoc function
 * @name parentsAndChildren.functions:deleteChildAndParents

 *
 * @description
 * Delete the specified relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the child-and-parents relationship
 * @param {string} changeMessage reason for the deletion
 * @return {Object} promise for the response
 */
FS.prototype.deleteChildAndParents = function(url, changeMessage) {
  var self = this;
  var headers = {'Content-Type': 'application/x-fs-v1+json'};
  if (changeMessage) {
    headers['X-Reason'] = changeMessage;
  }
  return self.plumbing.del(url, headers);
};

/**
 * @ngdoc function
 * @name parentsAndChildren.functions:restoreChildAndParents

 *
 * @description
 * Restore a deleted child and parents relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Restore_resource FamilySearch API Docs}
 * 
 *
 * @param {string} url full URL of the child-and-parents relationship
 * @param {string} changeMessage reason for the deletion
 * @return {Object} promise for the response
 */
FS.prototype.restoreChildAndParents = function(url) {
  return this.plumbing.post(url, null, {'Content-Type': 'application/x-fs-v1+json'});
};

},{"../FamilySearch":5,"../utils":57}],46:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc overview
 * @name pedigree
 * @description
 * Get someone's ancestry or descendancy
 *
 * {@link https://familysearch.org/developers/docs/api/resources#pedigree FamilySearch API Docs}
 */

/**
 * Generate ancestry or descendancy convenience functions
 *
 * @param numberLabel ascendancyNumber or descendancyNumber
 * @returns {{getPersons: Function, exists: Function, getPerson: Function}}
 */
function pedigreeConvenienceFunctionGenerator(numberLabel) {
  return {
    getPersons:    function()    { return maybe(this.getData()).persons; },
    exists:        function(num) { return !!maybe(maybe(utils.find(maybe(this.getData()).persons, matchPersonNum(numberLabel, num))).data).id; },
    getPerson:     function(num) { return utils.find(maybe(this.getData()).persons, matchPersonNum(numberLabel, num)); }
  };
}

function matchPersonNum(numberLabel, num) {
  return function(p) {
    /*jshint eqeqeq:false */
    return p.getDisplay()[numberLabel] == num; // == so users can pass in either numbers or strings for ascendancy numbers
  };
}

/**
 * @ngdoc function
 * @name pedigree.functions:getAncestry

 *
 * @description
 * Get the ancestors of a specified person and optionally a specified spouse with the following convenience functions
 *
 * - `getPersons()` - return an array of {@link person.types:constructor.Person Persons}
 * - `getPerson(ascendancyNumber)` - return a {@link person.types:constructor.Person Person}
 * - `exists(ascendancyNumber)` - return true if a person with ascendancy number exists
 * - `getDescendant(descendancyNumber)` - return a {@link person.types:constructor.Person Person} if the descendants parameter is true
 * - `existsDescendant(ascendancyNumber)` - return true if a person with descendancy number exists if the descendants parameter is true
 *
 * ### Notes
 *
 * * Each Person object has an additional `getAscendancyNumber()` function that returns the person's ascendancy number,
 * and if the descendants parameter is true, a getDescendancyNumber() function that returns the person's descendancy number
 * * Some information on the Person objects is available only if `params` includes `personDetails`
 * * If `params` includes `marriageDetails`, then `person.display` includes `marriageDate` and `marriagePlace`.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Ancestry_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @param {Object=} params includes `generations` to retrieve (max 8),
 * `spouse` id to get ancestry of person and spouse,
 * `personDetails` set to true to retrieve full person objects for each ancestor,
 * `descendants` set to true to retrieve one generation of descendants
 * @return {Object} promise for the ancestry response
 */
FS.prototype.getAncestry = function(pid, params) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSFT', 'ancestry-query').then(function(url) {
    return self.plumbing.get(url, utils.extend({'person': pid}, params));
  }).then(function(response){
    var data = maybe(response.getData());
    
    utils.forEach(data.persons, function(person, index, obj){
      obj[index] = self.createPerson(person);
    });
    
    // Add getAscendancyNumber method to persons
    utils.forEach(data.persons, function(person){
      person.getAscendancyNumber = function() { 
        return this.data.display.ascendancyNumber; 
      };
    });
    
    // Add getDescendancyNumber method to persons
    // and other helpers to the response if the descendants were requested
    if(!!params && !!params.descendants){
      utils.forEach(data.persons, function(person){
        person.getDescendancyNumber = function() { 
          return this.data.display.descendancyNumber; 
        };
      });
      
      utils.extend(response, {
        getDescendant:    function(num) { return utils.find(data.persons, matchPersonNum('descendancyNumber', num)); },
        existsDescendant: function(num) { return !!maybe(utils.find(data.persons, matchPersonNum('descendancyNumber', num))).id; }
      });
    }
    
    return utils.extend(response, pedigreeConvenienceFunctionGenerator('ascendancyNumber'));
  });
};

/**
 * @ngdoc function
 * @name pedigree.functions:getDescendancy

 *
 * @description
 * Get the descendants of a specified person and optionally a specified spouse with the following convenience functions
 * (similar convenience functions as getAncestry)
 *
 * - `getPersons()` - return an array of {@link person.types:constructor.Person Persons}
 * - `getPerson(descendancyNumber)` - return a {@link person.types:constructor.Person Person}
 * - `exists(descendancyNumber)` - return true if a person with ascendancy number exists
 *
 * ### Notes
 *
 * * Each Person object has an additional `getDescendancyNumber()` function that returns the person's descendancy number.
 * * Some information on the Person objects is available only if `params` includes `personDetails`
 * * If `params` includes `marriageDetails`, then `person.display` includes `marriageDate` and `marriagePlace`.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Descendancy_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @param {Object=} params includes
 * `generations` to retrieve max 2,
 * `spouse` id to get descendency of person and spouse (set to null to get descendants of unknown spouse),
 * `marriageDetails` set to true to provide marriage details, and
 * `personDetails` set to true to provide person details.
 * @return {Object} promise for the descendancy
 */
FS.prototype.getDescendancy = function(pid, params) {
  var self = this;
  // descendancy query is not yet available (14 August 2015) so it's hard-coded for now
  // return self.plumbing.getCollectionUrl('FSFT', 'descendancy-query'),
  return Promise.resolve(self.helpers.getAPIServerUrl('/platform/tree/descendancy')).then(function(url) {
    return self.plumbing.get(url, utils.extend({'person': pid}, params));
  }).then(function(response){
    var data = maybe(response.getData());
    utils.forEach(data.persons, function(person, index, obj){
      obj[index] = self.createPerson(person);
      obj[index].getDescendancyNumber = function() { return this.data.display.descendancyNumber; };
    });
    return utils.extend(response, pedigreeConvenienceFunctionGenerator('descendancyNumber'));
  });
};

},{"./../FamilySearch":5,"./../utils":57}],47:[function(require,module,exports){
var FS = require('../FamilySearch'),
    utils = require('../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc overview
 * @name person
 * @description
 * Functions related to persons
 *
 * {@link https://familysearch.org/developers/docs/api/resources#person FamilySearch API Docs}
 */

// TODO consider moving to another documentation generator so we can link to _methods_ like save and delete

/**
 * @ngdoc function
 * @name person.functions:getPerson

 *
 * @description
 * Get the specified person
 * The response includes the following convenience function
 *
 * - `getPerson()` - get the {@link person.types:constructor.Person Person} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 *
 * @param {String} pid id or full URL of the person
 * @return {Object} promise for the response
 */
FS.prototype.getPerson = function(pid) {
  var self = this,
      urlPromise = self.helpers.isAbsoluteUrl(pid) ? Promise.resolve(pid) : self.plumbing.getCollectionUrl('FSFT', 'person', {pid: pid});
  return urlPromise.then(function(url) {
    return self.plumbing.get(url);
  }).then(function(response){
    var person = response.getData().persons[0] = self.createPerson(response.getData().persons[0]);
    person.isReadOnly = function() {
      var allowHeader = response.getHeader('Allow');
      return !!allowHeader && allowHeader.indexOf('POST') < 0;
    };
    return utils.extend(response, {
      getPerson: function() { return person; }
    });
  });
};

/**
 * @ngdoc function
 * @name person.functions:getMultiPerson

 *
 * @description
 * Get multiple people at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 *
 * @param {Array} pids array of ids or urls for the people to read
 * @return {Object} promise that is fulfilled when all of the people have been read,
 * returning a map of person id to {@link person.functions:getPerson getPerson} response
 */
FS.prototype.getMultiPerson = function(pids) {
  var promises = [],
      responses = {},
      self = this;
  utils.forEach(pids, function(pid) {
    promises.push(self.getPerson(pid).then(function(response){
      responses[pid] = response;
    }));
  });
  return Promise.all(promises).then(function(){
    return responses;
  });
};

/**
 * Expose globally so that other files can access it
 */
FS.prototype._personsAndRelationshipsMapper = function(response){
  var self = this;
  
  utils.forEach(response.getData().persons, function(person, index, obj){
    obj[index] = self.createPerson(person);
  });
  utils.forEach(response.getData().relationships, function(rel, index, obj){
    // This will create couple objects for ParentChild relationships
    // but those are ignored/filtered out in the convenience functions.
    // TODO: try removing the ParentChild relationships
    obj[index] = self.createCouple(rel);
  });
  utils.forEach(response.getData().childAndParentsRelationships, function(rel, index, obj){
    obj[index] = self.createChildAndParents(rel);
  });
  
  return utils.extend(response, {
    getCoupleRelationships: function() { 
      return utils.filter(maybe(this.getData()).relationships, function(rel){
        return rel.data.type === 'http://gedcomx.org/Couple';
      }) || []; 
    },
    getChildAndParentsRelationships: function() { 
      return maybe(this.getData()).childAndParentsRelationships || []; 
    },
    getPerson: function(id) { 
      return utils.find(this.getData().persons, function(person){
        return person.getId() === id;
      });
    }
  });
};

/**
 * @ngdoc function
 * @name person.functions:getPersonWithRelationships

 *
 * @description
 * Get a person and their children, spouses, and parents.
 * The response has the following convenience functions:
 *
 * - `getPrimaryId()` - id of the person returned
 * - `getRequestedId()` - person id that was requested; may differ from primary id
 * when the requested id was deleted due to a merge
 * - `getFatherIds()` - array of ids
 * - `getMotherIds()` - array of ids
 * - `getSpouseIds()` - array of ids
 * - `getChildIds()` - array of ids of all children
 * - `getChildIdsOf(spouseId)` - array of ids; if `spouseId` is null/undefined, return ids of children without the other parent
 * - `getParentRelationships()` - array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship objects
 * - `getSpouseRelationships()` - array of {@link spouses.types:constructor.Couple Couple} relationship objects
 * - `getSpouseRelationship(spouseId)` - {@link spouses.types:constructor.Couple Couple} relationship with the specified spouse
 * - `getChildRelationships()` - array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship objects
 * - `getChildRelationshipsOf(spouseId)` - array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship objects
 * if `spouseId` is null/undefined, return ids of child relationships without the other parent
 * - `getPrimaryPerson()` - {@link person.types:constructor.Person Person} object for the primary person
 *
 * In addition, the following functions are available if persons is set to true in params
 *
 * - `getPerson(id)` - {@link person.types:constructor.Person Person} object for the person with `id`
 * - `getFathers()` - array of father {@link person.types:constructor.Person Persons}
 * - `getMothers()` - array of mother {@link person.types:constructor.Person Persons}
 * - `getSpouses()` - array of spouse {@link person.types:constructor.Person Persons}
 * - `getChildren()` - array of all child {@link person.types:constructor.Person Persons};
 * - `getChildrenOf(spouseId)` - array of child {@link person.types:constructor.Person Persons};
 * if `spouseId` is null/undefined, return children without the other parent
 * - `wasRedirected()` - returns true when the primary id is different from the requested id
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_With_Relationships_resource FamilySearch API Docs}
 *
 *
 * @param {String} pid id of the person
 * @param {Object=} params set `persons` to true to retrieve full person objects for each relative
 * @return {Object} promise for the person with relationships
 */
FS.prototype.getPersonWithRelationships = function(pid, params) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSFT', 'person-with-relationships').then(function(url) {
    return self.plumbing.get(url, utils.extend({'person': pid}, params));
  }).then(function(response){
    response = self._personsAndRelationshipsMapper(response);
    response.getData().persons[0].isReadOnly = function() {
      var allowHeader = response.getHeader('Allow');
      return !!allowHeader && allowHeader.indexOf('POST') < 0;
    };
    return utils.extend(response, {
      getRequestedId: function() { return pid; },
      getPrimaryId: function() {
        var sourceDescriptionId = this.getData().description.substring(1),
            sourceDescription = utils.find(this.getData().sourceDescriptions, function(sourceDescription){
              return sourceDescription.id === sourceDescriptionId;
            });
        if(sourceDescription){
          return sourceDescription.about.substring(1);
        }
      },
      getPerson: function(id) { 
        return utils.find(this.getData().persons, function(person){
          return person.getId() === id;
        });
      },
      getPrimaryPerson: function() { return this.getPerson(this.getPrimaryId()); },
      getParentRelationships: function() {
        var primaryId = this.getPrimaryId();
        return utils.filter(this.getData().childAndParentsRelationships, function(r) {
          return r.getChildId() === primaryId;
        });
      },
      getSpouseRelationships: function() {
        return utils.filter(this.getData().relationships, function(r) {
          return r.data.type === 'http://gedcomx.org/Couple';
        });
      },
      getSpouseRelationship: function(spouseId) {
        var primaryId = this.getPrimaryId();
        return utils.find(this.getData().relationships, function(r) {
          return r.data.type === 'http://gedcomx.org/Couple' &&
            (primaryId === r.getHusbandId() ? r.getWifeId() : r.getHusbandId()) === spouseId;
        });
      },
      getChildRelationships: function() {
        var primaryId = this.getPrimaryId();
        return utils.filter(this.getData().childAndParentsRelationships, function(r) {
          return r.getFatherId() === primaryId || r.getMotherId() === primaryId;
        });
      },
      getChildRelationshipsOf: function(spouseId) {
        var primaryId = this.getPrimaryId();
        return utils.filter(this.getData().childAndParentsRelationships, function(r) {
          /*jshint eqeqeq:false */
          return (r.getFatherId() === primaryId || r.getMotherId() === primaryId) &&
            (r.getFatherId() == spouseId || r.getMotherId() == spouseId); // allow spouseId to be null or undefined
        });
      },
      getFatherIds: function() {
        return utils.uniq(utils.map(
          utils.filter(this.getParentRelationships(), function(r) {
            return !!r.getFatherId();
          }),
          function(r) {
            return r.getFatherId();
          }, this));
      },
      getFathers: function() { return utils.map(this.getFatherIds(), this.getPerson, this); },
      getMotherIds: function() {
        return utils.uniq(utils.map(
          utils.filter(this.getParentRelationships(), function(r) {
            return !!r.getMotherId();
          }),
          function(r) {
            return r.getMotherId();
          }, this));
      },
      getMothers: function() { return utils.map(this.getMotherIds(), this.getPerson, this); },
      getSpouseIds: function() {
        return utils.uniq(utils.map(
          utils.filter(this.getSpouseRelationships(), function(r) {
            return r.getHusbandId() && r.getWifeId(); // only consider couple relationships with both spouses
          }),
          function(r) {
            return this.getPrimaryId() === r.getHusbandId() ? r.getWifeId() : r.getHusbandId();
          }, this));
      },
      getSpouses: function() { return utils.map(this.getSpouseIds(), this.getPerson, this); },
      getChildIds: function() {
        return utils.uniq(utils.map(this.getChildRelationships(),
          function(r) {
            return r.getChildId();
          }, this));
      },
      getChildren: function() { return utils.map(this.getChildIds(), this.getPerson, this); },
      getChildIdsOf: function(spouseId) {
        return utils.uniq(utils.map(this.getChildRelationshipsOf(spouseId),
          function(r) {
            return r.getChildId();
          }, this));
      },
      getChildrenOf: function(spouseId) { return utils.map(this.getChildIdsOf(spouseId), this.getPerson, this); },
      wasRedirected: function() {
        return this.getPrimaryId() !== this.getRequestedId();
      }
    });
  });
};

/**
 * @ngdoc function
 * @name person.functions:deletePerson

 *
 * @description
 * Delete the specified person.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id or full URL of the person
 * @param {string} changeMessage reason for the deletion
 * @return {Object} promise for the response
 */
FS.prototype.deletePerson = function(pid, changeMessage) {
  var self = this,
      urlPromise = self.helpers.isAbsoluteUrl(pid) ? Promise.resolve(pid) : self.plumbing.getCollectionUrl('FSFT', 'person', {pid: pid});
  return urlPromise.then(function(url) {
    return self.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {});
  });
};

/**
 * @ngdoc function
 * @name person.functions:getPreferredSpouse

 *
 * @description
 * Get the preferred Couple relationship id if any for this person and this user.
 * The response has the following convenience function:
 * 
 * - `getPreferredSpouse()` - returns the url of the preferred couple relationship,
 * null if it is the unknown spouse, or undefined if there is no preference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Spouse_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @return {Object} promise for the response
 */
FS.prototype.getPreferredSpouse = function(pid) {
  var self = this;
  return self.getCurrentUser().then(function(response) {
    var uid = response.getUser().getTreeUserId();
    return self.plumbing.getCollectionUrl('FSFT', 'preferred-spouse-relationship', {uid: uid, pid: pid});
  }).then(function(url) {
    return self.plumbing.get(url + '.json', null, { 'X-Expect-Override': '200-ok' });
  }).then(function(response){
    response.getPreferredSpouse = function(){
      if (response.getStatusCode() === 200) {
        var contentLocation = response.getHeader('Location');
        if (contentLocation.indexOf('child-and-parents-relationships') >= 0) {
          return null;
        }
        else {
          return contentLocation;
        }
      }
    };
    return response;
  });
};

/**
 * @ngdoc function
 * @name person.functions:setPreferredSpouse

 *
 * @description
 * Set the preferred spouse for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Spouse_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @param {string} curl url of the preferred couple relationship. You may also pass in a child and parents relationship url
 * if you want to set the preferred spouse as a missing/unknown spouse.
 * @return {Object} promise for the response
 */
FS.prototype.setPreferredSpouse = function(pid, curl) {
  var location = curl,
      self = this;
  return self.getCurrentUser().then(function(response) {
    var uid = response.getUser().getTreeUserId();
    return self.plumbing.getCollectionUrl('FSFT', 'preferred-spouse-relationship', {uid: uid, pid: pid});
  }).then(function(url) {
    return self.plumbing.put(url, null, {'Location': location});
  });
};

/**
 * @ngdoc function
 * @name person.functions:deletePreferredSpouse

 *
 * @description
 * Delete the preferred spouse preference for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Spouse_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @return {Object} promise for the response
 */
FS.prototype.deletePreferredSpouse = function(pid) {
  var self = this;
  return self.getCurrentUser().then(function(response) {
    var uid = response.getUser().getTreeUserId();
    return self.plumbing.getCollectionUrl('FSFT', 'preferred-spouse-relationship', {uid: uid, pid: pid});
  }).then(function(url) {
    return self.plumbing.del(url);
  });
};

/**
 * @ngdoc function
 * @name person.functions:getPreferredParents

 *
 * @description
 * Get the preferred ChildAndParents relationship id if any for this person and this user.
 * The response has the following convenience function:
 * 
 * - `getPreferredParents()` - returns the url of the preferred ChildAndParents relationship
 * or undefined if there is no preference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Parent_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @param {Object=} params currently unused
 * @return {Object} promise for the response
 */
FS.prototype.getPreferredParents = function(pid) {
  var self = this;
  return self.getCurrentUser().then(function(response) {
    var uid = response.getUser().getTreeUserId();
    return self.plumbing.getCollectionUrl('FSFT', 'preferred-parent-relationship', {uid: uid, pid: pid});
  }).then(function(url) {
    // TODO remove accept header when FS bug is fixed (last checked 4/2/14) - unable to check 14 July 14
    // couldn't check 14 July 14 because the endpoint returns a 403 now
    return self.plumbing.get(url + '.json', null, {Accept: 'application/x-fs-v1+json', 'X-Expect-Override': '200-ok'});
  }).then(function(response){
    response.getPreferredParents = function(){
      return response.getStatusCode() === 200 ? response.getHeader('Location') : void 0;
    };
    return response;
  });
};

/**
 * @ngdoc function
 * @name person.functions:setPreferredParents

 *
 * @description
 * Set the preferred parents for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Parent_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @param {string} curl url of the preferred ChildAndParents relationship
 * @return {Object} promise for the response
 */
FS.prototype.setPreferredParents = function(pid, curl) {
  var childAndParentsUrl = curl,
      self = this;
  return self.getCurrentUser().then(function(response){
    var uid = response.getUser().getTreeUserId();
    return self.plumbing.getCollectionUrl('FSFT', 'preferred-parent-relationship', {uid: uid, pid: pid});
  }).then(function(url){
    return self.plumbing.put(url, null, {'Location': childAndParentsUrl});
  });
};

/**
 * @ngdoc function
 * @name person.functions:deletePreferredParents

 *
 * @description
 * Delete the preferred parents preference for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Parent_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @return {Object} promise for the response
 */
FS.prototype.deletePreferredParents = function(pid) {
  var self = this;
  return self.getCurrentUser().then(function(response) {
    var uid = response.getUser().getTreeUserId();
    return self.plumbing.getCollectionUrl('FSFT', 'preferred-parent-relationship', {uid: uid, pid: pid});
  }).then(function(url) {
    return self.plumbing.del(url);
  });
};

// TODO person merge
// TODO person not a match

},{"../FamilySearch":5,"../utils":57}],48:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc overview
 * @name places
 * @description
 * Functions for interacting with the FamilySearch Place Authority
 *
 * {@link https://familysearch.org/developers/docs/api/resources#places FamilySearch API Docs}
 */
 
/**
 * @ngdoc function
 * @name places.functions:getPlace
 *
 * @description
 * Get a place.
 *
 * - `getPlace()` - get the {@link places.types:constructor.PlaceDescription PlaceDescription} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_resource API Docs}
 *
 * @param {String} url full url of a place
 * @return {Object} promise for the response
 */
FS.prototype.getPlace = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var data = utils.maybe(response.getData());
    utils.forEach(data.places, function(place, index, obj){
      obj[index] = self.createPlaceDescription(place);
    });
    return utils.extend(response, {
      getPlace: function() { 
        return utils.maybe(data.places)[0]; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceDescription

 *
 * @description
 * Get a place.
 *
 * - `getPlaceDescription()` - get the {@link places.types:constructor.PlaceDescription PlaceDescription} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Description_resource API Docs}
 * 
 *
 * @param {String} url full url of the place description
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceDescription = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var data = utils.maybe(response.getData()),
        placesMap = {};
    
    utils.forEach(data.places, function(place, index, obj){
      obj[index] = placesMap[place.id] = self.createPlaceDescription(place);
    });
    
    utils.forEach(data.places, function(place){
      if(place.data.jurisdiction && place.data.jurisdiction.resource){
        var jurisdictionId = place.data.jurisdiction.resource.substring(1);
        if(placesMap[jurisdictionId]){
          place.setJurisdiction(placesMap[jurisdictionId]);
        }
      }
    });
    
    return utils.extend(response, {
      getPlaceDescription: function() { 
        return utils.maybe(data.places)[0]; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceSearch

 *
 * @description
 * Search for a place.
 *
 * - `getSearchResults()` - get an array of {@link places.types:constructor.PlacesSearchResult PlacesSearchResults} from the response.
 * 
 * __Search Parameters__
 * 
 * * `start` - The index of the first search result for this page of results.
 * * `count` - The number of search results per page.
 * * `name`
 * * `partialName`
 * * `date`
 * * `typeId`
 * * `typeGroupId`
 * * `parentId`
 * * `latitude`
 * * `longitude`
 * * `distance`
 * 
 * Read the {@link https://familysearch.org/developers/docs/api/places/Places_Search_resource API Docs} for more details on how to use the parameters.
 * 
 *
 * @param {String} id of the place description
 * @return {Object} promise for the response
 */
FS.prototype.getPlacesSearch = function(params) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSPA', 'place-search').then(function(url){
    return self.plumbing.get(url, utils.removeEmptyProperties({
      q: utils.searchParamsFilter(utils.removeEmptyProperties(utils.extend({}, params))),
      start: params.start,
      count: params.count
    }), {'Accept': 'application/x-gedcomx-atom+json'});
  }).then(function(response){
    var data = utils.maybe(response.getData());
    utils.forEach(data.entries, function(entry, i, obj){
      obj[i] = self.createPlacesSearchResult(entry);
    });
    return utils.extend(response, {
      getSearchResults: function() { 
        return utils.maybe(data.entries); 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceDescriptionChildren

 *
 * @description
 * Get the children of a Place Description. Use {@link places.functions:getPlaceSearch getPlacesSearch()} to filter by type, date, and more.
 *
 * - `getChildren()` - get an array of the {@link places.types:constructor.PlaceDescription PlaceDescriptions} (children) from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Description_Children_resource API Docs}
 * 
 *
 * @param {String} url full url for the place descriptions children endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceDescriptionChildren = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var data = utils.maybe(response.getData());
    utils.forEach(data.places, function(place, index, obj){
      obj[index] = self.createPlaceDescription(place);
    });
    return utils.extend(response, {
      getChildren: function() { 
        return utils.maybe(data.places); 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceType

 *
 * @description
 * Get a place.
 *
 * - `getPlaceType()` - get the {@link vocabularies.types:constructor.VocabularyElement VocabularyElement} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Type_resource API Docs}
 * 
 *
 * @param {String} id of the place
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceType = function(typeId) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSPA', 'place-type', {ptid: typeId}).then(function(url){
    return self.plumbing.get(url, {}, {'Accept': 'application/ld+json'});
  }).then(function(response){
    return utils.extend(response, {
      getPlaceType: function() { 
        return self.createVocabularyElement(this.getData());
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceTypes

 *
 * @description
 * Get a list of all available Place Types.
 *
 * - `getList()` - get the {@link vocabularies.types:constructor.VocabularyList VocabularyList} from the response
 * - `getPlaceTypes()` - get an array of the {@link vocabularies.types:constructor.VocabularyElement VocabularyElements} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Types_resource API Docs}
 * 
 *
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceTypes = function() {
  var self = this;
  return self.plumbing.getCollectionUrl('FSPA', 'place-types').then(function(url){
    return self.plumbing.get(url, {}, {'Accept': 'application/ld+json'});
  }).then(function(response){
    return utils.extend(response, {
      getList: function() {
        return self.createVocabularyList(this.getData());
      },
      getPlaceTypes: function() { 
        return this.getList().getElements(); 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceTypeGroup

 *
 * @description
 * Get a Place Type Group which includes a list of Places Types in the group.
 *
 * - `getList()` - get the {@link vocabularies.types:constructor.VocabularyList VocabularyList} (Place Type Group) from the response
 * - `getPlaceTypes()` - get an array of the {@link vocabularies.types:constructor.VocabularyElement VocabularyElements} (Place Types) in the group
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Types_resource API Docs}
 * 
 *
 * @param {String} id of the place type group
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceTypeGroup = function(groupId) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSPA', 'place-type-group', {ptgid: groupId}).then(function(url){
    return self.plumbing.get(url, {}, {'Accept': 'application/ld+json'});
  }).then(function(response){
    return utils.extend(response, {
      getList: function() {
        return self.createVocabularyList(this.getData());
      },
      getPlaceTypes: function() { 
        return this.getList().getElements(); 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceTypeGroups

 *
 * @description
 * Get a list of all available Place Types.
 *
 * - `getList()` - get the {@link vocabularies.types:constructor.VocabularyList VocabularyList} from the response
 * - `getPlaceTypeGroups()` - get an array of the {@link vocabularies.types:constructor.VocabularyElement VocabularyElements} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Type_Groups_resource API Docs}
 * 
 *
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceTypeGroups = function() {
  var self = this;
  return self.plumbing.getCollectionUrl('FSPA', 'place-type-groups').then(function(url){
    return self.plumbing.get(url, {}, {'Accept': 'application/ld+json'});
  }).then(function(response){
    return utils.extend(response, {
      getList: function() {
        return self.createVocabularyList(this.getData());
      },
      getPlaceTypeGroups: function() { 
        return this.getList().getElements(); 
      }
    });
  });
};
},{"./../FamilySearch":5,"./../utils":57}],49:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc overview
 * @name searchAndMatch
 * @description
 * Functions related to search and match
 *
 * {@link https://familysearch.org/developers/docs/api/resources#search-and-match FamilySearch API Docs}
 */

var searchMatchResponseConvenienceFunctions = {
  getSearchResults: function() { return utils.maybe(this.getData()).entries || []; },
  getResultsCount: function() { return utils.maybe(this.getData()).results || 0; },
  getIndex: function() { return utils.maybe(this.getData()).index || 0; }
};

FS.prototype._getSearchMatchResponseMapper = function(response) {
  var self = this;
  utils.forEach(utils.maybe(response.getData()).entries, function(entry, index, obj){
    obj[index] = self.createSearchResult(entry);
  });
  return utils.extend(response, searchMatchResponseConvenienceFunctions);
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:getPersonSearch

 *
 * @description
 * Search people
 * The response includes the following convenience functions
 *
 * - `getContext()` - get the search context to pass into subsequent requests for additional results
 * - `getSearchResults()` - get the array of {@link searchAndMatch.types:constructor.SearchResult SearchResults} from the response
 * - `getResultsCount()` - get the total number of search results
 * - `getIndex()` - get the starting index of the results array
 *
 * ### Search parameters
 * In the list below, {relation} can be father, mother, or spouse.
 * For non-exact matches, append a tilde (~) to the end of the parameter value.
 * (The tilde works for name parameters; does it work for dates and places as well?)
 *
 * - `start` - index of first result
 * - `count` - number of results
 * - `context` - the search context token, which is returned from search requests and allows requests for subsequent pages
 * - `name` - full name
 * - `givenName`
 * - `surname`
 * - `gender` - male or female
 * - `birthDate`
 * - `birthPlace`
 * - `deathDate`
 * - `deathPlace`
 * - `marriageDate`
 * - `marriagePlace`
 * - {relation}`Name`
 * - {relation}`GivenName`
 * - {relation}`Surname`
 * - {relation}`BirthDate`
 * - {relation}`BirthPlace`
 * - {relation}`DeathDate`
 * - {relation}`DeathPlace`
 * - {relation}`MarriageDate`
 * - {relation}`MarriagePlace`
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Search_resource FamilySearch API Docs}
 *
 *
 * @param {Object} params described above
 * @return {Object} promise for the response
 */
FS.prototype.getPersonSearch = function(params) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSFT', 'person-search').then(function(url) {
    return self.plumbing.get(url, utils.removeEmptyProperties({
        q: utils.searchParamsFilter(utils.removeEmptyProperties(utils.extend({}, params))),
        start: params.start,
        count: params.count,
        context: params.context
      }), {'Accept': 'application/x-gedcomx-atom+json'});
  }).then(function(response){
    response.getContext = function() {
      return response.getHeader('X-FS-Page-Context');
    };
    return self._getSearchMatchResponseMapper(response);
  });
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:getPersonMatches

 *
 * @description
 * Get the matches (possible duplicates) for a person
 * The response includes the following convenience function
 *
 * - `getSearchResults()` - get the array of {@link searchAndMatch.types:constructor.SearchResult SearchResults} from the response
 * - `getResultsCount()` - get the total number of search results
 * - `getIndex()` - get the starting index of the results array
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Matches_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the person-matches endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getPersonMatches = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-gedcomx-atom+json'}).then(function(response){
    return self._getSearchMatchResponseMapper(response);
  });
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:getPersonMatchesQuery

 *
 * @description
 * Get matches for someone not in the tree
 * The response includes the following convenience function
 *
 * - `getSearchResults()` - get the array of {@link searchAndMatch.types:constructor.SearchResult SearchResults} from the response
 * - `getResultsCount()` - get the total number of search results
 * - `getIndex()` - get the starting index of the results array
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Search_resource FamilySearch API Docs}
 *
 *
 * @param {Object} params generally the same parameters as described for
 * {@link searchAndMatch.functions:getPersonSearch getPersonSearch}, with the the following differences:
 * `context` is not a valid parameter for match,
 * `fatherId`, `motherId`, and `spouseId` assist in finding matches for people whose relatives have already been matched, and
 * `candidateId` restricts matches to the person with that Id (what does this mean?)
 * @return {Object} promise for the response
 */
FS.prototype.getPersonMatchesQuery = function(params) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSFT', 'person-matches-query').then(function(url) {
    return self.plumbing.get(url, utils.removeEmptyProperties({
      q: utils.searchParamsFilter(utils.removeEmptyProperties(utils.extend({}, params))),
      start: params.start,
      count: params.count
    }), {'Accept': 'application/x-gedcomx-atom+json'});
  }).then(function(response){
    return self._getSearchMatchResponseMapper(response);
  });
};

},{"./../FamilySearch":5,"./../utils":57}],50:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * Get the url for a user's source descriptions collection. We first make a request
 * to the source-descriptions endpoint which responds with a forward to the current
 * user's source descriptions collection. We have to set a special header so that
 * the server responds with a 200 instead of a 30X, otherwise browsers will
 * automatically forward and we won't get the url. We don't want them to automatically
 * forward because the behavior is undefined in official specs, meaning they don't
 * all consistently repeat the proper headers, plus we lose query params if the
 * server doesn't include them in the Location header on the response.
 * 
 * @return promise for the url
 */
FS.prototype._getUserSourceDescriptionsUrl = function(){
  var self = this,
      headers = {
        'Accept': 'application/x-fs-v1+json',
        'X-Expect-Override': '200-ok'
      };
  return self.plumbing.getCollectionUrl('FSFT', 'source-descriptions').then(function(url){
    return self.plumbing.get(url, null, headers);
  }).then(function(response){
    return response.getHeader('Location');
  });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:getCollectionsForUser

 *
 * @description
 * Get the collections for the current user
 * The response includes the following convenience function:
 *
 * - `getCollections()` - get an array of {@link sourceBox.types:constructor.Collection Collections} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User_Source_Folders_resource FamilySearch API Docs}
 *
 *
 * @return {Object} promise for the response
 */
FS.prototype.getCollectionsForUser = function() {
  var self = this;
  return self.plumbing.getCollectionUrl('FSUDS', 'subcollections').then(function(url) {
    var headers = {'Accept': 'application/x-fs-v1+json', 'X-Expect-Override': '200-ok'};
    return self.plumbing.get(url, null, headers);
  }).then(function(response){
    return response.getHeader('Location');
  }).then(function(url) {
    return self.plumbing.get(url, {}, {'Accept': 'application/x-fs-v1+json'});
  }).then(function(response){
    var data = maybe(response.getData());
    utils.forEach(data.collections, function(collection, index, obj){
      obj[index] = self.createCollection(collection);
    });
    return utils.extend(response, {
      getCollections: function() { 
        return data.collections || [];
      }
    });
  });  
};

/**
 * @ngdoc function
 * @name sourceBox.functions:getCollection

 *
 * @description
 * Get information about a user-defined collection
 * The response includes the following convenience function
 *
 * - `getCollection()` - get a {@link sourceBox.types:constructor.Collection Collection} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Folder_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the collection
 * @return {Object} promise for the response
 */
FS.prototype.getCollection = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    var data = maybe(response.getData());
    utils.forEach(data.collections, function(collection, index, obj){
      obj[index] = self.createCollection(collection);
    });
    return utils.extend(response, {
      getCollection: function() { 
        return maybe(data.collections)[0];
      }
    });
  });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:getCollectionSourceDescriptions

 *
 * @description
 * Get a paged list of source descriptions in a user-defined collection
 * The response includes the following convenience function
 *
 * - `getSourceDescriptions()` - get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Folder_Source_Descriptions_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the collection-source-descriptions endpoint
 * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
 * @return {Object} promise for the response
 */
FS.prototype.getCollectionSourceDescriptions = function(url, params) {
  var self = this;
  return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    var data = maybe(response.getData());
    utils.forEach(data.sourceDescriptions, function(source, index, obj){
      obj[index] = self.createSourceDescription(source);
    });
    return utils.extend(response, {
      getSourceDescriptions: function() { 
        return data.sourceDescriptions || []; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:getCollectionSourceDescriptionsForUser

 *
 * @description
 * Get a paged list of source descriptions in all user-defined collections defined by a user
 * The response includes the following convenience function
 *
 * - `getSourceDescriptions()` - get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User_Source_Descriptions_resource FamilySearch API Docs}
 *
 *
 * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
 * @return {Object} promise for the response
 */
FS.prototype.getCollectionSourceDescriptionsForUser = function(params) {
  var self = this;
  return self._getUserSourceDescriptionsUrl().then(function(url){
    return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'});
  }).then(function(response){
    var data = maybe(response.getData());
    utils.forEach(data.sourceDescriptions, function(source, index, obj){
      obj[index] = self.createSourceDescription(source);
    });
    return utils.extend(response, {
      getSourceDescriptions: function() { 
        return data.sourceDescriptions || []; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:moveSourceDescriptionsToCollection

 *
 * @description
 * Move the specified source descriptions to the specified collection
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Folder_Source_Descriptions_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the collection descriptions endpoint
 * @param {SourceDescription[]|string[]} srcDescs array of source descriptions - may be objects or id's
 * @return {Object} promise for the response
 */
FS.prototype.moveSourceDescriptionsToCollection = function(url, srcDescs) {
  var self = this;
  var srcDescIds = utils.map(srcDescs, function(srcDesc) {
    return { id: (srcDesc instanceof FS.SourceDescription) ? srcDesc.id : srcDesc };
  });
  return self.plumbing.post(url, { sourceDescriptions: srcDescIds });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:removeSourceDescriptionsFromCollections

 *
 * @description
 * Remove the specified source descriptions from all collections
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User_Source_Descriptions_resource FamilySearch API Docs}
 *
 *
 * @param {SourceDescription[]|string[]} srcDescs array of source descriptions - may be objects or id's
 * @return {Object} promise for the response
 */
FS.prototype.removeSourceDescriptionsFromCollections = function(srcDescs) {
  var self = this;
  return self._getUserSourceDescriptionsUrl().then(function(url) {
    var sdids = utils.map(srcDescs, function(srcDesc) {
      return (srcDesc instanceof FS.SourceDescription) ? srcDesc.id : srcDesc;
    });
    return self.plumbing.del(self.helpers.appendQueryParameters(url, {id: sdids}));
  });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:deleteCollection

 *
 * @description
 * Delete the specified collection
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Folder_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the collection
 * @return {Object} promise for the response
 */
FS.prototype.deleteCollection = function(url) {
  return this.plumbing.del(url);
};

},{"./../FamilySearch":5,"./../utils":57}],51:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc overview
 * @name sources
 * @description
 * Functions related to sources
 *
 * {@link https://familysearch.org/developers/docs/api/resources#sources FamilySearch API Docs}
 */

/**
 * @ngdoc function
 * @name sources.functions:getSourceDescription
 *
 * @description
 * Get information about a source
 * The response includes the following convenience function
 *
 * - `getSourceDescription()` - get the {@link sources.types:constructor.SourceDescription SourceDescription} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 * @param {string} url full URL of the source description
 * @return {Object} promise for the response
 */
FS.prototype.getSourceDescription = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var sourceDescriptions = maybe(maybe(response.getData()).sourceDescriptions);
    for(var i = 0; i < sourceDescriptions.length; i++){
      sourceDescriptions[i] = self.createSourceDescription(sourceDescriptions[i]);
    }
    return utils.extend(response, {
      getSourceDescription: function() { return sourceDescriptions[0]; }
    });
  });
};

/**
 * @ngdoc function
 * @name sources.functions:getMultiSourceDescription
 *
 * @description
 * Get multiple source descriptions at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 * @param {string[]} urls full URLs of the source descriptions
 * @return {Object} promise that is fulfilled when all of the source descriptions have been read,
 * returning a map of source description id or URL to {@link sources.functions:getSourceDescription getSourceDescription} response
 */
FS.prototype.getMultiSourceDescription = function(urls) {
  var self = this,
      promises = [],
      responses = {};
  utils.forEach(urls, function(u) {
    promises.push(
      self.getSourceDescription(u).then(function(response){
        responses[u] = response;
      })
    );
  });
  return Promise.all(promises).then(function(){
    return responses;
  });
};

FS.prototype._getSourceRefsQueryResponseMapper = function(response, includeDescriptions){
  var self = this,
      data = maybe(response.getData());
  
  // If source descriptions are included in the response then process them and
  // add helper methods for accessing them to the response
  if(includeDescriptions){
    utils.forEach(data.sourceDescriptions, function(source, index, obj){
      obj[index] = self.createSourceDescription(source);
    });
    utils.extend(response, {
      getSourceDescriptions: function(){
        return data.sourceDescriptions || [];
      },
      getSourceDescription: function(id) {
        return utils.find(data.sourceDescriptions, function(o){
          return o.getId() === id;
        });
      },
      getPersonIds: function() {
        return utils.map(data.persons, function(person){
          return person.id;
        });
      },
      getCoupleIds: function() {
        return utils.map(data.relationships, function(couple){
          return couple.id;
        });
      },
      getChildAndParentsIds: function() {
        return utils.map(data.childAndParentsRelationships, function(cap){
          return cap.id;
        });
      }
    });
  }
  
  // Process source references
  utils.forEach(['persons','relationships','childAndParentsRelationships'], function(type){
    var selfLinkName = type === 'persons' ? 'person' : 'relationship';
    data[type] = utils.map(data[type], function(entity){
      var entityId = entity.id,
          entityUrl = maybe(maybe(entity.links)[selfLinkName]).href;
      entity.sources = utils.map(entity.sources, function(source){
        var sourceRef = self.createSourceRef(source);
        sourceRef.setAttachedEntityId(entityId);
        sourceRef.setAttachedEntityUrl(entityUrl);
        return sourceRef;
      });
      return entity;
    });
  });
  return utils.extend(response, {
    getPersonSourceRefs: function() {
      return utils.flatMap(maybe(data.persons), function(person) {
        return person.sources;
      });
    },
    getCoupleSourceRefs: function() {
      return utils.flatMap(maybe(data.relationships), function(couple) {
        return couple.sources;
      });
    },
    getChildAndParentsSourceRefs: function() {
      return utils.flatMap(maybe(data.childAndParentsRelationships), function(childAndParents) {
        return childAndParents.sources;
      });
    }
  });
};

/**
 * @ngdoc function
 * @name sources.functions:getSourceRefsQuery
 *
 * @description
 * Get the people, couples, and child-and-parents relationships referencing a source description.
 * To get attachments for a URL, use {@link sources.functions:getSourceAttachments getSourceAttachments}
 * The response includes the following convenience functions
 *
 * - `getPersonSourceRefs()` - get an array of person {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getCoupleSourceRefs()` - get an array of couple relationship {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getChildAndParentsSourceRefs()` - get an array of child and parent relationship {@link sources.types:constructor.SourceRef SourceRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Source_References_Query_resource FamilySearch API Docs}
 * This method uses the `description` parameter of the Source References Query resource.
 *
 * @param {String} url url of the source references query resource of a source description
 * @return {Object} promise for the response
 */
FS.prototype.getSourceRefsQuery = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    self._getSourceRefsQueryResponseMapper(response, false);
    return response;
  });
};

/**
 * @ngdoc function
 * @name sources.functions:getSourceAttachments
 *
 * @description
 * Get the people, couples, and child-and-parents relationships that have the
 * given URL attached as a source. Use {@link sources.functions:getSourceRefsQuery getSourceRefsQuery}
 * to get attachments for an existing source description.
 * 
 * The response includes the following convenience functions
 *
 * - `getPersonSourceRefs()` - get an array of person {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getCoupleSourceRefs()` - get an array of couple relationship {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getChildAndParentsSourceRefs()` - get an array of child and parent relationship {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
 * with the specified source description id from the response
 * 
 * {@link https://familysearch.org/developers/docs/api/tree/Source_References_Query_resource FamilySearch API Docs}.
 * This method uses the `source` parameter of the Source References Query resource.
 *
 * @param {String} url url of the source references query resource of a source description
 * @return {Object} promise for the response
 */
FS.prototype.getSourceAttachments = function(sourceUrl){
  // TODO: update when the link in the tree collection is fixed
  // https://groups.google.com/a/ldsmail.net/d/msg/FSDN/fQaQWkRUQ2o/bIG54_fzBwAJ
  // Last checked 10/10/2015
  //
  // TODO: Remove the feature header when it's been activated
  var self = this,
      params = { source: sourceUrl },
      headers = {'X-FS-Feature-Tag':'local-source-description-references'};
  return this.get('/platform/tree/source-references', params, headers).then(function(response){
    self._getSourceRefsQueryResponseMapper(response, true);
    return response;
  });
};

FS.prototype._getSourcesResponseMapper = function(response, root, includeDescriptions) {
  var self = this,
      data = maybe(response.getData());
      
  // If source descriptions are included in the response then process them and
  // add helper methods for accessing them to the response
  if(includeDescriptions){
    utils.forEach(data.sourceDescriptions, function(source, index, obj){
      obj[index] = self.createSourceDescription(source);
    });
    utils.extend(response, {
      getSourceDescriptions: function() {
        return data.sourceDescriptions || [];
      },
      getSourceDescription: function(id) {
        return utils.find(data.sourceDescriptions, function(o){
          return o.getId() === id;
        });
      }
    });
  }
  
  // Process the source refs and add helper methods to the response
  var rootObj = maybe(maybe(data[root])[0]),
      sources = rootObj.sources;
  if(sources){
    var selfLinkName = root === 'persons' ? 'person' : 'relationship',
        entityId = rootObj.id,
        entityUrl = maybe(maybe(maybe(rootObj).links)[selfLinkName]).href;
    utils.forEach(maybe(maybe(data[root])[0]).sources, function(source, index, obj){
      var sourceRef = self.createSourceRef(source);
      if(source.description.charAt(0) === '#'){
        sourceRef.setSourceDescription(response.getSourceDescription(source.description.substr(1)));
      }
      sourceRef.setAttachedEntityId(entityId);
      sourceRef.setAttachedEntityUrl(entityUrl);
      obj[index] = sourceRef;
    });
  }
  return utils.extend(response, {
    getSourceRefs: function() {
      return maybe(maybe(data[root])[0]).sources || [];
    }
  });
};

/**
 * @ngdoc function
 * @name sources.functions:getSourceRefs
 *
 * @description
 * Get the source references for a person
 * The response includes the following convenience function
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource Person Source References API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_References_resource Couple Source References API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource Child and Parents Source References API Docs}
 *
 *
 * @param {String} url full URL of the source-references endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getSourceRefs = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    self._getSourcesResponseMapper(response, self.helpers.getEntityType(url), false);
    return response;
  });
};

/**
 * @ngdoc function
 * @name sources.functions:getSourcesQuery
 *
 * @description
 * Get source references and descriptions for a person, couple, or child and parents.
 * The response includes the following convenience functions:
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
 * with the specified source description id from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Sources_Query_resource Person Sources Query API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Sources_Query_resource Couple Sources Query API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource Child and Parents Sources Query API Docs}
 *
 *
 * @param {String} url full URL of the sources-query endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getSourcesQuery = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    self._getSourcesResponseMapper(response, self.helpers.getEntityType(url), true);
    return response;
  });
};

/**
 * @ngdoc function
 * @name sources.functions:deleteSourceDescription
 *
 * @description
 * Delete the specified source description as well as all source references that refer to it
 *
 * __NOTE__ if you delete a source description, FamilySearch does not automatically delete references to it.
 * FamilySearch is aware of this issue but hasn't committed to a fix.
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full url of the source description
 * @param {string} changeMessage reason for the deletion
 * @return {Object} promise for the response
 */
FS.prototype.deleteSourceDescription = function(url, changeMessage) {
  return this.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {});
};

/**
 * @ngdoc function
 * @name sources.functions:deleteSourceRef
 *
 * @description
 * Delete the specified source reference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_Reference_resource Person Source Reference API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_Reference_resource Couple Source Reference API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_Reference_resource Child and Parents Source Reference API Docs}
 *
 *
 * @param {string} url url for the source reference
 * @param {string} changeMessage reason for the deletion
 * @return {Object} promise for the response
 */
FS.prototype.deleteSourceRef = function(url, changeMessage) {
  return this.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {});
};

/**
 * This is a helper function shared by Person, Couple, and ChildAndParents.
 * The method creates and attaches a source.
 */
FS.prototype._createAndAttachSource = function(obj, sourceDescription, changeMessage, tags){
  var client = this;
  
  if(!(sourceDescription instanceof FS.SourceDescription)){
    sourceDescription = client.createSourceDescription(sourceDescription);
  }
  
  // Has the source description already been saved?
  var sourceDescriptionPromise = new Promise(function(resolve, reject){
    if(sourceDescription.getId()){
      resolve(sourceDescription);
    } else {
      sourceDescription.save().then(function(){
        resolve(sourceDescription);
      }, function(e){
        reject(e);
      });
    }
  });
  
  // Create the source refererence after the source description is saved
  return sourceDescriptionPromise.then(function(sourceDescription){
    var sourceRef = client.createSourceRef({
      sourceDescription: sourceDescription
    });
    if(tags){
      sourceRef.setTags(tags);
    }
    return sourceRef.save(obj.getLink('source-references').href, changeMessage);
  });
};
},{"./../FamilySearch":5,"./../utils":57}],52:[function(require,module,exports){
var FS = require('../FamilySearch'),
    utils = require('../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name spouses
 * @description
 * Functions related to spouse relationships
 *
 * {@link https://familysearch.org/developers/docs/api/resources#spouses FamilySearch API Docs}
 */

var coupleConvenienceFunctions = {
  getRelationship: function() { return maybe(this.getData().relationships)[0]; },
  getPerson:       function(id) { 
    return utils.find(this.getData().persons, function(person){
      return person.getId() === id;
    }); 
  }
};

/**
 * @ngdoc function
 * @name spouses.functions:getCouple

 *
 * @description
 * Get information about a couple relationship
 * The response includes the following convenience functions
 *
 * - `getRelationship()` - a {@link spouses.types:constructor.Couple Couple} relationship
 * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
 * {@link person.types:constructor.Person Person} for a person id in the relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the couple relationship
 * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
 * which you can access using the `getPerson(id)` convenience function.
 * @return {Object} promise for the response
 */
FS.prototype.getCouple = function(url, params) {
  var self = this;
  return self.plumbing.get(url, params).then(function(response){
    utils.forEach(maybe(response.getData()).persons, function(person, index, obj){
      obj[index] = self.createPerson(person);
    });
    utils.forEach(maybe(response.getData()).relationships, function(rel, index, obj){
      obj[index] = self.createCouple(rel);
    });
    return utils.extend(response, coupleConvenienceFunctions);
  });
};

/**
 * @ngdoc function
 * @name spouses.functions:deleteCouple

 *
 * @description
 * Delete the specified relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the couple relationship
 * @param {string} changeMessage reason for the deletion
 * @return {Object} promise for the response
 */
FS.prototype.deleteCouple = function(url, changeMessage) {
  return this.plumbing.del(url, changeMessage ? {'X-Reason' : changeMessage} : {});
};

/**
 * @ngdoc function
 * @name spouses.functions:restoreCouple

 *
 * @description
 * Restore a deleted couple relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Restore_resource FamilySearch API Docs}
 * 
 *
 * @param {string} crid id or full URL of the couple relationship
 * @return {Object} promise for the response
 */
FS.prototype.restoreCouple = function(url) {
  return this.plumbing.post(url, null, {'Content-Type': 'application/x-fs-v1+json'});
};

},{"../FamilySearch":5,"../utils":57}],53:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name user
 * @description
 * Functions related to users
 *
 * {@link https://familysearch.org/developers/docs/api/resources#user FamilySearch API Docs}
 */

/**
 * @ngdoc function
 * @name user.functions:getCurrentUser
 *
 * @description
 * Get the current user with the following convenience function
 *
 * - `getUser()` - get the {@link user.types:constructor.User User} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/users/Current_User_resource FamilySearch API Docs}
 *
 *
 * @return {Object} a promise for the current user response
 */
FS.prototype.getCurrentUser = function() {
  var self = this;
  return self.plumbing.getCollectionUrl('FSFT', 'current-user').then(function(url) {
    return self.plumbing.get(url);
  }).then(function(response){
    utils.forEach(response.getData().users, function(user, index, obj){
      obj[index] = self.createUser(user);
    });
    response.getUser = function() { return maybe(response.getData().users)[0]; };
    return response;
  });
};

/**
 * @ngdoc function
 * @name user.functions:getAgent
 *
 * @description
 * Get information about the specified agent (contributor)
 * The response includes the following convenience function
 *
 * - `getAgent()` - get the {@link user.types:constructor.Agent Agent} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the agent (contributor)
 */
FS.prototype.getAgent = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    utils.forEach(response.getData().agents, function(agent, index, obj){
      obj[index] = self.createAgent(agent);
    });
    return utils.extend(response, {
      getAgent: function() { return maybe(response.getData().agents)[0]; }
    });
  });
};

/**
 * @ngdoc function
 * @name user.functions:getMultiAgent
 *
 * @description
 * Get multiple agents at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
 *
 *
 * @param {Array} urls an array of full URLs of the agents (contributors) to read
 * @return {Object} promise that is fulfilled when all of the agents have been read,
 * returning a map of agent id to {@link user.functions:getAgent getAgent} response
 */
FS.prototype.getMultiAgent = function(urls, params) {
  var self = this,
      promises = [],
      responses = {};
  utils.forEach(urls, function(url) {
    promises.push(self.getAgent(url, params).then(function(response){
      responses[url] = response;
    }));
  });
  return Promise.all(promises).then(function(){
    return responses;
  });
};

/**
 * @ngdoc function
 * @name user.functions:getCurrentUserPerson
 *
 * @description
 * Get the tree person that represents the current user.
 *
 * - `getPerson()` - get the {@link person.types:constructor.Person Person} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Current_Tree_Person_resource FamilySearch API Docs}
 *
 *
 * @return {Object} a promise for the current user person response
 */
FS.prototype.getCurrentUserPerson = function() {
  var self = this;
  return self.plumbing.getCollectionUrl('FSFT', 'current-user-person').then(function(url) {
    return self.plumbing.get(url, null, { 'X-Expect-Override': '200-ok' });
  }).then(function(response){
    return response.getHeader('Location');
  }).then(function(url){
    return self.getPerson(url);
  });
};

},{"./../FamilySearch":5,"./../utils":57}],54:[function(require,module,exports){
var FS = require('./../FamilySearch');

/**
 * @ngdoc overview
 * @name utilities
 * @description
 * Utility functions
 *
 * {@link https://familysearch.org/developers/docs/api/resources#utilities FamilySearch API Docs}
 */

/**
 * @ngdoc function
 * @name utilities.functions:getRedirectUrl
 *
 * @description
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Redirect_resource FamilySearch API Docs}
 *
 * @param {Object=} params context (details, memories, ordinances, or changes), or person (id), or uri (takes precedence)
 * @return {string} URL with access token that will redirect the user to the specified location
 */
FS.prototype.getRedirectUrl = function(params) {
  return this.helpers.appendAccessToken(this.helpers.appendQueryParameters(this.helpers.getAPIServerUrl('/platform/redirect'), params));
};

/**
 * @ngdoc function
 * @name utilities.functions:getPendingModifications
 *
 * @description Get a list of the pending modifications for the API.
 * The response includes the following convenience function
 *
 * - `getPendingModifications()` - get an array of the pending modifications from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Pending_Modifications_resource FamilySearch API Docs}
 *
 * @return {Object} Promise for the response
 */
FS.prototype.getPendingModifications = function() {
  return this.plumbing.get('/platform/pending-modifications').then(function(response){
    response.getPendingModifications = function(){
      return response.getData().features;
    };
    return response;
  });
};
},{"./../FamilySearch":5}],55:[function(require,module,exports){
// These are globals so that their interface is the same
// both in the client and on the server
require('es6-promise').polyfill();
require('isomorphic-fetch');

var utils = require('./utils');

/**
 * @ngdoc overview
 * @name plumbing
 * @description
 * These are the low-level "plumbing" functions. You don't normally need to use these functions.
 */

var Plumbing = function(client){
  this.client = client;
  this.helpers = client.helpers;
  this.settings = client.settings;
  this.totalProcessingTime = 0;
};

/**
 * @ngdoc function
 * @name plumbing.functions:getTotalProcessingTime

 * @description
 * Return the total "processing time" spent in FamilySearch REST endpoints
 *
 * @return {Number} time in milliseconds
 */
Plumbing.prototype.getTotalProcessingTime = function() {
  return this.totalProcessingTime;
};

/**
 * @ngdoc function
 * @name plumbing.functions:setTotalProcessingTime

 * @description
 * Set the "processing time" spent in FamilySearch REST endpoints.
 * You could use this to reset the processing time counter to zero if you wanted.
 *
 * @param {Number} time in milliseconds
 */
Plumbing.prototype.setTotalProcessingTime = function(time) {
  this.totalProcessingTime = time;
};

/**
 * Get a URL from a collection
 *
 * @param {string} collectionId ID of the collection (FSFT, FSHRA, etc)
 * @param {string} resourceName resource name
 * @param {Object=} params parameters
 * @return {Object} promise for the url
 */
Plumbing.prototype.getCollectionUrl = function(collectionId, resourceName, params){
  var self = this;
  return self.getCollectionPromise(collectionId).then(function(collectionResponse){
    return self.helpers.getUrlFromCollection(collectionResponse.getData().collections[0], resourceName, params);
  });
};

/**
 * Get the promise for a collection
 *
 * @param {string} collectionId ID of the collection (FSFT, FSHRA, etc)
 * @param {string} resourceName resource name
 * @param {string=} possibleUrl possible url - return this if it is an absolute url
 * @param {Object=} params parameters
 * @return {Object} promise for the url
 */
Plumbing.prototype.getCollectionPromise = function(collectionId){
  var self = this;
  if(!self.settings.collectionsPromises[collectionId]){
    return self.settings.collectionsPromises['collections'].then(function(response){
      var collections = response.getData().collections;
      for(var i = 0; i < collections.length; i++){
        if(collections[i].id === collectionId){
          self.settings.collectionsPromises[collectionId] = self.get(collections[i].links.self.href);
          return self.settings.collectionsPromises[collectionId];
        }
      }
      return Promise.reject(new Error('Collection ' + collectionId + ' does not exist'));
    });
  } else {
    return self.settings.collectionsPromises[collectionId];
  }
};

/**
 * @ngdoc function
 * @name plumbing.functions:get

 *
 * @description
 * Low-level call to get a specific REST endpoint from FamilySearch
 *
 * @param {String} url may be relative; e.g., /platform/users/current
 * @param {Object=} params query parameters
 * @param {Object=} headers options headers
 * @return {Object} a promise that behaves like promises returned by the http function specified during init
 */
Plumbing.prototype.get = function(url, params, headers) {
  return this.http('GET', this.helpers.appendQueryParameters(url, params),
      utils.extend({'Accept': 'application/x-gedcomx-v1+json'}, headers));
};

/**
 * @ngdoc function
 * @name plumbing.functions:post

 *
 * @description
 * Low-level call to post to a specific REST endpoint from FamilySearch
 *
 * @param {String} url may be relative
 * @param {Object=} data post data
 * @param {Object=} headers options headers
 * @return {Object} a promise that behaves like promises returned by the http function specified during init
 */
Plumbing.prototype.post = function(url, data, headers) {
  return this.http('POST',
      url,
      utils.extend({'Content-Type': 'application/x-gedcomx-v1+json'}, headers),
      data);
};

/**
 * @ngdoc function
 * @name plumbing.functions:put

 *
 * @description
 * Low-level call to put to a specific REST endpoint from FamilySearch
 *
 * @param {String} url may be relative
 * @param {Object=} data post data
 * @param {Object=} headers options headers
 * @return {Object} a promise that behaves like promises returned by the http function specified during init
 */
Plumbing.prototype.put = function(url, data, headers) {
  return this.http('PUT',
      url,
      utils.extend({'Content-Type': 'application/x-gedcomx-v1+json'}, headers),
      data);
};

/**
 * @ngdoc function
 * @name plumbing.functions:del

 *
 * @description
 * Low-level call to delete to a specific REST endpoint from FamilySearch
 *
 * @param {String} url may be relative
 * @param {Object=} headers options headers
 * @return {Object} a promise that behaves like promises returned by the http function specified during init
 */
Plumbing.prototype.del = function(url, headers) {
  return this.http('DELETE', url, utils.extend({'Content-Type': 'application/x-gedcomx-v1+json'}, headers));
};

/**
 * Converts an object to x-www-form-urlencoded serialization.
 * borrowed from http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
 * @param {Object} obj
 * @return {String}
 */
function formEncode(obj)
{
  var query = '';
  var name, value, fullSubName, subName, subValue, innerObj, i;

  for(name in obj) {
    if (obj.hasOwnProperty(name)) {
      value = obj[name];

      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += formEncode(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          if (value.hasOwnProperty(subName)) {
            subValue = value[subName];
            fullSubName = name + '[' + subName + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += formEncode(innerObj) + '&';
          }
        }
      }
      else if(value !== undefined && value !== null) {
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }
    }
  }

  return query.length ? query.substr(0, query.length - 1) : query;
}

/**
 * Transform data according to the content type header
 * @param {*} data to transform
 * @param {String} contentType header
 * @returns {*}
 */
Plumbing.prototype.transformData = function(data, contentType) {
  if (data && utils.isObject(data) && String(data) !== '[object FormData]') {
    if (contentType === 'application/x-www-form-urlencoded') {
      return formEncode(data);
    }
    else if (contentType && contentType.indexOf('json') !== -1) {
      return JSON.stringify(data);
    }
  }
  return data;
};

/**
 * @ngdoc function
 * @name plumbing.functions:http

 *
 * @description
 * Low-level call to issue an http request to a specific REST endpoint from FamilySearch
 *
 * @param {String} method GET, POST, PUT, or DELETE
 * @param {String} url may be relative
 * @param {Object=} headers headers object
 * @param {Object=} data post data
 * @param {Number=} retries number of times to retry
 * @return {Object} a promise that behaves like promises returned by the http function specified during init
 */
Plumbing.prototype.http = function(method, url, headers, data, retries) {
  var self = this;
  
  // prepend the server
  var absoluteUrl = this.helpers.getAPIServerUrl(url);
  headers = headers || {};

  // do we need to request an access token?
  var accessTokenPromise;
  if (!this.settings.accessToken &&
      this.settings.autoSignin &&
      !this.helpers.isOAuthServerUrl(absoluteUrl) &&
      url.indexOf('/platform/collections') === -1) {
    accessTokenPromise = this.client.getAccessToken();
  }
  else {
    accessTokenPromise = Promise.resolve(this.settings.accessToken);
  }
  
  return accessTokenPromise.then(function() {
    
    // Append the access token as a query parameter to avoid cors pre-flight
    // this is detrimental to browser caching across sessions, which seems less bad than cors pre-flight requests
    var accessTokenName = self.helpers.isAuthoritiesServerUrl(absoluteUrl) ? 'sessionId' : 'access_token';
    if (self.settings.accessToken && absoluteUrl.indexOf(accessTokenName+'=') === -1) {
      var accessTokenParam = {};
      accessTokenParam[accessTokenName] = self.settings.accessToken;
      absoluteUrl = self.helpers.appendQueryParameters(absoluteUrl, accessTokenParam);
    }

    // Default retries
    if (retries == null) { // also catches undefined
      retries = self.settings.maxHttpRequestRetries;
    }
    
    // Pending modifications
    if(self.settings.pendingModifications){
      headers['X-FS-Feature-Tag'] = self.settings.pendingModifications;
    }
    
    // Prepare body
    var body = self.transformData(data, headers['Content-Type']);
    
    // HTTP request and error handling
    return self._http(method, absoluteUrl, headers, body, retries)
    
    // Process the response body and make available at the `data` property
    // of the response. If JSON parsing fails then we have bad data or no data.
    // Either way we just catch the error and continue on.
    .then(function(response){
      return response.json().then(function(json){
        response.data = json;
        return response;
      }, function(){
        return response;
      });
    })
    
    // Return a custom response object
    .then(function(response){
      return {
        getBody: function(){ 
          return response.body; 
        },
        getData: function(){
          return response.data;
        },
        getStatusCode: function(){ 
          return response.status; 
        },
        getHeader: function(header, all){ 
          return all === true ? response.headers.getAll(header) : response.headers.get(header);
        },
        getRequest: function(){
          return {
            url: absoluteUrl,
            method: method,
            headers: headers,
            body: body
          };
        }
      };
    });
  });
};

/**
 * Helper and internal HTTP function. Enables recursive calling required for
 * handling throttling.
 */
Plumbing.prototype._http = function(method, url, headers, body, retries){
  var self = this;
  
  // Make the HTTP request
  return fetch(url, {
    method: method,
    headers: headers,
    body: body
  })
  
  // Erase access token when a 401 Unauthenticated response is received
  .then(function(response){
    if(response.status === 401){
      self.helpers.eraseAccessToken();
    }
    return response;
  })
  
  // Handle throttling and other random server failures. If the Retry-After
  // header exists then honor it's value (it always exists for throttled
  // responses). The Retry-After value is in seconds while the setTimeout
  // parameter is in ms so we multiply the header value by 1000.
  .then(function(response){
    if (method === 'GET' && retries > 0 && (response.status >= 500 || response.status === 429)) {
      var retryAfterHeader = response.headers.get('Retry-After');
      var retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : self.settings.defaultThrottleRetryAfter;
      return new Promise(function(resolve, reject){
        setTimeout(function(){
          self._http(method, url, headers, body, retries-1).then(function(response){
            resolve(response);
          }, function(error){
            reject(error);
          });
        }, retryAfter);
      });
    } else {
      return response;
    }
  })
  
  // Catch all other errors
  .then(function(response){
    if (response.status >= 200 && response.status < 400) {
      return response;
    } else {
      if(self.settings.debug){
        self.helpers.log('http failure', response.status, retries);
      }
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  });
};

module.exports = Plumbing;
},{"./utils":57,"es6-promise":2,"isomorphic-fetch":3}],56:[function(require,module,exports){
var FS = require('./FamilySearch'),
    utils = require('./utils'),
    maybe = utils.maybe,
    exports = {};

/**
 * Relationship helper functions.
 * Only work when called with `this` set to the relationship.
 * `setMember.call(relationship, role, person)`
 * Export in a module so we can use them between
 * Couple and ChildAndParent relationships
 **/

// person may be a Person, a URL, or an ID
exports.setMember = function(role, person) {
  if (!this.data[role]) {
    this.data[role] = {};
  }
  if (person instanceof FS.Person) {
    this.data[role].resource = person.getPersonUrl();
    delete this.data[role].resourceId;
  }
  else if (this.helpers.isAbsoluteUrl(person)) {
    this.data[role].resource = person;
    delete this.data[role].resourceId;
  }
  else if (utils.isString(person)) {
    this.data[role].resourceId = person;
    delete this.data[role].resource;
  } else {
    this.data[role] = person;
  }
};

exports.deleteMember = function(role, changeMessage) {
  if (!this.deletedMembers) {
    this.deletedMembers = {};
  }
  this.deletedMembers[role] = changeMessage;
  delete this.data[role];
};

exports.setFacts = function(prop, values, changeMessage) {
  if (utils.isArray(this.data[prop])) {
    utils.forEach(this.data[prop], function(fact) {
      exports.deleteFact.call(this, prop, fact, changeMessage);
    }, this);
  }
  this.data[prop] = [];
  utils.forEach(values, function(value) {
    exports.addFact.call(this, prop, value);
  }, this);
};

exports.addFact = function(prop, value) {
  if (!utils.isArray(this.data[prop])) {
    this.data[prop] = [];
  }
  if (!(value instanceof FS.Fact)) {
    value = this.client.createFact(value);
  }
  this.data[prop].push(value);
};

exports.deleteFact = function(prop, value, changeMessage) {
  if (!(value instanceof FS.Fact)) {
    value = utils.find(this.data[prop], { id: value });
  }
  var pos = utils.indexOf(this.data[prop], value);
  if (pos >= 0) {
    // add fact to deletedFacts map; key is the href to delete
    var key = this.helpers.removeAccessToken(maybe(value.getLink('conclusion')).href);
    if (key) {
      if (!this.deletedFacts) {
        this.deletedFacts = {};
      }
      this.deletedFacts[key] = changeMessage;
    }
    // remove fact from array
    this.data[prop].splice(pos,1);
  }
};

module.exports = exports;
},{"./FamilySearch":5,"./utils":57}],57:[function(require,module,exports){
/**
 * Collection of utility functions. Only put functions in here that aren't
 * specific to the FamilySearch API (those go in helpers.js)
 */

var exports = module.exports;

 // Object.create polyfill
if (!Object.create) {
  Object.create = (function(){
    function F() {}

    return function(o) {
      if (arguments.length !== 1) {
        throw new Error('Object.create implementation only accepts one parameter.');
      }
      F.prototype = o;
      return new F();
    };
  })();
}

// Object.getPrototypeOf polyfill
// copied from http://ejohn.org/blog/objectgetprototypeof/
if (typeof Object.getPrototypeOf !== 'function') {
  /* jshint camelcase:false,proto:true */
  Object.getPrototypeOf = (typeof ''.__proto__ === 'object') ?
    function(object) { return object.__proto__; } :
    // May break if the constructor has been tampered with
    function(object) { return object.constructor.prototype; };
}

/**
 * borrowed from underscore.js
 * @param {*} value to test
 * @returns {boolean}
 */
exports.isArray = function(value) {
  /*jshint eqeqeq:false */
  return Array.isArray ? Array.isArray(value) : Object.prototype.toString.call(value) == '[object Array]';
};

/**
 * borrowed from underscore.js
 * @param {*} value to test
 * @returns {boolean}
 */
exports.isString = function(value) {
  /*jshint eqeqeq:false */
  return Object.prototype.toString.call(value) == '[object String]';
};

/**
 * borrowed from underscore.js
 * @param {*} value to test
 * @returns {boolean}
 */
exports.isFunction = function(value) {
  /*jshint eqeqeq:false */
  return (typeof /./ !== 'function') ? (typeof value === 'function') : Object.prototype.toString.call(value) == '[object Function]';
};

/**
 * borrowed from underscore.js
 * @param {*} value to test
 * @returns {boolean}
 */
exports.isObject = function(value) {
  return value === Object(value);
};

/**
 * borrowed from underscore.js
 * @param value to test
 * @returns {boolean}
 */
exports.isUndefined = function(value) {
  return value === void 0;
};

/**
 * borrowed from underscore.js
 * @param {Array|Object} obj Object or array to iterate over
 * @param {function(elm)} iterator Function to call
 * @param {Object=} context Object for this
 */
var forEach = exports.forEach = function(obj, iterator, context) {
  if (obj == null) { // also catches undefined
    return;
  }
  if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, length = obj.length; i < length; i++) {
      if (iterator.call(context, obj[i], i, obj) === {}) {
        return;
      }
    }
  } else {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (iterator.call(context, obj[key], key, obj) === {}) {
          return;
        }
      }
    }
  }
};

/**
 * "empty" properties are undefined, null, or the empty string
 * @param {Object} obj Object to remove properties from
 * @returns {Object} Object with empty properties removed
 */
exports.removeEmptyProperties = function(obj) {
  forEach(obj, function(value, key) {
    if (value == null || value === '') {  // == null also catches undefined
      delete obj[key];
    }
  });
  return obj;
};

/**
 * borrowed from underscore.js
 * @param {Object} obj Object to get keys from
 * @returns {Array.<string>} keys
 */
exports.keys = Object.keys || function(obj) {
  if (obj !== Object(obj)) {
    throw new TypeError('Invalid object');
  }
  var keys = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys;
};

// return true if all corresponding object properties match
function templateMatches(template, obj) {
  for (var key in template) {
    if (template.hasOwnProperty(key) && obj[key] !== template[key]) {
      return false;
    }
  }
  return true;
}

/**
 * Simplified version of underscore's filter
 * @param {Array|Object} arr Array or object to iterate over
 * @param {Object|function(elm)} objOrFn if object, return matching objects; otherwise return objects where function(obj) returns true
 * @param {Object=} context Object for this
 * @returns {Array} Filtered array
 */
exports.filter = function(arr, objOrFn, context) {
  var result = [];
  var isFn = exports.isFunction(objOrFn);
  forEach(arr, function(elm) {
    if (isFn ? objOrFn.call(context, elm) : templateMatches(objOrFn, elm)) {
      result.push(elm);
    }
  });
  return result;
};

/**
 * simplified version of underscore's map
 * @param {Array|Object} arr Array or object to iterate over
 * @param {function(elm)} fn Function to call
 * @param {Object=} context Object for this
 * @returns {Array} Mapped array
 */
exports.map = function(arr, fn, context) {
  var result = [];
  forEach(arr, function(value, index, list) {
    result.push(fn.call(context, value, index, list));
  });
  return result;
};

/**
 * borrowed from underscore
 * @param {Array|Object} obj Object or array to check
 * @param {*} target Thing to look for
 * @returns {boolean} Return true if found
 */
exports.contains = function(obj, target) {
  if (obj == null) { // covers undefined as well
    return false;
  }
  if (obj.indexOf && obj.indexOf === Array.prototype.indexOf) {
    return obj.indexOf(target) !== -1;
  }
  var result = false;
  forEach(obj, function(value) {
    if (value === target) {
      result = true;
    }
  });
  return result;
};

/**
 * simplified version of underscore's indexOf
 * @param {Array} arr array to search
 * @param {*} item item to find
 * @returns {number} position of item in array or -1 if not found
 */
exports.indexOf = function(arr, item) {
  if (Array.prototype.indexOf === arr.indexOf) {
    return arr.indexOf(item);
  }
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i] === item) {
      return i;
    }
  }
  return -1;
};

/**
 * simplified version of underscore's uniq
 * @param {Array} arr Array to extract unique elements from
 * @returns {Array} Contains only one instance of each element
 */
exports.uniq = function(arr) {
  var results = [];
  forEach(arr, function(value) {
    if (!exports.contains(results, value)) {
      results.push(value);
    }
  });
  return results;
};

/**
 * simplified version of underscore's find
 * returns undefined if nothing found
 * @param {Array} arr Array to search
 * @param {Object|function(elm)} objOrFn If object, look for matching object; otherwise look for function to return true
 * @param {Object=} context Object for this
 * @returns {*} Thing found
 */
exports.find = function(arr, objOrFn, context) {
  var result;
  var isFn = exports.isFunction(objOrFn);
  if (arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
      var elm = arr[i];
      if (isFn ? objOrFn.call(context, elm) : templateMatches(objOrFn, elm)) {
        result = elm;
        break;
      }
    }
  }
  return result;
};

/**
 * simplified version of underscore's findIndex
 * returns -1 if nothing found
 * @param {Array} arr Array to search
 * @param {Object|function(elm)} objOrFn If object, look for matching object; otherwise look for function to return true
 * @param {Object=} context Object for this
 * @returns {*} Thing found
 */
exports.findIndex = function(arr, objOrFn, context) {
  var result = -1;
  var isFn = exports.isFunction(objOrFn);
  if (arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
      var elm = arr[i];
      if (isFn ? objOrFn.call(context, elm) : templateMatches(objOrFn, elm)) {
        result = i;
        break;
      }
    }
  }
  return result;
};

/**
 * simplified version of underscore's flatten that only does shallow flattening
 * @param {Array} arr Array of arrays to flatten
 * @returns {Array} Flattened array
 */
exports.flatten = function(arr) {
  var result = [];
  forEach(arr, function(value) {
    if (exports.isArray(value)) {
      Array.prototype.push.apply(result, value);
    }
  });
  return result;
};

/**
 * Composition of map and flatten
 * Flattens the output of map into a single array
 *@param {Array|Object} arr Array or object to iterate over
 * @param {function(elm)} fn Function to call
 * @param {Object=} context Object for this
 * @returns {Array} Flattened array
 */
exports.flatMap = function(arr, fn, context){
  return exports.flatten(exports.map(arr, fn, context));
};

/**
 * Return found match or first if none found
 * @param {Array} arr Array to search
 * @param {Object|function(elm)} objOrFn If object, look for matching object; otherwise look for function to return true
 * @returns {*} Thing found or first element of array
 */
exports.findOrFirst = function(arr, objOrFn) {
  if (!exports.isUndefined(arr)) {
    var result = exports.find(arr, objOrFn);
    return exports.isUndefined(result) ? arr[0] : result;
  }
  return void 0;
};

/**
 * borrowed from underscore
 * @param {Object} dest Object to extend
 * @returns {Object} Extended object
 */
exports.extend = function(dest) {
  dest = dest || {};
  forEach(Array.prototype.slice.call(arguments, 1), function(source) {
    if (source) {
      forEach(source, function(value, key) {
        dest[key] = value;
      });
    }
  });
  return dest;
};

/**
 * Return an empty object if passed in a null or undefined, similar to the maybe monad
 * @param {*} value Value to test
 * @returns {*} Original value or empty object
 */
exports.maybe = function(value) {
  return value != null ? value : {}; // != null also covers undefined
};

/**
 * Search utilities
 */

var nonQueryParams = {start: true, count: true, context: true};

function quoteSearchParam(value) {
  if(!exports.isString(value)){
    return value;
  }
  value = value.replace(/[:"]/g, '').trim();
  return value.indexOf(' ') >= 0 ? '"' + value + '"' : value;
}

/**
 * Given an map of parameters, filter out non-search parameters.
 * This allows us to accept all search params in one object instead
 * of asking the user to nest the actual search query in the `q` attribute.
 */
exports.searchParamsFilter = function(params) {
  return exports.map(exports.filter(exports.keys(params), function(key) { return !nonQueryParams[key]; }),
    function(key) { return key+':'+quoteSearchParam(params[key]); }).join(' ');
};
},{}]},{},[5])(5)
});