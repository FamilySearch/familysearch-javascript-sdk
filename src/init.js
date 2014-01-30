define([
  'angularjs-wrappers',
  'globals',
  'helpers',
  'jquery-wrappers',
  'plumbing'
], function(angularjsWrappers, globals, helpers, jQueryWrappers, plumbing) {
  /**
   * @ngdoc overview
   * @name init
   * @description
   * Call the init function once to initialize the FamilySearch object before calling any other functions.
   */

  var exports = {};

  /**
   * @ngdoc function
   * @name init.functions:init
   * @function
   *
   * @description
   * Initialize the FamilySearch object
   *
   * **Options**
   *
   * - `app_key` - the developer key you received from FamilySearch
   * - `environment` - sandbox, staging, or production
   * - `http_function` - a function for issuing http requests: `jQuery.ajax` or angular's `$http`, or eventually node.js's ...
   * - `deferred_function` - a function for creating deferred's: `jQuery.Deferred` or angular's `$q.defer` or eventually `Q`
   * - `timeout_function` - optional timeout function: angular users should pass `$timeout`; otherwise the global `setTimeout` is used
   * - `auth_callback` - the OAuth2 redirect uri you registered with FamilySearch.  Does not need to exist,
   * but must have the same host and port as the server running your script
   * - `auto_expire` - set to true if you want to the system to clear the access token when it has expired
   * (after one hour of inactivity or 24 hours, whichever comes first; should probably be false for node.js)
   * - `auto_signin` - set to true if you want the user to be prompted to sign in whenever you call an API function
   * without an access token (must be false for node.js, and may result in a blocked pop-up if the API call is
   * not in direct response to a user-initiated action)
   * - `save_access_token` - set to true if you want the access token to be saved and re-read in future init calls
   * (uses a session cookie, must be false for node.js) - *setting `save_access_token` along with `auto_signin` and
   * `auto_expire` is very convenient*
   * - `access_token` - pass this in if you already have an access token
   *
   * @param {Object} opts opts
   */
  exports.init = function(opts) {
    opts = opts || {};

    if(!opts['app_key']) {
      throw 'app_key must be set';
    }
    //noinspection JSUndeclaredVariable
    globals.appKey = opts['app_key'];

    if(!opts['environment']) {
      throw 'environment must be set';
    }
    //noinspection JSUndeclaredVariable
    globals.environment = opts['environment'];

    if(!opts['http_function']) {
      throw 'http must be set; e.g., jQuery.ajax';
    }
    var httpFunction = opts['http_function'];
    if (httpFunction.defaults) {
      globals.httpWrapper = angularjsWrappers.httpWrapper(httpFunction);
    }
    else {
      globals.httpWrapper = jQueryWrappers.httpWrapper(httpFunction);
    }

    if(!opts['deferred_function']) {
      throw 'deferred_function must be set; e.g., jQuery.Deferred';
    }
    var deferredFunction = opts['deferred_function'];
    var d = deferredFunction();
    d.resolve(); // required for unit tests
    if (!helpers.isFunction(d.promise)) {
      globals.deferredWrapper = angularjsWrappers.deferredWrapper(deferredFunction);
    }
    else {
      globals.deferredWrapper = jQueryWrappers.deferredWrapper(deferredFunction);
    }

    var timeout = opts['timeout_function'];
    if (timeout) {
      globals.setTimeout = function(fn, delay) {
        return timeout(fn, delay);
      };
      globals.clearTimeout = function(timer) {
        timeout.cancel(timer);
      };
    }
    else {
      // not sure why I can't just set globals.setTimeout = setTimeout, but it doesn't seem to work; anyone know why?
      globals.setTimeout = function(fn, delay) {
        return setTimeout(fn, delay);
      };
      globals.clearTimeout = function(timer) {
        clearTimeout(timer);
      };
    }

    globals.authCallbackUri = opts['auth_callback'];

    globals.autoSignin = opts['auto_signin'];

    globals.autoExpire = opts['auto_expire'];

    if (opts['save_access_token']) {
      globals.saveAccessToken = true;
      helpers.readAccessToken();
    }

    if (opts['access_token']) {
      globals.accessToken = opts['access_token'];
    }

    // request the discovery resource
    globals.discoveryPromise = plumbing.get(globals.discoveryUrl);
  };

  return exports;
});
