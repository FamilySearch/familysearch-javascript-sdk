/**
 * Helper functions for unit tests
 */
define(['FamilySearch', '_', 'jasmine-jquery'], function(FamilySearch, _) {
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

  function decodeQueryString(qs) {
    var obj = {};
    var queryPos = qs.indexOf('?');
    if (queryPos !== -1) {
      var segments = qs.substring(queryPos+1).split('&');
      for (var i = 0, len = segments.length; i < len; i++) {
        var kv = segments[i].split('=', 2);
        if (kv && kv[0]) {
          obj[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
        }
      }
    }
    return obj;
  }

  function keys(obj) {
    var result = [];
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        result.push(prop);
      }
    }
    return result;
  }

  function isEmpty(obj) {
    return keys(obj).length === 0;
  }

  function getFilename(opts) {
    var params = decodeQueryString(opts.url);
    var filename = opts.url.replace(/[^\/]*\/\/[^\/]+\//, '').replace(/\?.*$/, ''); // get path portion of URL
    if (opts.type !== 'GET') {
      filename = opts.type.toLowerCase() + '_' + filename;
    }
    var sortedKeys = keys(params).sort(); // sort parameters in alphabetical order
    for (var i = 0, len = sortedKeys.length; i < len; i++) {
      var key = sortedKeys[i];
      if (key !== 'access_token') { // skip access token
        filename = filename + '_' + encodeURIComponent(sortedKeys[i]) + '_' + encodeURIComponent(params[sortedKeys[i]]);
      }
    }
    return filename.replace(/[^A-Za-z0-9_-]/g, '_') + '.json'; // convert special characters to _'s
  }

  /**
   * Mock an http call, fetching the json from a file in test/mock
   *
   * @param opts
   * @returns {Object} promise
   */
  function httpMock(opts) {
    //console.log('httpMock options', opts);
    var filename = getFilename(opts);
    var data = getJSONFixture(filename);
    var headers = {};
    if (data.headers) {
      headers = data.headers;
      delete data.headers;
    }
    var status = 200;
    if (data.status) {
      status = data.status;
      delete data.status;
    }
    if (opts.type === 'POST' && isEmpty(data)) {
      data = null;
    }

    var d = deferredMock();
    d.resolve(data, '', { status: status });
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

    returnedPromise.getRequest = function() {
      return opts;
    };

    return returnedPromise;
  }

  beforeEach(function() {
    jasmine.getJSONFixtures().fixturesPath='base/test/mock';
    this.addMatchers({
      toEqualData: function(expected) {
        // get rid of any constructor functions
        var actual = JSON.parse(JSON.stringify(this.actual).replace(/(\\t|\\n)/g,''));
        expected = JSON.parse(JSON.stringify(expected).replace(/(\\t|\\n)/g,''));
        // use deep comparison
        return _.isEqual(actual, expected);
      }
    });

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
