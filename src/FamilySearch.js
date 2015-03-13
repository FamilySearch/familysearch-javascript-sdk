var globals = require('./globals'),
    utils = require('./utils'),
    angularjsWrappers = require('./angularjs-wrappers'),
    jQueryWrappers = require('./jquery-wrappers'),
    nodejsWrappers = require('./nodejs-wrappers'),
    Helpers = require('./helpers'),
    Plumbing = require('./plumbing');

var instanceId = 0;    
    
/**
 * @ngdoc function
 * @name familysearch.types:constructor.FamilySearch
 * @function
 *
 * @description
 * Initialize the FamilySearch object
 *
 * **Options**
 *
 * - `client_id` - the developer key you received from FamilySearch
 * - `environment` - sandbox, staging, or production
 * - `http_function` - a function for issuing http requests: `jQuery.ajax`, angular's `$http`,
 * or the [request](https://github.com/request/request) library for node; defaults to `jQuery.ajax`
 * - `deferred_function` - a function for creating deferred's: `jQuery.Deferred`, angular's `$q.defer`
 * or the [Q](https://github.com/kriskowal/q) library for node
 * - `timeout_function` - optional timeout function: angular users should pass `$timeout`; otherwise the global `setTimeout` is used
 * - `redirect_uri` - the OAuth2 redirect uri you registered with FamilySearch.  Does not need to exist,
 * but must have the same host and port as the server running your script;
 * however, it must exist for mobile safari - see the Overview section of the documentation
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
  //noinspection JSUndeclaredVariable
  self.settings.environment = opts['environment'];

  // Determine which http function is being used
  if(!opts['http_function'] && !window.jQuery) {
    throw 'http must be set; e.g., jQuery.ajax';
  }
  var httpFunction = opts['http_function'] || window.jQuery.ajax;
  if (httpFunction.defaults) {
    self.settings.httpWrapper = angularjsWrappers.httpWrapper(httpFunction, self);
  }
  else if (httpFunction.cookie){
    self.settings.httpWrapper = nodejsWrappers.httpWrapper(httpFunction, self);
  }
  else {
    self.settings.httpWrapper = jQueryWrappers.httpWrapper(httpFunction, self);
  }

  // Determine which deferred function is being used
  if(!opts['deferred_function'] && !window.jQuery) {
    throw 'deferred_function must be set; e.g., jQuery.Deferred';
  }
  var deferredFunction = opts['deferred_function'] || window.jQuery.Deferred;
  var d = deferredFunction();
  d.resolve(); // required for unit tests
  if (utils.isFunction(d.promise)) {
    self.settings.deferredWrapper = jQueryWrappers.deferredWrapper(deferredFunction);    
  }
  else if (utils.isFunction(deferredFunction.nfcall)) {
    self.settings.deferredWrapper = nodejsWrappers.deferredWrapper(deferredFunction);
  }
  else {
    self.settings.deferredWrapper = angularjsWrappers.deferredWrapper(deferredFunction);
  }
  

  var timeout = opts['timeout_function'];
  if (timeout) {
    self.settings.setTimeout = function(fn, delay) {
      return timeout(fn, delay);
    };
    self.settings.clearTimeout = function(timer) {
      timeout.cancel(timer);
    };
  }
  else {
    // not sure why I can't just set self.settings.setTimeout = setTimeout, but it doesn't seem to work; anyone know why?
    self.settings.setTimeout = function(fn, delay) {
      return setTimeout(fn, delay);
    };
    self.settings.clearTimeout = function(timer) {
      clearTimeout(timer);
    };
  }

  self.settings.redirectUri = opts['redirect_uri'] || opts['auth_callback']; // auth_callback is deprecated

  self.settings.autoSignin = opts['auto_signin'];

  self.settings.autoExpire = opts['auto_expire'];

  self.settings.expireCallback = opts['expire_callback'];

  if (opts['save_access_token']) {
    self.settings.saveAccessToken = true;
    self.helpers.readAccessToken();
  }

  if (opts['access_token']) {
    self.settings.accessToken = opts['access_token'];
  }

  self.settings.debug = opts['debug'];
  
  // request the discovery resource
  self.settings.discoveryPromise = self.plumbing.get(self.settings.discoveryUrl);
  self.settings.discoveryPromise.then(function(discoveryResource) {
    self.settings.discoveryResource = discoveryResource;
  });

};

// Create a base class constructor which all other class
// constructors will call. The only purpose is to share
// the four common lines of code.
FS.BaseClass = function(client, data){
  
  // This call to extend is intentionally the first line.
  // This prevents us from accidentally overriding one of
  // the three necessary attributes for interacting with
  // the SDK.
  if(utils.isObject(data)){
    utils.extend(this, data);
  }
  
  // Make the client accessible to class methods. Use the
  // $ prefix to avoid potential conflicts with data.
  // $helpers and $plumbing are just shortcuts.
  this.$client = client;
  this.$helpers = client.helpers;
  this.$plumbing = client.plumbing;
};
    
// These modules contain functions which extend 
// the FamilySearch prototype to provide api functionality
require('./modules/authorities');
require('./modules/authentication');
require('./modules/changeHistory');
require('./modules/discussions');
require('./modules/memories');
require('./modules/notes');
require('./modules/parentsAndChildren');
require('./modules/pedigree');
require('./modules/persons');
require('./modules/redirect');
require('./modules/searchAndMatch');
require('./modules/sourceBox');
require('./modules/sources');
require('./modules/spouses');
require('./modules/users');

// These files contain class definitions
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
require('./classes/memoryArtifactRef');
require('./classes/memoryPersona');
require('./classes/memoryPersonaRef');
require('./classes/memory');
require('./classes/name');
require('./classes/note');
require('./classes/person');
require('./classes/place');
require('./classes/searchResult');
require('./classes/sourceDescription');
require('./classes/sourceRef');
require('./classes/user');

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