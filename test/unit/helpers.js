/**
 * Helper functions for unit tests
 */
define(['FamilySearch', 'jasmine-jquery'], function(FamilySearch) {
  /**
   * Mock a deferred with a waitsFor call to tell jasmine to wait until the promise is resolved/rejected
   * based upon an idea described in http://darktalker.com/2013/promise-pattern-jasmine/
   * use this until karma-jasmine upgrades to the version of jasmine (2.0?) with a done callback like mocha
   *
   * @return {{resolve: Function, reject: Function, promise: Function}}
   */
  function deferredMock() {
    var callback = {}, fired = false, resolveArgs, rejectArgs, chainedDeferred;

    waitsFor(function () {
      return fired;
    }, '');

    function doCallbacks() {
      if (callback.done && resolveArgs) {
        var result = callback.done.apply(this, resolveArgs);
        if (chainedDeferred) {
          // NOTE: this doesn't handle the case where result is a promise
          // I think this is alright because we don't have any code that resolves a promise with another promise
          chainedDeferred.resolve(result);
        }
      }
      else if (callback.failed && rejectArgs) {
        callback.failed.apply(this, rejectArgs);
        if (chainedDeferred) {
          chainedDeferred.reject.apply(this, rejectArgs);
        }
      }
    }

    return {
      resolve: function() {
        if (fired) {
          return;
        }
        fired = true;
        resolveArgs = arguments;
        doCallbacks();
      },

      reject: function() {
        if (fired) {
          return;
        }
        fired = true;
        rejectArgs = arguments;
        doCallbacks();
      },

      promise: function() {
        return {
          then: function(cb, eb) {
            chainedDeferred = deferredMock();
            callback.done = cb;
            callback.failed = eb;
            doCallbacks();

            return chainedDeferred.promise();
          }
        };
      }
    };
  }

  function getFilename(opts) {
    return opts.url.replace(/[^\/]*\/\/[^\/]+\//, '')
      .replace(/([?&])access_token=[^&]*&?/,'$1')
      .replace(/[?&]$/, '')
      .replace(/[^A-Za-z0-9_-]/g, '_') + '.json';
  }

  /**
   * Mock an http call, fetching the json from a file in test/mock
   *
   * @param opts
   * @returns {Object} promise
   */
  function httpMock(opts) {
    var filename = getFilename(opts);
    //console.log('httpMock', filename);
    var data = getJSONFixture(filename);
    var headers = {};
    if (data.headers) {
      headers = data.headers;
      delete data.headers;
    }

    var d = deferredMock();
    d.resolve(data, '', { status: 200 });
    var returnedPromise = d.promise();

    returnedPromise.getAllResponseHeaders = function() {
      var h = [];
      for (var prop in headers) {
        if (headers.hasOwnProperty(prop)) {
          h.push(prop+':'+headers[prop]);
        }
      }
      return h.join('\n');
    };

    returnedPromise.getResponseHeader = function(header) {
      return headers[header];
    };

    return returnedPromise;
  }

  beforeEach(function() {
    jasmine.getJSONFixtures().fixturesPath='base/test/mock';

    FamilySearch.init({
      'app_key': 'mock',
      'environment': 'sandbox',
      'auth_callback': 'mock',
      'http_function': httpMock,
      'deferred_function': deferredMock,
      'access_token': 'mock'
    });
  });
});
