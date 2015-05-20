!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.FamilySearch=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  if (httpFunction.pendingRequests) {
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
},{"./angularjs-wrappers":2,"./classes/agent":3,"./classes/attribution":4,"./classes/base":5,"./classes/change":6,"./classes/childAndParents":7,"./classes/collection":8,"./classes/comment":9,"./classes/couple":10,"./classes/date":11,"./classes/discussion":12,"./classes/discussionRef":13,"./classes/fact":14,"./classes/memory":15,"./classes/memoryArtifactRef":16,"./classes/memoryPersona":17,"./classes/memoryPersonaRef":18,"./classes/name":19,"./classes/note":20,"./classes/person":21,"./classes/place":22,"./classes/searchResult":23,"./classes/sourceDescription":24,"./classes/sourceRef":25,"./classes/user":26,"./globals":27,"./helpers":28,"./jquery-wrappers":29,"./modules/authentication":30,"./modules/authorities":31,"./modules/changeHistory":32,"./modules/discussions":33,"./modules/memories":34,"./modules/notes":35,"./modules/parentsAndChildren":36,"./modules/pedigree":37,"./modules/persons":38,"./modules/redirect":39,"./modules/searchAndMatch":40,"./modules/sourceBox":41,"./modules/sources":42,"./modules/spouses":43,"./modules/users":44,"./nodejs-wrappers":45,"./plumbing":46,"./utils":48}],2:[function(require,module,exports){
var utils = require('./utils'),
    exports = {};

/**
 * httpWrapper function based upon Angular's $http function
 * @param http Angular's $http function
 * @returns {Function} http function that exposes a standard interface
 */
exports.httpWrapper = function(http, client) {
  return function(method, url, headers, data, opts) {
    // set up the options
    var config = utils.extend({
      method: method,
      url: url,
      responseType: 'json',
      data: data,
      transformRequest: function(obj) {
        return obj;
      }
    }, opts);
    config.headers = utils.extend({}, headers, opts.headers);
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      config.headers['Content-Type'] = void 0;
    }

    // make the call
    var promise = http(config);

    // process the response
    var d = client.settings.deferredWrapper();
    var returnedPromise = d.promise;
    var statusCode = null;
    var headerGetter = null;
    promise.then(
      function(response) {
        statusCode = response.status;
        headerGetter = response.headers;
        d.resolve(response.data);
      },
      function(response) {
        statusCode = response.status;
        headerGetter = response.headers;
        d.reject(response);
      });

    // add http-specific functions to the returned promise
    returnedPromise.getStatusCode = function() {
      return statusCode;
    };
    returnedPromise.getResponseHeader = function(header) {
      return headerGetter(header);
    };
    returnedPromise.getAllResponseHeaders = function() {
      return headerGetter();
    };
    returnedPromise.getRequest = function() {
      return config;
    };

    return returnedPromise;
  };
};

/**
 * deferredWrapper function based upon Angular's $q.defer function
 * @param deferred Angular's $q.defer function
 * @returns {Function} deferred function that exposes a standard interface
 */
exports.deferredWrapper = function(deferred) {
  return function() {
    var d = deferred();
    return {
      promise: d.promise,
      resolve: d.resolve,
      reject: d.reject
    };
  };
};

module.exports = exports;
},{"./utils":48}],3:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name user.types:constructor.Agent
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

Agent.prototype = {
  constructor: Agent,
  /**
   * @ngdoc property
   * @name user.types:constructor.Agent#id
   * @propertyOf user.types:constructor.Agent
   * @return {String} Id of the agent
   */

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#$getName
   * @methodOf user.types:constructor.Agent
   * @function
   * @return {String} name of the agent
   */
  $getName: function() { return maybe(maybe(this.names)[0]).value; },

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#$getAccountName
   * @methodOf user.types:constructor.Agent
   * @function
   * @return {String} account / contact name of the agent
   */
  $getAccountName: function() { return maybe(maybe(this.accounts)[0]).accountName; },


  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#$getEmail
   * @methodOf user.types:constructor.Agent
   * @function
   * @return {String} email of the agent
   */
  $getEmail: function() {
    var email = maybe(maybe(this.emails)[0]).resource;
    return email ? email.replace(/^mailto:/,'') : email;
  },

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#$getPhoneNumber
   * @methodOf user.types:constructor.Agent
   * @function
   * @return {String} phone number of the agent
   */
  $getPhoneNumber: function() {
    return maybe(maybe(this.phones)[0]).resource;
  },

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#$getAddress
   * @methodOf user.types:constructor.Agent
   * @function
   * @return {String} postal address of the agent
   */
  $getAddress: function() {
    return maybe(maybe(this.addresses)[0]).value;
  }
};
},{"./../FamilySearch":1,"./../utils":48}],4:[function(require,module,exports){
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
 * @param {String=} changeMessage change message
 */
var Attribution = FS.Attribution = function(client, data) {
  FS.BaseClass.call(this, client, data);
  if(utils.isString(data)){
    this.changeMessage = data;
  }
};

/**
 * @ngdoc function
 * @name attribution.functions:createAttribution
 * @param {Object} data [Attribution](https://familysearch.org/developers/docs/api/gx/Attribution_json) data
 * @return {Object} {@link attribution.types:constructor.Attribution Attribution}
 * @description Create an {@link attribution.types:constructor.Attribution Attribution} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createAttribution = function(message){
  return new Attribution(this, message);
};

Attribution.prototype = {
  constructor: Attribution,
  /**
   * @ngdoc property
   * @name attribution.types:constructor.Attribution#modified
   * @propertyOf attribution.types:constructor.Attribution
   * @return {number} timestamp
   */

  /**
   * @ngdoc property
   * @name attribution.types:constructor.Attribution#changeMessage
   * @propertyOf attribution.types:constructor.Attribution
   * @return {string} change message
   */

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#$getAgentId
   * @methodOf attribution.types:constructor.Attribution
   * @function
   * @return {String} id of the agent (contributor) - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentId: function() { return maybe(this.contributor).resourceId; },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#$getAgentUrl
   * @methodOf attribution.types:constructor.Attribution
   * @function
   * @return {String} URL of the agent (contributor) - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentUrl: function() { return this.$client.helpers.removeAccessToken(maybe(this.contributor).resource); },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#$getAgent
   * @methodOf attribution.types:constructor.Attribution
   * @function
   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  $getAgent: function() { return this.$client.getAgent(this.$getAgentUrl() || this.$getAgentId()); }
};

},{"./../FamilySearch":1,"./../utils":48}],5:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * Create a base class constructor which all other class
 * constructors will call. The purpose is to share
 * a few common lines of init code.
 */
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
  
  this.$serialize = function(){
    return JSON.stringify(this, function(key, value){
      if(key.indexOf('$') === 0){
        return;
      }
      return value;
    });
  };
};
},{"./../FamilySearch":1,"./../utils":48}],6:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name changeHistory.types:constructor.Change
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

Change.prototype = {
  constructor: Change,
  /**
   * @ngdoc property
   * @name changeHistory.types:constructor.Change#id
   * @propertyOf changeHistory.types:constructor.Change
   * @return {String} Id of the change
   */

  /**
   * @ngdoc property
   * @name changeHistory.types:constructor.Change#title
   * @propertyOf changeHistory.types:constructor.Change
   * @return {String} title of the change
   */

  /**
   * @ngdoc property
   * @name changeHistory.types:constructor.Change#updated
   * @propertyOf changeHistory.types:constructor.Change
   * @return {Number} timestamp
   */

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$getAgentName
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @return {String} agent (contributor) name
   */
  $getAgentName: function() { return maybe(maybe(this.contributors)[0]).name; },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$getChangeReason
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @return {String} reason for the change
   */
  $getChangeReason: function() { return maybe(maybe(this.changeInfo)[0]).reason; },

  // TODO check for agent id; also add $getAgentId as option in $getAgent (last checked 12 July 14)

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$getAgentUrl
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @return {String} URL of the agent - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).agent).href); },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$getAgent
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  $getAgent: function() { return this.$client.getAgent(this.$getAgentUrl()); },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$restore
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the {@link changeHistory.functions:restoreChange restoreChange} response
   */
  $restore: function(opts) {
    return this.$client.changeHistory.restoreChange(this.id, opts);
  }

};
},{"./../FamilySearch":1,"./../utils":48}],7:[function(require,module,exports){
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
 * Two methods to note below are _$save_ and _$delete_.
 * _$save_ persists the changes made to father, mother, child, and facts;
 * _$delete_ removes the relationship.
 *
 * @param {Object=} data an object with optional attributes {$father, $mother, $child, fatherFacts, motherFacts}.
 * _$father_, _$mother_, and _$child_ are Person objects, URLs, or ids.
 * _fatherFacts_ and _motherFacts_ are arrays of Facts or objects to be passed into the Fact constructor.
 */
var ChildAndParents = FS.ChildAndParents = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.$father) {
      //noinspection JSUnresolvedFunction
      this.$setFather(data.$father);
      delete this.$father;
    }
    if (data.$mother) {
      //noinspection JSUnresolvedFunction
      this.$setMother(data.$mother);
      delete this.$mother;
    }
    if (data.$child) {
      //noinspection JSUnresolvedFunction
      this.$setChild(data.$child);
      delete this.$child;
    }
    if (data.fatherFacts) {
      utils.forEach(this.fatherFacts, function(fact, i){
        if(!(fact instanceof FS.Fact)){
          this.fatherFacts[i] = client.createFact(fact);
        }
      }, this);
    }
    if (data.motherFacts) {
      utils.forEach(this.motherFacts, function(fact, i){
        if(!(fact instanceof FS.Fact)){
          this.motherFacts[i] = client.createFact(fact);
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

ChildAndParents.prototype = {
  constructor: ChildAndParents,
  /**
   * @ngdoc property
   * @name parentsAndChildren.types:constructor.ChildAndParents#id
   * @propertyOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} Id of the relationship
   */

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getChildAndParentsUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} Url of this child-and-parents relationship
   */
  $getChildAndParentsUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).relationship).href); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getFatherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., parent-relationship type
   */
  $getFatherFacts: function() { return this.fatherFacts || []; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getMotherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., parent-relationship type
   */
  $getMotherFacts: function() { return this.motherFacts || []; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getFatherId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} Id of the father
   */
  $getFatherId: function() { return maybe(this.father).resourceId; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getFatherUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} URL of the father
   */
  $getFatherUrl: function() { return this.$helpers.removeAccessToken(maybe(this.father).resource); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getFather
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  $getFather: function() { return this.$client.getPerson(this.$getFatherUrl() || this.$getFatherId()); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getMotherId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} Id of the mother
   */
  $getMotherId: function() { return maybe(this.mother).resourceId; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getMotherUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} URL of the mother
   */
  $getMotherUrl: function() { return this.$helpers.removeAccessToken(maybe(this.mother).resource); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getMother
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  $getMother: function() { return this.$client.getPerson(this.$getMotherUrl() || this.$getMotherId()); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getChildId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} Id of the child
   */
  $getChildId: function() { return maybe(this.child).resourceId; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getChildUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} URL of the child
   */
  $getChildUrl: function() { return this.$helpers.removeAccessToken(maybe(this.child).resource); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getChild
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  $getChild: function() { return this.$client.getPerson(this.$getChildUrl() || this.$getChildId()); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getNotes
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} promise for the {@link notes.functions:getChildAndParentsNotes getChildAndParentsNotes} response
   */
  $getNotes: function() { return this.$client.getChildAndParentsNotes(this.$helpers.removeAccessToken(maybe(maybe(this.links).notes).href)); },


  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getSourceRefs
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} promise for the {@link sources.functions:getChildAndParentsSourceRefs getChildAndParentsSourceRefs} response
   */
  $getSourceRefs: function() { return this.$client.getChildAndParentsSourceRefs(this.id); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getSources
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} promise for the {@link sources.functions:getChildAndParentsSourcesQuery getChildAndParentsSourcesQuery} response
   */
  $getSources: function() { return this.$client.getChildAndParentsSourcesQuery(this.id); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getChanges
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} __BROKEN__ promise for the {@link changeHistory.functions:getChildAndParentsChanges getChildAndParentsChanges} response
   */
  $getChanges: function() { return this.$client.getChildAndParentsChanges(this.$helpers.removeAccessToken(maybe(this.links['change-history']).href)); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$setFather
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @param {Person|string} father person or URL or id
   * @return {ChildAndParents} this relationship
   */
  $setFather: function(father) {
    relHelpers.setMember.call(this, 'father', father);
    this.$fatherChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$setMother
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @param {Person|string} mother person or URL or id
   * @return {ChildAndParents} this relationship
   */
  $setMother: function(mother) {
    relHelpers.setMember.call(this, 'mother', mother);
    this.$motherChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$setChild
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description NOTE: Once the relationship has been saved, the child can no longer be changed
   * @param {Person|string} child person or URL or id
   * @return {ChildAndParents} this relationship
   */
  $setChild: function(child) {
    relHelpers.setMember.call(this, 'child', child);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$deleteFather
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description remove father from the relationship
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  $deleteFather: function(changeMessage) {
    relHelpers.deleteMember.call(this, 'father', changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$deleteMother
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description remove mother from the relationship
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  $deleteMother: function(changeMessage) {
    relHelpers.deleteMember.call(this, 'mother', changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$setFatherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact[]|Object[]} facts facts to set; if an array element is not a Fact, it is passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {ChildAndParents} this relationship
   */
  $setFatherFacts: function(facts, changeMessage) {
    relHelpers.setFacts.call(this, 'fatherFacts', facts, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$addFatherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {ChildAndParents} this relationship
   */
  $addFatherFact: function(value) {
    relHelpers.addFact.call(this, 'fatherFacts', value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$deleteFatherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  $deleteFatherFact: function(value, changeMessage) {
    relHelpers.deleteFact.call(this, 'fatherFacts', value, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$setMotherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact[]|Object[]} facts facts to set; if an array element is not a Fact, it is passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {ChildAndParents} this relationship
   */
  $setMotherFacts: function(facts, changeMessage) {
    relHelpers.setFacts.call(this, 'motherFacts', facts, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$addMotherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {ChildAndParents} this relationship
   */
  $addMotherFact: function(value) {
    relHelpers.addFact.call(this, 'motherFacts', value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$deleteMotherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  $deleteMotherFact: function(value, changeMessage) {
    relHelpers.deleteFact.call(this, 'motherFacts', value, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$save
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description
   * Create a new relationship if this relationship does not have an id, or update the existing relationship
   *
   * {@link http://jsfiddle.net/6of3pzte/ editable example}
   *
   * @param {String=} changeMessage default change message to use when fact/deletion-specific changeMessage was not specified
   * @param {boolean=} refresh true to read the relationship after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the relationship id, which is fulfilled after the relationship has been updated,
   * and if refresh is true, after the relationship has been read
   */
  $save: function(changeMessage, refresh, opts) {
    var postData = this.$client.createChildAndParents();
    var isChanged = false;
    var caprid = this.id;
    var self = this;

    // send father if new or changed
    if (!this.id || this.$fatherChanged) {
      postData.father = this.father;
      isChanged = true;
    }

    // send mother if new or changed
    if (!this.id || this.$motherChanged) {
      postData.mother = this.mother;
      isChanged = true;
    }

    // send child if new (can't change child)
    if (!this.id) {
      postData.child = this.child;
      isChanged = true;
    }

    // set global changeMessage
    if (changeMessage) {
      postData.attribution = self.$client.createAttribution(changeMessage);
    }

    // send facts if new or changed
    utils.forEach(['fatherFacts', 'motherFacts'], function(prop) {
      utils.forEach(self[prop], function(fact) {
        if (!caprid || !fact.id || fact.$changed) {
          relHelpers.addFact.call(postData, prop, fact);
          isChanged = true;
        }
      });
    });

    var promises = [];

    // post update
    if (isChanged) {
      promises.push(self.$helpers.chainHttpPromises(
        caprid ? self.$plumbing.getUrl('child-and-parents-relationship-template', null, {caprid: caprid}) :
                 self.$plumbing.getUrl('relationships'),
        function(url) {
          // set url from id
          utils.forEach(['father', 'mother', 'child'], function(role) {
            if (postData[role] && !postData[role].resource && postData[role].resourceId) {
              postData[role].resource =postData[role].resourceId;
            }
          });
          return self.$plumbing.post(url,
            { childAndParentsRelationships: [ postData ] },
            {'Content-Type': 'application/x-fs-v1+json'},
            opts,
            self.$helpers.getResponseEntityId);
        }));
    }

    // post deleted members that haven't been re-set to something else
    utils.forEach(['father', 'mother'], function(role) {
      if (self.id && self.$deletedMembers && self.$deletedMembers.hasOwnProperty(role) && !self[role]) {
        var msg = self.$deletedMembers[role] || changeMessage; // default to global change message
        promises.push(self.$helpers.chainHttpPromises(
          self.$plumbing.getUrl('child-and-parents-relationship-parent-template', null, {caprid: caprid, role: role}),
          function(url) {
            var headers = {'Content-Type': 'application/x-fs-v1+json'};
            if (msg) {
              headers['X-Reason'] = msg;
            }
            return self.$plumbing.del(url, headers, opts);
          }
        ));
      }
    });

    // post deleted facts
    if (caprid && self.$deletedFacts) {
      utils.forEach(self.$deletedFacts, function(value, key) {
        value = value || changeMessage; // default to global change message
        var headers = {'Content-Type': 'application/x-fs-v1+json'};
        if (value) {
          headers['X-Reason'] = value;
        }
        promises.push(self.$plumbing.del(key, headers, opts));
      });
    }

    // wait for all promises to be fulfilled
    var promise = self.$helpers.promiseAll(promises).then(function(results) {
      var id = caprid ? caprid : results[0]; // if we're adding a new relationship, get id from the first (only) promise
      self.$helpers.extendHttpPromise(promise, promises[0]); // extend the first promise into the returned promise

      if (refresh) {
        // re-read the relationship and set this object's properties from response
        return self.$client.getChildAndParents(id, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getRelationship());
          return id;
        });
      }
      else {
        return id;
      }
    });
    return promise;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$delete
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description delete this relationship - see {@link parentsAndChildren.functions:deleteChildAndParents deleteChildAndPArents}
   * @param {string} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the relationship URL
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteChildAndParents(this.$getChildAndParentsUrl() || this.id, changeMessage, opts);
  }
};
},{"../FamilySearch":1,"../relationshipHelpers":47,"../utils":48}],8:[function(require,module,exports){
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
 * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_resource FamilySearch API Docs}
 *
 * @param {Object=} data data
 */
var Collection = FS.Collection = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data && data.attribution){
    this.attribution = client.createAttribution(data.attribution);    
  }
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

Collection.prototype = {
  constructor: Collection,
  /**
   * @ngdoc property
   * @name sourceBox.types:constructor.Collection#id
   * @propertyOf sourceBox.types:constructor.Collection
   * @return {String} Id of the collection
   */

  /**
   * @ngdoc property
   * @name sourceBox.types:constructor.Collection#title
   * @propertyOf sourceBox.types:constructor.Collection
   * @return {String} title of the collection
   */

  /**
   * @ngdoc property
   * @name sourceBox.types:constructor.Collection#size
   * @propertyOf sourceBox.types:constructor.Collection
   * @return {Number} number of source descriptions in the collection
   */

  /**
   * @ngdoc property
   * @name sourceBox.types:constructor.Collection#attribution
   * @propertyOf sourceBox.types:constructor.Collection
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#$getCollectionUrl
   * @methodOf sourceBox.types:constructor.Collection
   * @function
   * @return {String} Url of the person
   */
  $getCollectionUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).self).href); },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#$getSourceDescriptions
   * @methodOf sourceBox.types:constructor.Collection
   * @function
   * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
   * @return {Object} promise for the {@link sourceBox.functions:getCollectionSourceDescriptions getCollectionSourceDescriptions} response
   */
  $getSourceDescriptions: function(params) {
    return this.$client.getCollectionSourceDescriptions(this.$helpers.removeAccessToken(this.links['source-descriptions'].href), params);
  },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#$save
   * @methodOf sourceBox.types:constructor.Collection
   * @function
   * @description
   * Create a new user-defined collection (folder)
   *
   * {@link http://jsfiddle.net/ppm671s2/ editable example}
   *
   * @param {boolean=} refresh true to read the collection after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the collection id, which is fulfilled after the collection has been updated,
   * and if refresh is true, after the collection has been read.
   */
  $save: function(refresh, opts) {
    var self = this;
    var promise = self.$helpers.chainHttpPromises(
      self.id ? self.$plumbing.getUrl('user-collection-template', null, {udcid: self.id}) : self.$plumbing.getUrl('user-collections'),
      function(url) {
        return self.$plumbing.post(url, { collections: [ self ] }, {}, opts, function(data, promise) {
          // x-entity-id and location headers are not set on update, only on create
          return self.id || promise.getResponseHeader('X-ENTITY-ID');
        });
      });
    var returnedPromise = promise.then(function(udcid) {
      self.$helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
      if (refresh) {
        // re-read the collection and set this object's properties from response
        return self.$client.getCollection(udcid, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getCollection());
          return udcid;
        });
      }
      else {
        return udcid;
      }
    });
    return returnedPromise;
  },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#$delete
   * @methodOf sourceBox.types:constructor.Collection
   * @function
   * @description delete this collection (must be empty)
   * - see {@link sources.functions:deleteCollection deleteCollection}
   *
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the collection id
   */
  $delete: function(opts) {
    return this.$client.deleteCollection(this.$getCollectionUrl() || this.id, opts);
  }

};
},{"./../FamilySearch":1,"./../utils":48}],9:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**********************************/
/**
 * @ngdoc function
 * @name discussions.types:constructor.Comment
 * @description
 *
 * Comment on a discussion
 * To create or update a comment, you must set text and either $discussionId or $memoryId.
 *
 * @param {Object=} data an object with optional attributes {text, $discussionId, $memoryId}
 **********************************/

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

Comment.prototype = {
  constructor: Comment,
  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#id
   * @propertyOf discussions.types:constructor.Comment
   * @return {String} Id of the comment
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#text
   * @propertyOf discussions.types:constructor.Comment
   * @return {String} text of the comment
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#created
   * @propertyOf discussions.types:constructor.Comment
   * @return {Number} timestamp
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#$discussionId
   * @propertyOf discussions.types:constructor.Comment
   * @return {String} Id of the discussion if this is a discussion comment
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#$memoryId
   * @propertyOf discussions.types:constructor.Comment
   * @return {String} Id of the memory if this is a memory comment
   */

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#$getCommentUrl
   * @methodOf discussions.types:constructor.Comment
   * @function
   * @return {String} URL of this comment; _NOTE_ however, that individual comments cannot be read
   */
  $getCommentUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).comment).href); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#$getAgentId
   * @methodOf discussions.types:constructor.Comment
   * @function
   * @return {String} id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentId: function() { return maybe(this.contributor).resourceId; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#$getAgentUrl
   * @methodOf discussions.types:constructor.Comment
   * @function
   * @return {String} URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentUrl: function() { return this.$helpers.removeAccessToken(maybe(this.contributor).resource); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#$getAgent
   * @methodOf discussions.types:constructor.Comment
   * @function
   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  $getAgent: function() { return this.$client.getAgent(this.$getAgentUrl() || this.$getAgentId()); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#$save
   * @methodOf discussions.types:constructor.Comment
   * @function
   * @description
   * Create a new comment or update an existing comment
   *
   * _NOTE_: there's no _refresh_ parameter because it's not possible to read individual comments;
   * however, the comment's id and URL is set when creating a new comment
   *
   * {@link http://jsfiddle.net/yr9zv5fw/ editable example}
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the comment id
   */
  $save: function(changeMessage, opts) {
    var self = this;
    var template = this.$memoryId ? 'memory-comments-template' : 'discussion-comments-template';
    return self.$helpers.chainHttpPromises(
      self.$plumbing.getUrl(template, null, {did: self.$discussionId, mid: self.$memoryId}),
      function(url) {
        var payload = {discussions: [{ comments: [ self ] }] };
        return self.$plumbing.post(url, payload, {'Content-Type' : 'application/x-fs-v1+json'}, opts, function(data, promise) {
          if (!self.id) {
            self.id = promise.getResponseHeader('X-ENTITY-ID');
          }
          if (!self.$getCommentUrl()) {
            self.links = { comment: { href: promise.getResponseHeader('Location') } };
          }
          return self.id;
        });
      });
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#$delete
   * @methodOf discussions.types:constructor.Comment
   * @function
   * @description delete this comment
   * @description delete this comment - see {@link discussions.functions:deleteDiscussionComment deleteDiscussionComment}
   * or {@link memories.functions:deleteMemoryComment deleteMemoryComment}
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the comment url
   */
  $delete: function(changeMessage, opts) {
    if (this.$discussionId) {
      return this.$client.deleteDiscussionComment(this.$getCommentUrl() || this.$discussionId, this.id, changeMessage, opts);
    }
    else {
      return this.$client.deleteMemoryComment(this.$getCommentUrl() || this.$memoryId, this.id, changeMessage, opts);
    }
  }

};
},{"./../FamilySearch":1,"./../utils":48}],10:[function(require,module,exports){
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
 * Two methods to note below are _$save_ and _$delete_.
 * _$save_ persists the changes made to husband, wife, and facts;
 * _$delete_ removes the relationship.
 *
 * @param {Object=} data an object with optional attributes {$husband, $wife, facts}.
 * _$husband_ and _$wife_ are Person objects, URLs, or ids.
 * _facts_ is an array of Facts or objects to be passed into the Fact constructor.
 */
var Couple = FS.Couple = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.$husband) {
      //noinspection JSUnresolvedFunction
      this.$setHusband(data.$husband);
    }
    if (data.$wife) {
      //noinspection JSUnresolvedFunction
      this.$setWife(data.$wife);
    }
    if (data.facts) {
      utils.forEach(this.facts, function(fact, i){
        if(!(fact instanceof FS.Fact)){
          this.facts[i] = client.createFact(fact);
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

Couple.prototype = {
  constructor: Couple,
  /**
   * @ngdoc property
   * @name spouses.types:constructor.Couple#id
   * @propertyOf spouses.types:constructor.Couple
   * @return {String} Id of the relationship
   */

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getCoupleUrl
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @return {String} Url of this couple relationship
   */
  $getCoupleUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).relationship).href); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getFacts
   * @methodOf spouses.types:constructor.Couple
   * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., marriage
   */
  $getFacts: function() { return this.facts || []; },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getMarriageFact
   * @methodOf spouses.types:constructor.Couple
   * @return {Fact} {@link fact.types:constructor.Fact Fact} of type http://gedcomx.org/Marriage (first one if multiple)
   */
  $getMarriageFact: function() { return utils.find(this.facts, {type: 'http://gedcomx.org/Marriage'}); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getHusbandId
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @return {String} Id of the husband
   */
  $getHusbandId: function() { return maybe(this.person1).resourceId; },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getHusbandUrl
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @return {String} URL of the husband
   */
  $getHusbandUrl: function() { return this.$helpers.removeAccessToken(maybe(this.person1).resource); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getHusband
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
   */
  $getHusband: function() { return this.$client.getPerson(this.$getHusbandUrl() || this.$getHusbandId()); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getWifeId
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @return {String} Id of the wife
   */
  $getWifeId: function() { return maybe(this.person2).resourceId; },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getWifeUrl
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @return {String} URL of the wife
   */
  $getWifeUrl: function() { return this.$helpers.removeAccessToken(maybe(this.person2).resource); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getWife
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
   */
  $getWife: function() { return this.$client.getPerson(this.$getWifeUrl() || this.$getWifeId()); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getSpouseId
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @description Use this method when you know the ID of one person in the relationship and you want to fetch the ID of the other person.
   * @param {string} ID of the spouse which you already know
   * @return {String} Id of the other spouse
   */
  $getSpouseId: function(knownSpouseId) { 
    if(maybe(this.person1).resourceId === knownSpouseId) {
      return maybe(this.person2).resourceId;
    } else {
      return maybe(this.person1).resourceId;
    }
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getSpouseUrl
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @description Use this method when you know the ID of one person in the relationship and you want to fetch the URL of the other person.
   * @param {string} ID of the spouse which you already know
   * @return {String} URL of the other spouse
   */
  $getSpouseUrl: function(knownSpouseId) {
    if(maybe(this.person1).resourceId === knownSpouseId) {
      return this.$helpers.removeAccessToken(maybe(this.person2).resource);
    } else {
      return this.$helpers.removeAccessToken(maybe(this.person1).resource);
    }
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getSpouse
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @description Use this method when you know the ID of one person in the relationship and you want to fetch the other person.
   * @param {string} ID of the spouse which you already know
   * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
   */
  $getSpouse: function(knownSpouseId) { 
    return this.$client.getPerson(this.$getSpouseUrl(knownSpouseId) || this.$getSpouseId(knownSpouseId));
  },
  
  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getNotes
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @return {Object} promise for the {@link notes.functions:getCoupleNotes getCoupleNotes} response
   */
  $getNotes: function() { return this.$client.getCoupleNotes(this.$helpers.removeAccessToken(maybe(maybe(this.links).notes).href)); },


  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getSourceRefs
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @return {Object} promise for the {@link sources.functions:getCoupleSourceRefs getCoupleSourceRefs} response
   */
  $getSourceRefs: function() { return this.$client.getCoupleSourceRefs(this.id); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getSources
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @return {Object} promise for the {@link sources.functions:getCoupleSourcesQuery getCoupleSourcesQuery} response
   */
  $getSources: function() { return this.$client.getCoupleSourcesQuery(this.id); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$getChanges
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @return {Object} promise for the {@link sources.functions:getCoupleChanges getCoupleChanges} response
   */
  $getChanges: function() { return this.$client.getCoupleChanges(this.$helpers.removeAccessToken(maybe(this.links['change-history']).href)); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$setHusband
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
   * @param {Person|string} husband person or URL or id
   * @return {Couple} this relationship
   */
  $setHusband: function(husband) {
    relHelpers.setMember.call(this, 'person1', husband);
    this.$husbandChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$setWife
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
   * @param {Person|string} wife person or URL or id
   * @return {Couple} this relationship
   */
  $setWife: function(wife) {
    relHelpers.setMember.call(this, 'person2', wife);
    this.$wifeChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$setFacts
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @param {Fact[]|Object[]} facts facts to set; if array elements are not Facts, they are passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {Couple} this relationship
   */
  $setFacts: function(facts, changeMessage) {
    relHelpers.setFacts.call(this, 'facts', facts, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$addFact
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {Couple} this relationship
   */
  $addFact: function(value) {
    relHelpers.addFact.call(this, 'facts', value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$deleteFact
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {Couple} this relationship
   */
  $deleteFact: function(value, changeMessage) {
    relHelpers.deleteFact.call(this, 'facts', value, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$save
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @description
   * Create a new relationship if this relationship does not have an id, or update the existing relationship
   *
   * {@link http://jsfiddle.net/LtphkL51/ editable example}
   *
   * @param {String=} changeMessage default change message to use when fact/deletion-specific changeMessage was not specified
   * @param {boolean=} refresh true to read the relationship after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the relationship id, which is fulfilled after the relationship has been updated,
   * and if refresh is true, after the relationship has been read
   */
  $save: function(changeMessage, refresh, opts) {
    var postData = this.$client.createCouple();
    var isChanged = false;
    var crid = this.id;
    var self = this;

    // send husband and wife if new or either has changed
    if (!this.id || this.$husbandChanged || this.$wifeChanged) {
      postData.person1 = this.person1;
      postData.person2 = this.person2;
      isChanged = true;
    }

    // set global changeMessage
    if (changeMessage) {
      postData.attribution = self.$client.createAttribution(changeMessage);
    }

    utils.forEach(this.facts, function(fact) {
      if (!crid || !fact.id || fact.$changed) {
        relHelpers.addFact.call(postData, 'facts', fact);
        isChanged = true;
      }
    });

    var promises = [];

    // post update
    if (isChanged) {
      if (!crid) {
        postData.type = 'http://gedcomx.org/Couple'; // set type on new relationships
      }
      // as of 9 July 2014 it's possible to update relationships using the relationships endpoint,
      // but the way we're doing it is fine as well
      promises.push(self.$helpers.chainHttpPromises(
        crid ? self.$plumbing.getUrl('couple-relationship-template', null, {crid: crid}) :
          self.$plumbing.getUrl('relationships'),
        function(url) {
          // set url from id
          utils.forEach(['person1', 'person2'], function(role) {
            if (postData[role] && !postData[role].resource && postData[role].resourceId) {
              postData[role].resource = postData[role].resourceId;
            }
          });
          return self.$plumbing.post(url,
            { relationships: [ postData ] },
            {},
            opts,
            self.$helpers.getResponseEntityId);
        }));
    }

    // post deleted facts
    if (crid && this.$deletedFacts) {
      utils.forEach(this.$deletedFacts, function(value, key) {
        value = value || changeMessage; // default to global change message
        promises.push(self.$plumbing.del(key, value ? {'X-Reason' : value} : {}, opts));
      });
    }

    var relationship = this;
    // wait for all promises to be fulfilled
    var promise = self.$helpers.promiseAll(promises).then(function(results) {
      var id = crid ? crid : results[0]; // if we're adding a new relationship, get id from the first (only) promise
      self.$helpers.extendHttpPromise(promise, promises[0]); // extend the first promise into the returned promise

      if (refresh) {
        // re-read the relationship and set this object's properties from response
        return self.$client.getCouple(id, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(relationship, utils.appFieldRejector);
          utils.extend(relationship, response.getRelationship());
          return id;
        });
      }
      else {
        return id;
      }
    });
    return promise;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#$delete
   * @methodOf spouses.types:constructor.Couple
   * @function
   * @description delete this relationship - see {@link spouses.functions:deleteCouple deleteCouple}
   * @param {string} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the relationship URL
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteCouple(this.$getCoupleUrl() || this.id, changeMessage, opts);
  }
};
},{"../FamilySearch":1,"../relationshipHelpers":47,"../utils":48}],11:[function(require,module,exports){
var FS = require('./../FamilySearch');

// construct formal date from [about|after|before] [[day] month] year [BC]
var constructFormalDate = function(fields, ignoreModifiers) {
  var prefix = '', suffix = '', day = '', month = '', year, sign = '+';
  var pos = 0;
  // handle modifier
  if (fields[pos] === 'about') {
    if (!ignoreModifiers) {
      prefix = 'A';
    }
    pos++;
  }
  else if (fields[pos] === 'before') {
    if (!ignoreModifiers) {
      prefix = 'A/';
    }
    pos++;
  }
  else if (fields[pos] === 'after') {
    if (!ignoreModifiers) {
      prefix = 'A';
      suffix = '/';
    }
    pos++;
  }
  // handle day (no month names are <= 2 characters)
  if (fields[pos].length <= 2) {
    day = (fields[pos].length === 1 ? '0' : '') + fields[pos];
    pos++;
  }
  // handle month
  var monthNum = ['january','february','march','april','may','june','july','august','september','october','november','december']
    .indexOf(fields[pos]) + 1;
  if (monthNum > 0) {
    month = (monthNum < 10 ? '0' : '') + monthNum.toString();
    pos++;
  }
  // handle year (required)
  year = fields[pos];
  pos++;
  // handle bc
  if (pos < fields.length && fields[pos] === 'bc') {
    sign = '-';
  }
  // construct formal date
  return prefix+sign+year+(month ? '-' : '')+month+(day ? '-' : '')+day+suffix;
};

/**
 * @ngdoc function
 * @name authorities.types:constructor.Date
 * @description
 *
 * Standardized date
 */
var FSDate = FS.Date = function(client, data) {
  FS.BaseClass.call(this, client, data);
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

FSDate.prototype = {
  constructor: FSDate,

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#normalized
   * @propertyOf authorities.types:constructor.Date
   * @return {string} normalized date
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#earliest
   * @propertyOf authorities.types:constructor.Date
   * @return {Object} information (normalized, numeric, astro) about earliest date in a range
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#latest
   * @propertyOf authorities.types:constructor.Date
   * @return {Object} information (normalized, numeric, astro) about latest date in a range
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#requested
   * @propertyOf authorities.types:constructor.Date
   * @return {string} requested date to standardize
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#original
   * @propertyOf authorities.types:constructor.Date
   * @return {string} original date to standardize
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#ambiguous
   * @propertyOf authorities.types:constructor.Date
   * @return {boolean} true if ambiguous
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Date#valid
   * @propertyOf authorities.types:constructor.Date
   * @return {boolean} true if valid
   */

  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#$getFormalDate
   * @methodOf authorities.types:constructor.Date
   * @function
   * @return {string} GEDCOM-X formal date format
   */
  $getFormalDate: function() {
    // as far as I can tell, normalized date appears in one of three formats:
    // [about|after|before] [[day] month] year [BC]
    // from [[day] month] year [BC] to [[day] month] year [BC]
    // [[day] month] year [BC] (/ [[day] month] year [BC])+
    var formalDate = '';
    if (this.normalized) {
      // split into fields
      var fields = this.normalized.trim().toLowerCase().split(' ');
      // GEDCOM-X formal date doesn't allow the third format, so keep just the first date
      var pos = fields.indexOf('/');
      if (pos >= 0) {
        fields = fields.slice(0, pos);
      }
      // handle from <date> to <date>
      if (fields[0] === 'from') {
        pos = fields.indexOf('to');
        // date normalization has a bug where "before 20 Mar 2006 - after 16 dec 2007"
        // is normalized to "from after 20 March 2006 to 16 December 2007"
        // to get around this bug, ignore date modifiers when parsing date-range dates so we return simply "+2006-03-20/+2007-12-16"
        formalDate = constructFormalDate(fields.slice(1,pos), true)+'/'+constructFormalDate(fields.slice(pos+1), true);
      }
      else {
        // handle <date>
        formalDate = constructFormalDate(fields, false);
      }
    }
    return formalDate;
  }
};

},{"./../FamilySearch":1}],12:[function(require,module,exports){
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
 * @param {Object=} data data
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

// TODO consider disallowing $save()'ing or $delete()'ing discussions

Discussion.prototype = {
  constructor: Discussion,
  /**
   * @ngdoc property
   * @name discussions.types:constructor.Discussion#id
   * @propertyOf discussions.types:constructor.Discussion
   * @return {String} Id of the discussion
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Discussion#title
   * @propertyOf discussions.types:constructor.Discussion
   * @return {String} title of the discussion
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Discussion#details
   * @propertyOf discussions.types:constructor.Discussion
   * @return {String} description / text of the discussion
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Discussion#created
   * @propertyOf discussions.types:constructor.Discussion
   * @return {Number} timestamp in millis
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Discussion#modified
   * @propertyOf discussions.types:constructor.Discussion
   * @return {Number} timestamp in millis
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Discussion#numberOfComments
   * @propertyOf discussions.types:constructor.Discussion
   * @return {Number} number of comments
   */

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$getDiscussionUrl
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @return {String} URL of this discussion
   */
  $getDiscussionUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).discussion).href); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$getCommentsUrl
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @return {String} URL of the comments endpoint - pass into {@link discussions.functions:getDiscussionComments getDiscussionComments} for details
   */
  $getCommentsUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).comments).href); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$getComments
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @return {Object} promise for the {@link discussions.functions:getDiscussionComments getDiscussionComments} response
   */
  $getComments: function() { return this.$client.getDiscussionComments(this.$getCommentsUrl()); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$getAgentId
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @return {String} id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentId: function() { return maybe(this.contributor).resourceId; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$getAgentUrl
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @return {String} URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentUrl: function() { return this.$helpers.removeAccessToken(maybe(this.contributor).resource); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$getAgent
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  $getAgent: function() { return this.$client.getAgent(this.$getAgentUrl() || this.$getAgentId()); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$save
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @description
   * Create a new discussion (if this discussion does not have an id) or update the existing discussion
   *
   * {@link http://jsfiddle.net/fsy9z6kx/ editable example}
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @param {boolean=} refresh true to read the discussion after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the discussion id, which is fulfilled after the discussion has been updated,
   * and if refresh is true, after the discussion has been read.
   */
  $save: function(changeMessage, refresh, opts) {
    var self = this;
    var promise = self.$helpers.chainHttpPromises(
      self.id ? self.$plumbing.getUrl('discussion-template', null, {did: self.id}) : self.$plumbing.getUrl('discussions'),
      function(url) {
        return self.$plumbing.post(url, { discussions: [ self ] }, {'Content-Type' : 'application/x-fs-v1+json'}, opts, function(data, promise) {
          // x-entity-id and location headers are not set on update, only on create
          return self.id || promise.getResponseHeader('X-ENTITY-ID');
        });
      });
    var returnedPromise = promise.then(function(did) {
      self.$helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
      if (refresh) {
        // re-read the discussion and set this object's properties from response
        return self.$client.getDiscussion(did, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getDiscussion());
          return did;
        });
      }
      else {
        return did;
      }
    });
    return returnedPromise;
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$delete
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @description delete this discussion - see {@link discussions.functions:deleteDiscussion deleteDiscussion}
   *
   * __NOTE__ if you delete a discussion, it's up to you to delete the corresponding Discussion Refs
   * Since there is no way to tell which people a discussion has been linked to, your best best is to
   * attach a discussion to a single person and to delete the discussion when you delete the discussion-reference
   * FamilySearch is aware of this issue but hasn't committed to a fix.
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the discussion id
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteDiscussion(this.$getDiscussionUrl() || this.id, changeMessage, opts);
  }

};
},{"./../FamilySearch":1,"./../utils":48}],13:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name discussions.types:constructor.DiscussionRef
 * @description
 *
 * Reference to a discussion on a person.
 * To create a new discussion reference, you must set $personId and discussion.
 * _NOTE_: discussion references cannot be updated. They can only be created or deleted.
 *
 * @param {Object=} data an object with optional attributes {$personId, discussion}
 * _discussion_ can be a {@link discussions.types:constructor.Discussion Discussion} or a discussion URL or a discussion id
 */
var DiscussionRef = FS.DiscussionRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
  if (data && data.discussion) {
    //noinspection JSUnresolvedFunction
    this.$setDiscussion(data.discussion);
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

DiscussionRef.prototype = {
  constructor: DiscussionRef,

  /**
   * @ngdoc property
   * @name discussions.types:constructor.DiscussionRef#id
   * @propertyOf discussions.types:constructor.DiscussionRef
   * @return {String} Discussion Ref Id
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.DiscussionRef#resourceId
   * @propertyOf discussions.types:constructor.DiscussionRef
   * @return {String} Discussion Id
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.DiscussionRef#resource
   * @propertyOf discussions.types:constructor.DiscussionRef
   * @return {String} Discussion URL
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.DiscussionRef#attribution
   * @propertyOf discussions.types:constructor.DiscussionRef
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.DiscussionRef#$personId
   * @propertyOf discussions.types:constructor.DiscussionRef
   * @return {String} Id of the person to whom this discussion is attached
   */

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#$getDiscussionRefUrl
   * @methodOf discussions.types:constructor.DiscussionRef
   * @function
   * @return {String} URL of this discussion reference; _NOTE_ however, that individual discussion references cannot be read
   */
  $getDiscussionRefUrl: function() {
    return this.$helpers.removeAccessToken(maybe(maybe(this.links)['discussion-reference']).href);
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#$getDiscussionUrl
   * @methodOf discussions.types:constructor.DiscussionRef
   * @function
   * @return {string} URL of the discussion (without the access token) -
   * pass into {@link discussions.functions:getDiscussion getDiscussion} for details
   */
  $getDiscussionUrl: function() {
    return this.$helpers.removeAccessToken(this.resource);
  },

/**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#$getDiscussion
   * @methodOf discussions.types:constructor.DiscussionRef
   * @function
   * @return {Object} promise for the {@link discussions.functions:getDiscussion getDiscussion} response
   */
  $getDiscussion: function() {
    return this.$client.getDiscussion(this.$getDiscussionUrl() || this.resourceId);
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#$setDiscussion
   * @methodOf discussions.types:constructor.DiscussionRef
   * @function
   * @param {Discussion|string} discussion Discussion object or discussion url or discussion id
   * @return {DiscussionRef} this discussion ref
   */
  $setDiscussion: function(discussion) {
    if (discussion instanceof FS.Discussion) {
      this.resource = discussion.$getDiscussionUrl();
      this.resourceId = discussion.id;
    }
    else if (this.$helpers.isAbsoluteUrl(discussion)) {
      this.resource = this.$helpers.removeAccessToken(discussion);
    }
    else {
      this.resourceId = discussion;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#$save
   * @methodOf discussions.types:constructor.DiscussionRef
   * @function
   * @description
   * Create a new discussion reference
   *
   * NOTE: there's no _refresh_ parameter because it's not possible to read individual discussion references;
   * however, the discussion reference's URL is set when creating a new discussion reference
   *
   * {@link http://jsfiddle.net/q7pwkc9k/ editable example}
   *
   * @param {string} changeMessage change message - unused - discussion reference attributions do not contain change messages
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the discussion reference url
   * (note however that individual discussion references cannot be read).
   */
  $save: function(changeMessage, opts) {
    var self = this;
    return self.$helpers.chainHttpPromises(
      self.$plumbing.getUrl('person-discussion-references-template', null, {pid: self.$personId}),
      function(url) {
        if (!self.resource && self.resourceId) {
          self.resource = self.resourceId;
        }
        var payload = {
          persons: [{
            id: self.$personId,
            'discussion-references' : [ { resource: self.resource } ]
          }]
        };
        if (changeMessage) {
          payload.persons[0].attribution = self.$client.createAttribution(changeMessage);
        }
        var headers = {'Content-Type': 'application/x-fs-v1+json'};
        return self.$plumbing.post(url, payload, headers, opts, function(data, promise) {
          if (!self.$getDiscussionRefUrl()) {
            self.links = {
              'discussion-reference': {
                href: promise.getResponseHeader('Location'),
                title: 'Discussion Reference'
              }
            };
          }
          return self.$getDiscussionRefUrl();
        });
      });
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#$delete
   * @methodOf discussions.types:constructor.DiscussionRef
   * @function
   * @description delete this discussion reference - see {@link discussions.functions:deleteDiscussionRef deleteDiscussionRef}
   * @param {string=} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the discussion reference url
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteDiscussionRef(this.$getDiscussionRefUrl() || this.$personId, this.id, changeMessage, opts);
  }

};
},{"./../FamilySearch":1,"./../utils":48}],14:[function(require,module,exports){
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
 * @param {Object=} data with optional attributes
 * {type, $date, $formalDate, $place, $normalizedPlace, $changeMessage}
 */
var Fact = FS.Fact = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.$date) {
      //noinspection JSUnresolvedFunction
      this.$setDate(data.$date);
      delete this.$date;
    }
    if (data.$formalDate) {
      //noinspection JSUnresolvedFunction
      this.$setFormalDate(data.$formalDate);
      delete this.$formalDate;
    }
    if (data.$place) {
      //noinspection JSUnresolvedFunction
      this.$setPlace(data.$place);
      delete this.$place;
    }
    if (data.$normalizedPlace) {
      //noinspection JSUnresolvedFunction
      this.$setNormalizedPlace(data.$normalizedPlace);
      delete this.$normalizedPlace;
    }
    if (data.$changeMessage) {
      //noinspection JSUnresolvedFunction
      this.$setChangeMessage(data.$changeMessage);
      delete this.$changeMessage;
    }
    if (data.attribution && !(data.attribution instanceof FS.Attribution)) {
      this.attribution = client.createAttribution(data.attribution);
    }
  }
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

Fact.prototype = {
  constructor: Fact,
  /**
   * @ngdoc property
   * @name fact.types:constructor.Fact#id
   * @propertyOf fact.types:constructor.Fact
   * @return {String} Id of the name
   */

  /**
   * @ngdoc property
   * @name fact.types:constructor.Fact#type
   * @propertyOf fact.types:constructor.Fact
   * @return {String} http://gedcomx.org/Birth, etc.
   */

  /**
   * @ngdoc property
   * @name fact.types:constructor.Fact#value
   * @propertyOf fact.types:constructor.Fact
   * @return {String} Description (some facts have descriptions)
   */

  /**
   * @ngdoc property
   * @name fact.types:constructor.Fact#attribution
   * @propertyOf fact.types:constructor.Fact
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$getDate
   * @methodOf fact.types:constructor.Fact
   * @function
   * @return {String} original date
   */
  $getDate: function() { return maybe(this.date).original; },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$getNormalizedDate
   * @methodOf fact.types:constructor.Fact
   * @function
   * @return {String} normalized place text
   */
  $getNormalizedDate: function() { return maybe(maybe(maybe(this.date).normalized)[0]).value; },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$getFormalDate
   * @methodOf fact.types:constructor.Fact
   * @function
   * @return {String} date in gedcomx format; e.g., +1836-04-13
   */
  $getFormalDate: function() { return maybe(this.date).formal; },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$getPlace
   * @methodOf fact.types:constructor.Fact
   * @function
   * @return {String} event place
   */
  $getPlace: function() { return maybe(this.place).original; },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$getNormalizedPlace
   * @methodOf fact.types:constructor.Fact
   * @function
   * @return {String} normalized place text
   */
  $getNormalizedPlace: function() { return maybe(maybe(maybe(this.place).normalized)[0]).value; },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$getNormalizedPlaceId
   * @methodOf fact.types:constructor.Fact
   * @function
   * @return {String} normalized place id
   */
  $getNormalizedPlaceId: function() {
    var desc = maybe(this.place).description;
    return (desc && desc.charAt(0) === '#') ? desc.substr(1) : '';
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$isCustomNonEvent
   * @methodOf fact.types:constructor.Fact
   * @function
   * @return {Boolean} true if this custom item is a non-event (i.e., fact)
   */
  $isCustomNonEvent: function() {
    if (!!this.qualifiers) {
      var qual = utils.find(this.qualifiers, {name: 'http://familysearch.org/v1/Event'});
      return !!qual && qual.value === 'false';
    }
    return false;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$setType
   * @methodOf fact.types:constructor.Fact
   * @function
   * @description sets the fact type
   * @param {String} type e.g., http://gedcomx.org/Birth
   * @return {Fact} this fact
   */
  $setType: function(type) {
    this.$changed = true;
    this.type = type;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$setCustomNonEvent
   * @methodOf fact.types:constructor.Fact
   * @function
   * @description declares whether this custom item is a fact or an event
   * @param {boolean} isNonEvent true for non-event (i.e., fact)
   * @return {Fact} this fact
   */
  $setCustomNonEvent: function(isNonEvent) {
    var pos;
    if (isNonEvent) {
      if (!this.qualifiers) {
        this.qualifiers = [];
      }
      pos = utils.findIndex(this.qualifiers, {name: 'http://familysearch.org/v1/Event'});
      if (pos < 0) {
        pos = this.qualifiers.push({name: 'http://familysearch.org/v1/Event'}) - 1;
      }
      this.qualifiers[pos].value = 'false';
    }
    else {
      if (!!this.qualifiers) {
        pos = utils.findIndex(this.qualifiers, {name: 'http://familysearch.org/v1/Event'});
        if (pos >= 0) {
          this.qualifiers.splice(pos, 1);
        }
        if (this.qualifiers.length === 0) {
          delete this.qualifiers;
        }
      }
    }
    this.$changed = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$setDate
   * @methodOf fact.types:constructor.Fact
   * @function
   * @description sets the fact date; original and formal date forms must be set -
   * if normalized form is not set it is set by the server
   * @param {String|Object|Date} date either a date string as written by the user (in which case you must also call $setFormalDate()),
   * or a {original, formal, normalized} object, or a {@link authorities.types:constructor.Date Date} object
   * @return {Fact} this fact
   */
  $setDate: function(date) {
    this.$changed = true;
    var originalDate;
    if (utils.isString(date)) {
      originalDate = date;
    }
    else if (date instanceof FS.Date) {
      originalDate = date.original;
      //noinspection JSUnresolvedFunction
      this.$setFormalDate(date.$getFormalDate());
      this.$setNormalizedDate(date.normalized);
    }
    else if (utils.isObject(date)) {
      originalDate = date.$original;
      this.$setFormalDate(date.$formal);
      this.$setNormalizedDate(date.$normalized);
    }
    if (!!originalDate) {
      if (!this.date) {
        this.date = {};
      }
      this.date.original = originalDate;
    }
    else {
      delete this.date;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$setFormalDate
   * @methodOf fact.types:constructor.Fact
   * @function
   * @description sets the formal date
   * @param {String} formalDate from the date authority; e.g., +1836-04-06
   * @return {Fact} this fact
   */
  $setFormalDate: function(formalDate) {
    this.$changed = true;
    if (!!formalDate) {
      if (!this.date) {
        this.date = {};
      }
      this.date.formal = formalDate;
    }
    else if (this.date) {
      delete this.date.formal;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$setNormalizedDate
   * @methodOf fact.types:constructor.Fact
   * @function
   * @description sets the normalized date
   * @param {String} normalizedDate; e.g., 6 April 1836
   * @return {Fact} this fact
   */
  $setNormalizedDate: function(normalizedDate) {
    this.$changed = true;
    if (!!normalizedDate) {
      if (!this.date) {
        this.date = {};
      }
      this.date.normalized = [{ value: normalizedDate }];
    }
    else if (this.date) {
      delete this.date.normalized;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$setPlace
   * @methodOf fact.types:constructor.Fact
   * @function
   * @description sets the place; original and normalized forms must be set
   * @param {String|Object|Date} place either a place string as written by the user (in which case you must also call $setNormalizedPlace()),
   * or a {original, normalized} object, or a {@link authorities.types:constructor.Place Place} object
   * @return {Fact} this fact
   */
  $setPlace: function(place) {
    this.$changed = true;
    var originalPlace;
    if (utils.isString(place) || place == null) {
      originalPlace = place;
    }
    else if (place instanceof FS.Place) {
      originalPlace = place.original;
      //noinspection JSUnresolvedFunction
      this.$setNormalizedPlace(place.$getNormalizedPlace());
    }
    else if (utils.isObject(place)) {
      originalPlace = place.$original;
      this.$setNormalizedPlace(place.$normalized);
    }
    if (!!originalPlace) {
      if (!this.place) {
        this.place = {};
      }
      this.place.original = originalPlace;
    }
    else {
      delete this.place;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$setNormalizedPlace
   * @methodOf fact.types:constructor.Fact
   * @function
   * @description sets the standard place text
   * @param {String} normalizedPlace from the place authority
   * @return {Fact} this fact
   */
  $setNormalizedPlace: function(normalizedPlace) {
    this.$changed = true;
    if (!!normalizedPlace) {
      if (!this.place) {
        this.place = {};
      }
      this.place.normalized = [{ value: normalizedPlace }];
    }
    else if (this.place) {
      delete this.place.normalized;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#$setChangeMessage
   * @methodOf fact.types:constructor.Fact
   * @function
   * @description sets the changeMessage used to update the fact
   * @param {String} changeMessage change message
   * @return {Fact} this fact
   */
  $setChangeMessage: function(changeMessage) {
    this.attribution = this.$client.createAttribution(changeMessage);
    //noinspection JSValidateTypes
    return this;
  }
};

},{"./../FamilySearch":1,"./../utils":48}],15:[function(require,module,exports){
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
 * @param {Object=} data an object with optional attributes {title, description, artifactFilename, $data}.
 * _$data_ is a string for Stories, or a FormData for Images or Documents
 * - if FormData, the field name of the file to upload _must_ be `artifact`.
 * _$data_ is ignored when updating a memory.
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

Memory.prototype = {
  constructor: Memory,
  /**
   * @ngdoc property
   * @name memories.types:constructor.Memory#id
   * @propertyOf memories.types:constructor.Memory
   * @return {String} Id of the Memory
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.Memory#mediaType
   * @propertyOf memories.types:constructor.Memory
   * @return {String} media type; e.g., image/jpeg
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.Memory#resourceType
   * @propertyOf memories.types:constructor.Memory
   * @return {String} resource type; e.g., http://gedcomx.org/DigitalArtifact
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.Memory#about
   * @propertyOf memories.types:constructor.Memory
   * @return {String} memory artifact URL
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.Memory#artifactMetadata
   * @propertyOf memories.types:constructor.Memory
   * @return {Object[]} array of { `artifactType`, `filename` }
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.Memory#attribution
   * @propertyOf memories.types:constructor.Memory
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getTitle
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} title
   */
  $getTitle: function() { return maybe(maybe(this.titles)[0]).value; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getDescription
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} description (may not apply to story memories)
   */
  $getDescription: function() { return maybe(maybe(this.description)[0]).value; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getIconUrl
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} URL of the icon with access token
   */
  $getIconUrl: function() { return this.$helpers.appendAccessToken(maybe(maybe(this.links)['image-icon']).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getThumbnailUrl
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} URL of the thumbnail with access token
   */
  $getThumbnailUrl: function() { return this.$helpers.appendAccessToken(maybe(maybe(this.links)['image-thumbnail']).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getImageUrl
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} URL of the full image with access token
   */
  $getImageUrl: function() { return this.$helpers.appendAccessToken(maybe(maybe(this.links)['image']).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getMemoryArtifactUrl
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} URL of the memory artifact (image, story, or document) with access token
   */
  $getMemoryArtifactUrl: function() {
    // remove old access token and append a new one in case they are different
    return this.$helpers.appendAccessToken(this.$helpers.removeAccessToken(this.about));
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getMemoryUrl
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} memory URL (without the access token)
   */
  $getMemoryUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links)['description']).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getArtifactFilename
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} filename (provided by the user or a default name)
   */
  $getArtifactFilename: function() { return maybe(maybe(this.artifactMetadata)[0]).filename; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getArtifactType
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} type; e.g., http://familysearch.org/v1/Image
   */
  $getArtifactType: function() { return maybe(maybe(this.artifactMetadata)[0]).artifactType; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getArtifactHeight
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {number} image height
   */
  $getArtifactHeight: function() { return maybe(maybe(this.artifactMetadata)[0]).height; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getArtifactWidth
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {number} image width
   */
  $getArtifactWidth: function() { return maybe(maybe(this.artifactMetadata)[0]).width; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getCommentsUrl
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} URL of the comments endpoint
   * - pass into {@link memories.functions:getMemoryComments getMemoryComments} for details
   */
  $getCommentsUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).comments).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getComments
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {Object} promise for the {@link memories.functions:getMemoryComments getMemoryComments} response
   */
  $getComments: function() { return this.$client.getMemoryComments(this.$getCommentsUrl() || this.id); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$setTitle
   * @methodOf memories.types:constructor.Memory
   * @function
   * @param {String} title memory title
   * @return {Memory} this memory
   */
  $setTitle: function(title) {
    this.titles = [ { value: title } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$setDescription
   * @methodOf memories.types:constructor.Memory
   * @function
   * @param {String} description memory description (may not apply to story memories)
   * @return {Memory} this memory
   */
  $setDescription: function(description) {
    this.description = [ { value: description } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$setArtifactFilename
   * @methodOf memories.types:constructor.Memory
   * @function
   * @param {String} filename uploaded file
   * @return {Memory} this memory
   */
  $setArtifactFilename: function(filename) {
    if (!utils.isArray(this.artifactMetadata) || !this.artifactMetadata.length) {
      this.artifactMetadata = [ {} ];
    }
    this.artifactMetadata[0].filename = filename;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$save
   * @methodOf memories.types:constructor.Memory
   * @function
   * @description
   * Create a new memory (if this memory does not have an id) or update the existing memory
   *
   * {@link http://jsfiddle.net/f2wrtgj0/ editable example}
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @param {boolean=} refresh true to read the discussion after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the memory id, which is fulfilled after the memory has been updated,
   * and if refresh is true, after the memory has been read.
   */
  $save: function(changeMessage, refresh, opts) {
    var self = this;
    var promise = self.$helpers.chainHttpPromises(
      self.id ? self.$plumbing.getUrl('memory-template', null, {mid: self.id}) : self.$plumbing.getUrl('memories'),
      function(url) {
        if (self.id) {
          // update memory
          return self.$plumbing.post(url, { sourceDescriptions: [ self ] }, {}, opts, function() {
            return self.id;
          });
        }
        else {
          // create memory
          var params = {};
          if (self.$getTitle()) {
            params.title = self.$getTitle();
          }
          if (self.$getDescription()) {
            params.description = self.$getDescription();
          }
          if (self.$getArtifactFilename()) {
            params.filename = self.$getArtifactFilename();
          }
          return self.$plumbing.post(self.$helpers.appendQueryParameters(url, params),
            self.$data, { 'Content-Type': utils.isString(self.$data) ? 'text/plain' : 'multipart/form-data' }, opts,
            self.$helpers.getResponseEntityId);
        }
      });
    var returnedPromise = promise.then(function(mid) {
      self.$helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
      if (refresh) {
        // re-read the person and set this object's properties from response
        return self.$client.getMemory(mid, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getMemory());
          return mid;
        });
      }
      else {
        return mid;
      }
    });
    return returnedPromise;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$delete
   * @methodOf memories.types:constructor.Memory
   * @function
   * @description delete this memory - see {@link memories.functions:deleteMemory deleteMemory}
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the memory URL
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteMemory(this.$getMemoryUrl() || this.id, changeMessage, opts);
  }

};
},{"./../FamilySearch":1,"./../utils":48}],16:[function(require,module,exports){
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
 * @param {Object=} data an object with optional attributes {description, qualifierValue, qualifierName}.
 * _description_ is required; it should be the memory URL
 * _qualifierValue_ is a comma-separated string of 4 numbers: "x-start,y-start,x-end,y-end".
 * Each number ranges from 0 to 1, with 0 corresponding to top-left and 1 corresponding to bottom-right.
 * _qualifierName_ is required if _qualifierValue_ is set; it should be http://gedcomx.org/RectangleRegion
 */
var MemoryArtifactRef = FS.MemoryArtifactRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
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

MemoryArtifactRef.prototype = {
  constructor: MemoryArtifactRef,
  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryArtifactRef#id
   * @propertyOf memories.types:constructor.MemoryArtifactRef
   * @return {String} Id of the Memory Artifact
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryArtifactRef#description
   * @propertyOf memories.types:constructor.MemoryArtifactRef
   * @return {String} URL of the memory
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#$getQualifierName
   * @methodOf memories.types:constructor.MemoryArtifactRef
   * @function
   * @return {String} qualifier name (http://gedcomx.org/RectangleRegion)
   */
  $getQualifierName: function() { return maybe(maybe(this.qualifiers)[0]).name; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#$getQualifierValue
   * @methodOf memories.types:constructor.MemoryArtifactRef
   * @function
   * @return {String} qualifier value (e.g., 0.0,.25,.5,.75)
   */
  $getQualifierValue: function() { return maybe(maybe(this.qualifiers)[0]).value; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#$setQualifierName
   * @methodOf memories.types:constructor.MemoryArtifactRef
   * @function
   * @param {string} qualifierName qualifier name
   * @return {MemoryArtifactRef} this memory artifact ref
   */
  $setQualifierName: function(qualifierName) {
    if (!utils.isArray(this.qualifiers) || !this.qualifiers.length) {
      this.qualifiers = [{}];
    }
    this.qualifiers[0].name = qualifierName;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#$setQualifierValue
   * @methodOf memories.types:constructor.MemoryArtifactRef
   * @function
   * @param {string} qualifierValue qualifier value
   * @return {MemoryArtifactRef} this memory artifact ref
   */
  $setQualifierValue: function(qualifierValue) {
    if (!utils.isArray(this.qualifiers) || !this.qualifiers.length) {
      this.qualifiers = [{}];
    }
    this.qualifiers[0].value = qualifierValue;
    //noinspection JSValidateTypes
    return this;
  }

};
},{"./../FamilySearch":1,"./../utils":48}],17:[function(require,module,exports){
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
 * @param {Object=} data an object with optional attributes {$memoryId, name, memoryArtifactRef}.
 * To create a new memory persona, you must set $memoryId and name.
 * _name_ can be a {@link name.types:constructor.Name Name} object or a fullText string.
 * _NOTE_ memory persona names don't have given or surname parts, only fullText
 */
var MemoryPersona = FS.MemoryPersona = function(client, data) {
  FS.BaseClass.call(this, client, data);
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

MemoryPersona.prototype = {
  constructor: MemoryPersona,
  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersona#id
   * @propertyOf memories.types:constructor.MemoryPersona
   * @return {String} Id of the Memory Persona
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersona#extracted
   * @propertyOf memories.types:constructor.MemoryPersona
   * @return {String} not sure what this means
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersona#$memoryId
   * @propertyOf memories.types:constructor.MemoryPersona
   * @return {String} Id of the memory to which this persona is attached
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$getMemoryPersonaUrl
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @return {String} memory persona URL
   */
  $getMemoryPersonaUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).persona).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$getMemoryArtifactRef
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {MemoryArtifactRef} {@link memories.types:constructor.MemoryArtifactRef MemoryArtifactRef}
   */
  $getMemoryArtifactRef: function() { return maybe(this.media)[0]; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$getNames
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {Name} a {@link name.types:constructor.Name Name}
   */
  $getName: function() { return maybe(this.names)[0]; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$getDisplayName
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @return {string} display name
   */
  $getDisplayName: function() { return maybe(this.display).name; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$getMemoryUrl
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @return {string} url of the memory
   */
  $getMemoryUrl: function() { return this.$helpers.removeAccessToken(maybe(this.$getMemoryArtifactRef()).description); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$getMemory
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @return {Object} promise for the {@link memories.functions:getMemory getMemory} response
   */
  $getMemory:  function() {
    return this.$client.getMemory(this.$getMemoryUrl() || this.$memoryId);
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$setName
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @param {Name|string} value name
   * @return {MemoryPersona} this memory persona
   */
  $setName: function(value) {
    if (!(value instanceof FS.Name)) {
      value = this.$client.createName(value);
    }
    this.names = [ value ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$setMemoryArtifactRef
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @param {MemoryArtifactRef} value memory artifact ref
   * @return {MemoryPersona} this memory persona
   */
  $setMemoryArtifactRef: function(value) {
    this.media = [ value ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$save
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @description
   * Create a new memory persona (if this memory persona does not have an id) or update the existing memory persona.
   * Only the name can be updated, not the memory id or the memory artifact reference.
   *
   * {@link http://jsfiddle.net/eeozaLkL/ editable example}
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @param {boolean=} refresh true to read the memory persona after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the memory persona URL, which is fulfilled after the memory persona has been updated,
   * and if refresh is true, after the memory persona has been read.
   */
  $save: function(changeMessage, refresh, opts) {
    var self = this;
    var promise = self.$helpers.chainHttpPromises(
      self.$plumbing.getUrl((self.id ? 'memory-persona-template' : 'memory-personas-template'), null, {mid: self.$memoryId, pid: self.id}),
      function(url) {
        if (!self.$getMemoryArtifactRef()) {
          // default the media artifact reference to point to the memory
          // the discovery resource is guaranteed to be set due to the getUrl statement
          var memoryUrl = self.$helpers.getUrlFromDiscoveryResource(self.$client.settings.discoveryResource, 'memory-template', {mid: self.$memoryId});
          self.$setMemoryArtifactRef(self.$client.createMemoryArtifactRef({description: memoryUrl}));
        }
        return self.$plumbing.post(url, { persons: [ self ] }, {}, opts, function(data, promise) {
          return self.$getMemoryPersonaUrl() || self.$helpers.removeAccessToken(promise.getResponseHeader('Location'));
        });
      });
    var returnedPromise = promise.then(function(url) {
      self.$helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
      if (refresh) {
        // re-read the person and set this object's properties from response
        return self.$client.getMemoryPersona(url, null, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getMemoryPersona());
          return url;
        });
      }
      else {
        return url;
      }
    });
    return returnedPromise;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$delete
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @description delete this memory persona - see {@link memories.functions:deleteMemoryPersona deleteMemoryPersona}
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the memory persona URL
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteMemoryPersona(this.$getMemoryPersonaUrl() || this.$memoryId, this.id, changeMessage, opts);
  }

};
},{"./../FamilySearch":1,"./../utils":48}],18:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name memories.types:constructor.MemoryPersonaRef
 * @description
 *
 * Reference from a person to a memory persona
 * To create a new memory persona reference, you must set both $personId and memoryPersona
 *
 * _NOTE_: memory persona references cannot be updated. They can only be created or deleted.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
 *
 * @param {Object=} data an object with optional attributes {$personId, $memoryPersona}.
 * _$memoryPersona_ can be a {@link memories.types:constructor.MemoryPersona MemoryPersona} or a memory persona url
 */
var MemoryPersonaRef = FS.MemoryPersonaRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data && data.$memoryPersona){
    this.$setMemoryPersona(data.$memoryPersona);
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

MemoryPersonaRef.prototype = {
  constructor: MemoryPersonaRef,
  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersonaRef#id
   * @propertyOf memories.types:constructor.MemoryPersonaRef
   * @return {String} Id of the Memory Persona Reference
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersonaRef#resource
   * @propertyOf memories.types:constructor.MemoryPersonaRef
   * @return {String} URL of the Memory Persona
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersonaRef#resourceId
   * @propertyOf memories.types:constructor.MemoryPersonaRef
   * @return {String} Id of the Memory Persona
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersonaRef#$personId
   * @propertyOf memories.types:constructor.MemoryPersonaRef
   * @return {String} Id of the person to which this persona is attached
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$getMemoryPersonaRefUrl
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @return {String} URL of this memory persona reference; _NOTE_ however, that individual memory persona references cannot be read
   */
  $getMemoryPersonaRefUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links)['evidence-reference']).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$getMemoryPersonaUrl
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @return {String} URL of the memory persona (without the access token);
   * pass into {@link memories.functions:getMemoryPersona getMemoryPersona} for details
   */
  $getMemoryPersonaUrl: function() { return this.$helpers.removeAccessToken(this.resource); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$getMemoryPersona
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @return {Object} promise for the {@link memories.functions:getMemoryPersona getMemoryPersona} response
   */
  $getMemoryPersona:  function() {
    return this.$client.getMemoryPersona(this.$getMemoryPersonaUrl());
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$getMemoryUrl
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @return {String} URL of the memory; pass into {@link memories.functions:getMemory getMemory} for details
   */
  $getMemoryUrl:  function() {
    return this.$helpers.removeAccessToken(maybe(maybe(this.links).memory).href);
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$getMemory
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @return {Object} promise for the {@link memories.functions:getMemory getMemory} response
   */
  $getMemory:  function() {
    return this.$client.getMemory(this.$getMemoryUrl());
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$setMemoryPersona
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @function
   * @param {MemoryPersona|string} memoryPersona MemoryPersona object or memory persona URL
   * @return {MemoryPersonaRef} this memory persona ref
   */
  $setMemoryPersona: function(memoryPersona) {
    if (memoryPersona instanceof FS.MemoryPersona) {
      //noinspection JSUnresolvedFunction
      memoryPersona = memoryPersona.$getMemoryPersonaUrl();
    }
    // we must remove the access token in order to pass this into addMemoryPersonaRef
    this.resource = this.$helpers.removeAccessToken(memoryPersona);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$save
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @description
   * Create a new memory persona ref
   *
   * NOTE: there's no _refresh_ parameter because it's not possible to read individual memory persona references;
   * however, the memory persona ref's id and URL is set when creating a new memory persona ref
   *
   * {@link http://jsfiddle.net/r3px0ork/ editable example}
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the memory persona ref URL, which is fulfilled after the memory persona ref has been created
   * (note however that individual memory persona references cannot be read).
   */
  $save: function(changeMessage, opts) {
    var self = this;
    return self.$helpers.chainHttpPromises(
      self.$plumbing.getUrl('person-memory-persona-references-template', null, {pid: self.$personId}),
      function(url) {
        return self.$plumbing.post(url, { persons: [{ evidence: [ self ] }] }, {}, opts, function(data, promise) {
          if (!self.id) {
            self.id = promise.getResponseHeader('X-ENTITY-ID');
          }
          if (!self.$getMemoryPersonaRefUrl()) {
            self.links = { 'evidence-reference' : { href: promise.getResponseHeader('Location') } };
          }
          return self.$getMemoryPersonaRefUrl();
        });
      });
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$delete
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @description delete this memory persona reference - see {@link memories.functions:deleteMemoryPersonaRef deleteMemoryPersonaRef}
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the memory persona ref URL
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteMemoryPersonaRef(this.$getMemoryPersonaRefUrl() || this.$personId, this.id, changeMessage, opts);
  }

};
},{"./../FamilySearch":1,"./../utils":48}],19:[function(require,module,exports){
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
 * @param {Object|String=} data either a fullText string or an object with optional attributes
 * {type, $givenName, $surname, $prefix, $suffix, $fullText, preferred, $changeMessage}
 */
var Name = FS.Name = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(utils.isString(data)){
      this.$setFullText(data);
    } else {
      if (data.type) {
        //noinspection JSUnresolvedFunction
        this.$setType(data.type);
      }
      if (data.$givenName) {
        //noinspection JSUnresolvedFunction
        this.$setGivenName(data.$givenName);
        delete this.$givenName;
      }
      if (data.$surname) {
        //noinspection JSUnresolvedFunction
        this.$setSurname(data.$surname);
        delete this.$surname;
      }
      if (data.$prefix) {
        //noinspection JSUnresolvedFunction
        this.$setPrefix(data.$prefix);
        delete this.$prefix;
      }
      if (data.$suffix) {
        //noinspection JSUnresolvedFunction
        this.$setSuffix(data.$suffix);
        delete this.$suffix;
      }
      if (data.$fullText) {
        //noinspection JSUnresolvedFunction
        this.$setFullText(data.$fullText);
        delete this.$fullText;
      }
      //noinspection JSUnresolvedFunction
      this.$setPreferred(!!data.preferred);
      if (data.$changeMessage) {
        //noinspection JSUnresolvedFunction
        this.$setChangeMessage(data.$changeMessage);
        delete this.$changeMessage;
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
  if (!utils.isArray(name.nameForms)) {
    name.nameForms = [];
  }
  while (pos >= name.nameForms.length) {
    name.nameForms.push({});
  }
  return name.nameForms[pos];
}

Name.prototype = {
  constructor: Name,
  /**
   * @ngdoc property
   * @name name.types:constructor.Name#id
   * @propertyOf name.types:constructor.Name
   * @return {String} Id of the name
   */

  /**
   * @ngdoc property
   * @name name.types:constructor.Name#type
   * @propertyOf name.types:constructor.Name
   * @return {String} http://gedcomx.org/BirthName, etc.
   */

  /**
   * @ngdoc property
   * @name name.types:constructor.Name#preferred
   * @propertyOf name.types:constructor.Name
   * @return {Boolean} true if this name is preferred
   */

  /**
   * @ngdoc property
   * @name name.types:constructor.Name#attribution
   * @propertyOf name.types:constructor.Name
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getNameFormsCount
   * @methodOf name.types:constructor.Name
   * @function
   * @return {Number} get the number of name forms
   */
  $getNameFormsCount: function() { return this.nameForms ? this.nameForms.length : 0; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getNameForm
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {Number} get the `i`'th name form: each name form has `lang`, `fullText`, and `parts` properties
   */
  $getNameForm: function(i) { return maybe(this.nameForms)[i || 0]; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getFullText
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the full text of the `i`'th name form
   */
  $getFullText: function(i) { return maybe(this.$getNameForm(i)).fullText; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getLanguage
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the language of the `i`'th name form
   */
  $getLang: function(i) { return maybe(this.$getNameForm(i)).lang; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getNamePart
   * @methodOf name.types:constructor.Name
   * @function
   * @description you can call $getGivenName, $getSurname, $getPrefix, or $getSuffix instead of this function
   * @param {String} type http://gedcomx.org/Given or http://gedcomx.org/Surname
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the specified part of the `i`'th name form
   */
  $getNamePart: function(type, i) {
    return maybe(utils.find(maybe(this.$getNameForm(i)).parts, {type: type})).value;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getGivenName
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the given part of the `i`'th name form
   */
  $getGivenName: function(i) {
    return this.$getNamePart('http://gedcomx.org/Given', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getSurname
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the surname part of the `i`'th name form
   */
  $getSurname: function(i) {
    return this.$getNamePart('http://gedcomx.org/Surname', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getPrefix
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the prefix part of the `i`'th name form
   */
  $getPrefix: function(i) {
    return this.$getNamePart('http://gedcomx.org/Prefix', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getSuffix
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the suffix part of the `i`'th name form
   */
  $getSuffix: function(i) {
    return this.$getNamePart('http://gedcomx.org/Suffix', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setType
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   * @param {String} type e.g., http://gedcomx.org/BirthName
   * @return {Name} this name
   */
  $setType: function(type) {
    this.$changed = true;
    if (!!type) {
      this.type = type;
    }
    else {
      delete this.type;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setPreferred
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   *
   * __NOTE__: the preferred name flag can be set only when the person is initially created; after that it is read-only
   * @param {boolean} isPreferred true if preferred
   * @return {Name} this name
   */
  $setPreferred: function(isPreferred) {
    this.$changed = true;
    this.preferred = isPreferred;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setFullText
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   * @param {String} fullText value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  $setFullText: function(fullText, i) {
    this.$changed = true;
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
   * @name name.types:constructor.Name#$setNamePart
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value;
   * you can call $setGivenName, $setSurname, $setPrefix, and $setSuffix instead of this function
   * @param {String} name value
   * @param {String} type http://gedcomx.org/Given or http://gedcomx.org/Surname
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  $setNamePart: function(name, type, i) {
    this.$changed = true;
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
   * @name name.types:constructor.Name#$setGivenName
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   * @param {String} givenName value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  $setGivenName: function(givenName, i) {
    return this.$setNamePart(givenName, 'http://gedcomx.org/Given', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setSurname
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   * @param {String} surname value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  $setSurname: function(surname, i) {
    return this.$setNamePart(surname, 'http://gedcomx.org/Surname', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setPrefix
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   * @param {String} prefix value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  $setPrefix: function(prefix, i) {
    return this.$setNamePart(prefix, 'http://gedcomx.org/Prefix', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setSuffix
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   * @param {String} suffix value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  $setSuffix: function(suffix, i) {
    return this.$setNamePart(suffix, 'http://gedcomx.org/Suffix', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setChangeMessage
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the changeMessage used to update the name
   * @param {String} changeMessage change message
   * @return {Name} this name
   */
  $setChangeMessage: function(changeMessage) {
    this.attribution = this.$client.createAttribution(changeMessage);
    //noinspection JSValidateTypes
    return this;
  }
};

},{"./../FamilySearch":1,"./../utils":48}],20:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name notes.types:constructor.Note
 * @description
 *
 * Note
 * To create a new note, you must set subject, text, and either $personId, $childAndParentsId, or $coupleId.
 *
 * @param {Object=} data an object with optional attributes {subject, text, $personId, $childAndParentsId, $coupleId}
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

Note.prototype = {
  constructor: Note,
  /**
   * @ngdoc property
   * @name notes.types:constructor.Note#id
   * @propertyOf notes.types:constructor.Note
   * @return {String} Id of the note
   */

  /**
   * @ngdoc property
   * @name notes.types:constructor.Note#subject
   * @propertyOf notes.types:constructor.Note
   * @return {String} subject / title of the note
   */

  /**
   * @ngdoc property
   * @name notes.types:constructor.Note#text
   * @propertyOf notes.types:constructor.Note
   * @return {String} text of the note
   */

  /**
   * @ngdoc property
   * @name notes.types:constructor.Note#attribution
   * @propertyOf notes.types:constructor.Note
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc property
   * @name notes.types:constructor.Note#$personId
   * @propertyOf notes.types:constructor.Note
   * @return {String} Id of the person to which this note is attached if it is a person note
   */

  /**
   * @ngdoc property
   * @name notes.types:constructor.Note#$childAndParentsId
   * @propertyOf notes.types:constructor.Note
   * @return {String} Id of the child and parents relationship to which this note is attached if it is a child and parents note
   */

  /**
   * @ngdoc property
   * @name notes.types:constructor.Note#$coupleId
   * @propertyOf notes.types:constructor.Note
   * @return {String} Id of the couple relationship to which this note is attached if it is a couple note
   */

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#$getNoteUrl
   * @methodOf notes.types:constructor.Note
   * @function
   * @return {String} note URL (without the access token)
   */
  $getNoteUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).note).href); },

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#$save
   * @methodOf notes.types:constructor.Note
   * @function
   * @description
   * Create a new note (if this note does not have an id) or update the existing note
   *
   * {@link http://jsfiddle.net/vg1kge0o/ editable example}
   *
   * @param {string} changeMessage change message
   * @param {boolean=} refresh true to read the note after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the note id, which is fulfilled after the note has been updated,
   * and if refresh is true, after the note has been read.
   */
  $save: function(changeMessage, refresh, opts) {
    var self = this;
    var template, label;
    var headers = {};
    if (self.$personId) {
      template = self.id ? 'person-note-template' : 'person-notes-template';
      label = 'persons';
    }
    else if (self.$coupleId) {
      template = self.id ? 'couple-relationship-note-template' : 'couple-relationship-notes-template';
      label = 'relationships';
    }
    else if (self.$childAndParentsId) {
      template = self.id ? 'child-and-parents-relationship-note-template' : 'child-and-parents-relationship-notes-template';
      label = 'childAndParentsRelationships';
      headers['Content-Type'] = 'application/x-fs-v1+json';
    }
    var promise = self.$helpers.chainHttpPromises(
      self.$plumbing.getUrl(template, null, {pid: self.$personId, crid: self.$coupleId, caprid: self.$childAndParentsId, nid: self.id}),
      function(url) {
        var payload = {};
        payload[label] = [ { notes: [ self ] } ];
        if (changeMessage) {
          payload[label][0].attribution = self.$client.createAttribution(changeMessage);
        }
        return self.$plumbing.post(url, payload, headers, opts, function(data, promise) {
          // x-entity-id and location headers are not set on update, only on create
          return {
            id: self.id || promise.getResponseHeader('X-ENTITY-ID'),
            location: self.$getNoteUrl() || self.$helpers.removeAccessToken(promise.getResponseHeader('Location'))
          };
        });
      });
    var returnedPromise = promise.then(function(idLocation) {
      self.$helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
      if (refresh) {
        // re-read the note and set this object's properties from response
        // we use getPersonNote here to read couple and child-and-parents notes also
        // it's ok to do this since we pass in the full url
        return self.$client.getPersonNote(idLocation.location, null, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getNote());
          return idLocation.id;
        });
      }
      else {
        return idLocation.id;
      }
    });
    return returnedPromise;
  },

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#$delete
   * @methodOf notes.types:constructor.Note
   * @function
   * @description delete this note
   * or {@link notes.functions:deleteCoupleNote deleteCoupleNote}
   * or {@link notes.functions:deleteChildAndParentsNote deleteChildAndParentsNote}
   * @param {string=} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the note URL
   */
  $delete: function(changeMessage, opts) {
    if (this.$personId) {
      return this.$client.deletePersonNote(this.$getNoteUrl() || this.$personId, this.id, changeMessage, opts);
    }
    else if (this.$coupleId) {
      return this.$client.deleteCoupleNote(this.$getNoteUrl() || this.$coupleId, this.id, changeMessage, opts);
    }
    else {
      return this.$client.deleteChildAndParentsNote(this.$getNoteUrl() || this.$childAndParentsId, this.id, changeMessage, opts);
    }
  }

};
},{"./../FamilySearch":1,"./../utils":48}],21:[function(require,module,exports){
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
 * Two methods to note below are _$save_ and _$delete_.
 * _$save_ persists the changes made to names, facts, and gender;
 * _$delete_ removes the person.
 *
 * @param {Object=} data an object with optional attributes {$gender, names, facts}.
 * _$gender_ is a string.
 * _names_ is an array of Name's, or Objects or strings to pass into the Name constructor.
 * _facts_ is an array of Fact's or Objects to pass into the Fact constructor.
 */
var Person = FS.Person = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.$gender) {
      //noinspection JSUnresolvedFunction
      this.$setGender(data.$gender);
      delete this.$gender;
    }
    if (data.names) {
      //noinspection JSUnresolvedFunction
      utils.forEach(this.names, function(name, i){
        if(!(name instanceof FS.Name)){
          this.names[i] = client.createName(name);
        }
      }, this);
    }
    if (data.facts) {
      //noinspection JSUnresolvedFunction
      utils.forEach(this.facts, function(fact, i){
        if(!(fact instanceof FS.Fact)){
          this.facts[i] = client.createFact(fact);
        }
      }, this);
    }
    if (data.attribution && !(data.attribution instanceof FS.Attribution)) {
      this.attribution = client.createAttribution(data.attribution);
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

Person.prototype = {
  constructor: Person,
  /**
   * @ngdoc property
   * @name person.types:constructor.Person#id
   * @propertyOf person.types:constructor.Person
   * @return {String} Id of the person
   */

  /**
   * @ngdoc property
   * @name person.types:constructor.Person#living
   * @propertyOf person.types:constructor.Person
   * @return {Boolean} true or false
   */

  /**
   * @ngdoc property
   * @name person.types:constructor.Person#display
   * @propertyOf person.types:constructor.Person
   * @return {Object} includes `birthDate`, `birthPlace`, `deathDate`, `deathPlace`, `gender`, `lifespan`, and `name` attributes
   */

  /**
   * @ngdoc property
   * @name person.types:constructor.Person#identifers
   * @propertyOf person.types:constructor.Person
   * @return {Object} map of identifers to arrays of values
   */

  /**
   * @ngdoc property
   * @name person.types:constructor.Person#gender
   * @propertyOf person.types:constructor.Person
   * @return {Object} gender conclusion with id, type (value), and attribution
   */

  /**
   * @ngdoc property
   * @name person.types:constructor.Person#attribution
   * @propertyOf person.types:constructor.Person
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$isReadOnly
   * @methodOf person.types:constructor.Person
   * @description
   * This function is available only if the person is read with `getPerson` or `getPersonWithRelationships`.
   * @returns {Boolean} true if the person is read-only
   */
  // this function is added in the getPerson() function below

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getFacts
   * @methodOf person.types:constructor.Person
   * @function
   * @param {string=} type if present, return only facts with this type
   * @return {Fact[]} an array of {@link fact.types:constructor.Fact Facts}
   */
  $getFacts: function(type) {
    return (type ? utils.filter(this.facts, {type: type}) : this.facts) || [];
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getFact
   * @methodOf person.types:constructor.Person
   * @function
   * @param {string} type fact type; e.g., http://gedcomx.org/Birth
   * @return {Fact} return first {@link fact.types:constructor.Fact Fact} having specified type
   */
  $getFact: function(type) {
    return utils.find(this.facts, {type: type});
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getBirth
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Fact} Birth {@link fact.types:constructor.Fact Fact}
   */
  $getBirth: function() {
    return this.$getFact('http://gedcomx.org/Birth');
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getBirthDate
   * @methodOf person.types:constructor.Person
   * @function
   * @return {string} Birth date
   */
  $getBirthDate: function() {
    var fact = this.$getBirth();
    return fact ? fact.$getDate() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getBirthPlace
   * @methodOf person.types:constructor.Person
   * @function
   * @return {string} Birth place
   */
  $getBirthPlace: function() {
    var fact = this.$getBirth();
    return fact ? fact.$getPlace() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getChristening
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Fact} Christening {@link fact.types:constructor.Fact Fact}
   */
  $getChristening: function() {
    return this.$getFact('http://gedcomx.org/Christening');
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getChristeningDate
   * @methodOf person.types:constructor.Person
   * @function
   * @return {string} Christening date
   */
  $getChristeningDate: function() {
    var fact = this.$getChristening();
    return fact ? fact.$getDate() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getChristeningPlace
   * @methodOf person.types:constructor.Person
   * @function
   * @return {string} Christning place
   */
  $getChristeningPlace: function() {
    var fact = this.$getChristening();
    return fact ? fact.$getPlace() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDeath
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Fact} Death {@link fact.types:constructor.Fact Fact}
   */
  $getDeath: function() {
    return this.$getFact('http://gedcomx.org/Death');
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDeathDate
   * @methodOf person.types:constructor.Person
   * @function
   * @return {string} Death date
   */
  $getDeathDate: function() {
    var fact = this.$getDeath();
    return fact ? fact.$getDate() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDeathPlace
   * @methodOf person.types:constructor.Person
   * @function
   * @return {string} Death place
   */
  $getDeathPlace: function() {
    var fact = this.$getDeath();
    return fact ? fact.$getPlace() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getBurial
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Fact} Burial {@link fact.types:constructor.Fact Fact}
   */
  $getBurial: function() {
    return this.$getFact('http://gedcomx.org/Burial');
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getBurialDate
   * @methodOf person.types:constructor.Person
   * @function
   * @return {string} Burial date
   */
  $getBurialDate: function() {
    var fact = this.$getBurial();
    return fact ? fact.$getDate() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getBurialPlace
   * @methodOf person.types:constructor.Person
   * @function
   * @return {string} Birth place
   */
  $getBurialPlace: function() {
    var fact = this.$getBurial();
    return fact ? fact.$getPlace() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDisplayBirthDate
   * @methodOf person.types:constructor.Person
   * @function
   * @return {String} birth date
   */
  $getDisplayBirthDate: function() { return maybe(this.display).birthDate; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDisplayBirthPlace
   * @methodOf person.types:constructor.Person
   * @function
   * @return {String} birth place
   */
  $getDisplayBirthPlace: function() { return maybe(this.display).birthPlace; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDisplayDeathDate
   * @methodOf person.types:constructor.Person
   * @function
   * @return {String} death date
   */
  $getDisplayDeathDate: function() { return maybe(this.display).deathDate; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDisplayDeathPlace
   * @methodOf person.types:constructor.Person
   * @function
   * @return {String} death place
   */
  $getDisplayDeathPlace: function() { return maybe(this.display).deathPlace; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDisplayGender
   * @methodOf person.types:constructor.Person
   * @function
   * @return {String} gender - Male or Female
   */
  $getDisplayGender: function() { return maybe(this.display).gender; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDisplayLifeSpan
   * @methodOf person.types:constructor.Person
   * @function
   * @returns {string} birth year - death year
   */
  $getDisplayLifeSpan: function() { return maybe(this.display).lifespan; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDisplayName
   * @methodOf person.types:constructor.Person
   * @function
   * @return {string} display name
   */
  $getDisplayName: function() { return maybe(this.display).name; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getNames
   * @methodOf person.types:constructor.Person
   * @function
   * @param {string=} type if present, return only names with this type
   * @return {Name[]} an array of {@link name.types:constructor.Name Names}
   */
  $getNames: function(type) {
    return (type ? utils.filter(this.names, {type: type}) : this.names) || [];
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getPreferredName
   * @methodOf person.types:constructor.Person
   * @function
   * @return {string} preferred {@link name.types:constructor.Name Name}
   */
  $getPreferredName: function() { return utils.findOrFirst(this.names, {preferred: true}); },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getGivenName
   * @methodOf person.types:constructor.Person
   * @function
   * @return {String} preferred given name
   */
  $getGivenName: function() {
    var name = this.$getPreferredName();
    if (name) {
      name = name.$getGivenName();
    }
    return name;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getSurname
   * @methodOf person.types:constructor.Person
   * @function
   * @return {String} preferred surname
   */
  $getSurname: function() {
    var name = this.$getPreferredName();
    if (name) {
      name = name.$getSurname();
    }
    return name;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getPersistentIdentifier
   * @methodOf person.types:constructor.Person
   * @function
   * @return {String} persistent identifier
   */
  $getPersistentIdentifier: function() { return maybe(maybe(this.identifiers)['http://gedcomx.org/Persistent'])[0]; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getPersonUrl
   * @methodOf person.types:constructor.Person
   * @function
   * @return {String} Url of the person
   */
  $getPersonUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).person).href); },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getChanges
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Object=} params `count` is the number of change entries to return, `from` to return changes following this id
   * @return {Object} promise for the {@link changeHistory.functions:getPersonChanges getPersonChanges} response
   */
  $getChanges: function(params) {
    return this.$client.getPersonChanges(this.$helpers.removeAccessToken(this.links['change-history'].href), params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDiscussionRefs
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link discussions.functions:getPersonDiscussionRefs getPersonDiscussionRefs} response
   */
  $getDiscussionRefs: function() {
    return this.$client.getPersonDiscussionRefs(this.$helpers.removeAccessToken(this.links['discussion-references'].href));
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getMemoryPersonaRefs
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link memories.functions:getMemoryPersonaRefs getMemoryPersonaRefs} response
   */
  $getMemoryPersonaRefs: function() {
    return this.$client.getMemoryPersonaRefs(this.$helpers.removeAccessToken(this.links['evidence-references'].href));
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getNotes
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link notes.functions:getPersonNotes getPersonNotes} response
   */
  $getNotes: function() {
    return this.$client.getPersonNotes(this.$helpers.removeAccessToken(this.links['notes'].href));
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getSourceRefs
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link sources.functions:getPersonSourceRefs getPersonSourceRefs} response
   */
  $getSourceRefs: function() {
    return this.$client.getPersonSourceRefs(this.id);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getSources
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link sources.functions:getPersonSourcesQuery getPersonSourcesQuery} response
   */
  $getSources: function() {
    return this.$client.getPersonSourcesQuery(this.id);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getSpouses
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link person.functions:getSpouses getSpouses} response
   */
  $getSpouses: function() {
    return this.$client.getSpouses(this.id);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getParents
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link person.functions:getParents getParents} response
   */
  $getParents: function() {
    return this.$client.getParents(this.id);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getChildren
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link person.functions:getChildren getChildren} response
   */
  $getChildren: function() {
    return this.$client.getChildren(this.id);
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getMatches
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link searchAndMatch.functions:getPersonMatches getPersonMatches} response
   */
  $getMatches: function() {
    return this.$client.getPersonMatches(this.id);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getAncestry
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Object=} params includes `generations` to retrieve max 8, `spouse` id to get ancestry of person and spouse,
   * `personDetails` set to true to retrieve full person objects for each ancestor
   * @return {Object} promise for the {@link pedigree.functions:getAncestry getAncestry} response
   */
  $getAncestry: function(params) {
    return this.$client.getAncestry(this.id, params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDescendancy
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Object=} params includes `generations` to retrieve max 2, `spouse` id to get descendency of person and spouse
   * @return {Object} promise for the {@link pedigree.functions:getDescendancy getDescendancy} response
   */
  $getDescendancy: function(params) {
    return this.$client.getDescendancy(this.id, params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getPersonPortraitUrl
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Object=} params `default` URL to redirect to if portrait doesn't exist;
   * `followRedirect` if true, follow the redirect and return the final URL
   * @return {Object} promise for the {@link memories.functions:getPersonPortraitUrl getPersonPortraitUrl} response
   */
  $getPersonPortraitUrl: function(params) {
    return this.$client.getPersonPortraitUrl(this.id, params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$setNames
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Name[]|Object[]|string[]} values names to set; if an array element is not a Name, it is passed into the Name constructor
   * @param {string=} changeMessage change message to use for deleted names if any
   * @return {Person} this person
   */
  $setNames: function(values, changeMessage) {
    if (utils.isArray(this.names)) {
      utils.forEach(this.names, function(name) {
        this.$deleteName(name, changeMessage);
      }, this);
    }
    this.names = [];
    utils.forEach(values, function(value) {
      this.$addName(value);
    }, this);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$addName
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Name|Object|string} value name to add; if value is not a Name, it is passed into the Name constructor
   * @return {Person} this person
   */
  $addName: function(value) {
    if (!utils.isArray(this.names)) {
      this.names = [];
    }
    if (!(value instanceof FS.Name)) {
      value = this.$client.createName(value);
    }
    this.names.push(value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$deleteName
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Name|string} value name or name id to remove
   * @param {String=} changeMessage change message
   * @return {Person} this person
   */
  $deleteName: function(value, changeMessage) {
    if (!(value instanceof FS.Name)) {
      value = utils.find(this.names, { id: value });
    }
    var pos = utils.indexOf(this.names, value);
    if (pos >= 0) {
      // add name to $deleted map
      if (!this.$deletedConclusions) {
        this.$deletedConclusions = {};
      }
      this.$deletedConclusions[value.id] = changeMessage;
      // remove name from array
      this.names.splice(pos,1);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$setFacts
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Fact[]|Object[]} values facts to set; if an array element is not a Fact, it is passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {Person} this person
   */
  $setFacts: function(values, changeMessage) {
    if (utils.isArray(this.facts)) {
      utils.forEach(this.facts, function(fact) {
        this.$deleteFact(fact, changeMessage);
      }, this);
    }
    this.facts = [];
    utils.forEach(values, function(value) {
      this.$addFact(value);
    }, this);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$addFact
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {Person} this person
   */
  $addFact: function(value) {
    if (!utils.isArray(this.facts)) {
      this.facts = [];
    }
    if (!(value instanceof FS.Fact)) {
      value = this.$client.createFact(value);
    }
    this.facts.push(value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$deleteFact
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {Person} this person
   */
  $deleteFact: function(value, changeMessage) {
    if (!(value instanceof FS.Fact)) {
      value = utils.find(this.facts, { id: value });
    }
    var pos = utils.indexOf(this.facts, value);
    if (pos >= 0) {
      // add fact to $deleted map
      if (!this.$deletedConclusions) {
        this.$deletedConclusions = {};
      }
      this.$deletedConclusions[value.id] = changeMessage;
      // remove fact from array
      this.facts.splice(pos,1);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$setGender
   * @methodOf person.types:constructor.Person
   * @function
   * @param {String} gender e.g., http://gedcomx.org/Female
   * @param {String=} changeMessage change message
   * @return {Person} this person
   */
  $setGender: function(gender, changeMessage) {
    if (!this.gender) {
      this.gender = {};
    }
    this.gender.$changed = true;
    this.gender.type = gender;
    if (changeMessage) {
      this.gender.attribution = this.$client.createAttribution(changeMessage);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$save
   * @methodOf person.types:constructor.Person
   * @function
   * @description
   * Create a new person (if this person does not have an id) or update the existing person
   *
   * {@link http://jsfiddle.net/v4840hjt/ editable example}
   *
   * @param {String=} changeMessage default change message to use when name/fact/gender-specific changeMessage is not specified
   * @param {boolean=} refresh true to read the person after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the person id, which is fulfilled after person has been updated,
   * and if refresh is true, after the person has been read
   */
  $save: function(changeMessage, refresh, opts) {
    var postData = this.$client.createPerson();
    var isChanged = false;
    if (this.id) {
      postData.id = this.id; // updating existing person
    }

    // if person is new, default a few things
    if (!this.id) {
      // default gender to unknown
      if (!this.gender) {
        this.$setGender('http://gedcomx.org/Unknown');
      }
      // default name to Unknown if no names
      if (!utils.isArray(this.names) || this.names.length === 0) {
        this.$addName({$fullText: 'Unknown', $givenName: 'Unknown'});
      }
      // default first name to preferred if no names are preferred
      if (!utils.find(this.names, {preferred: true})) {
        this.names[0].$setPreferred(true);
      }
      // default name type to birth name if there is only one name
      if (this.names.length === 1 && !this.names[0].type) {
        this.names[0].$setType('http://gedcomx.org/BirthName');
      }
      // default living status to false
      if (utils.isUndefined(this.living)) {
        this.living = false;
      }
    }

    // set global changeMessage
    if (changeMessage) {
      postData.attribution = this.$client.createAttribution(changeMessage);
    }
    
    // if new person, send living status
    if (!this.id) {
      postData.living = this.living;
    }

    // send gender if gender is new or changed
    if (this.gender && (!this.gender.id || this.gender.$changed)) {
      postData.gender = this.gender;
      isChanged = true;
    }

    // send names that are new or updated
    utils.forEach(this.names, function(name) {
      if (!name.id || name.$changed) {
        // default full text if not set
        if (!name.$getFullText()) {
          name.$setFullText((spacePrefix(name.$getPrefix()) + spacePrefix(name.$getGivenName()) +
                             spacePrefix(name.$getSurname()) + spacePrefix(name.$getSuffix())).trim());
        }
        postData.$addName(name);
        isChanged = true;
      }
    });

    // send facts that are new or updated
    utils.forEach(this.facts, function(fact) {
      if (!fact.id || fact.$changed) {
        postData.$addFact(fact);
        isChanged = true;
      }
    });

    var promises = [],
        self = this;

    // post update
    if (isChanged) {
      promises.push(self.$helpers.chainHttpPromises(
        postData.id ? self.$plumbing.getUrl('person-template', null, {pid: postData.id}) : self.$plumbing.getUrl('persons'),
        function(url) {
          return self.$plumbing.post(url, { persons: [ postData ] }, {}, opts, self.$helpers.getResponseEntityId);
        }));
    }

    // post deletions
    if (this.id && this.$deletedConclusions) {
      utils.forEach(this.$deletedConclusions, function(value, key) {
        value = value || changeMessage; // default to global change message
        promises.push(self.$helpers.chainHttpPromises(
          self.$plumbing.getUrl('person-conclusion-template', null, {pid: postData.id, cid: key}),
          function(url) {
            return self.$plumbing.del(url, value ? {'X-Reason': value} : {}, opts);
          }
        ));
      });
    }

    var person = this;
    // wait for all promises to be fulfilled
    var promise = self.$helpers.promiseAll(promises).then(function(results) {
      var id = postData.id ? postData.id : results[0]; // if we're adding a new person, get id from the first (only) promise
      self.$helpers.extendHttpPromise(promise, promises[0]); // extend the first promise into the returned promise

      if (refresh) {
        // re-read the person and set this object's properties from response
        return self.$client.getPerson(id, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(person, utils.appFieldRejector);
          utils.extend(person, response.getPerson());
          return id;
        });
      }
      else {
        return id;
      }
    });
    return promise;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$delete
   * @methodOf person.types:constructor.Person
   * @function
   * @description delete this person - see {@link person.functions:deletePerson deletePerson}
   * @param {string} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person URL
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deletePerson(this.$getPersonUrl() || this.id, changeMessage, opts);
  }
};
},{"../FamilySearch":1,"../utils":48}],22:[function(require,module,exports){
var FS = require('./../FamilySearch');

/**
 * @ngdoc function
 * @name authorities.types:constructor.Place
 * @description
 *
 * Standardized place
 */
var Place = FS.Place = function(client, data){ 
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name authorities.functions:createPlace
 * @param {Object} data [PlaceReference](https://familysearch.org/developers/docs/api/gx/PlaceReference_json) data
 * @return {Object} {@link authorities.types:constructor.Place Place}
 * @description Create a {@link authorities.types:constructor.Place Place} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createPlace = function(data){
  return new Place(this, data);
};

Place.prototype = {
  constructor: Place,

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#official
   * @propertyOf authorities.types:constructor.Place
   * @return {string} normalized place name; e.g., Minnesota
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#normalized
   * @propertyOf authorities.types:constructor.Place
   * @return {string[]} array of fully-normalized place names; e.g., ["Minnesota, United States"]
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#original
   * @propertyOf authorities.types:constructor.Place
   * @return {string} original place to standardize
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#id
   * @propertyOf authorities.types:constructor.Place
   * @return {string} place id
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#requestedId
   * @propertyOf authorities.types:constructor.Place
   * @return {string} no idea
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#type
   * @propertyOf authorities.types:constructor.Place
   * @return {string} type of the place; e.g., First-Order Administrative Division
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#culture
   * @propertyOf authorities.types:constructor.Place
   * @return {string} id of the culture
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#iso
   * @propertyOf authorities.types:constructor.Place
   * @return {string} ISO place id; e.g., US-MN
   */

  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#$getNormalizedPlace
   * @methodOf authorities.types:constructor.Place
   * @function
   * @return {string} convenience function to return the first element of the normalized array
   */
  $getNormalizedPlace: function() {
    return this.normalized ? this.normalized[0] : undefined;
  }
};
},{"./../FamilySearch":1}],23:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name searchAndMatch.types:constructor.SearchResult
 * @description
 *
 * Reference from a person or relationship to a source
 */
var SearchResult = FS.SearchResult = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  utils.forEach(maybe(maybe(maybe(data).content).gedcomx).persons, function(person, index, obj){
    obj[index] = client.createPerson(person);
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

SearchResult.prototype = {
  constructor: SearchResult,
  /**
   * @ngdoc property
   * @name searchAndMatch.types:constructor.SearchResult#id
   * @propertyOf searchAndMatch.types:constructor.SearchResult
   * @return {String} Id of the person for this search result
   */

  /**
   * @ngdoc property
   * @name searchAndMatch.types:constructor.SearchResult#title
   * @propertyOf searchAndMatch.types:constructor.SearchResult
   * @return {String} Id and name
   */

  /**
   * @ngdoc property
   * @name searchAndMatch.types:constructor.SearchResult#score
   * @propertyOf searchAndMatch.types:constructor.SearchResult
   * @return {Number} higher is better
   */

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getPerson
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @description
   *
   * **Note: Be aware that the `Person` objects returned from SearchResults do not have as much information
   * as `Person` objects returned from the various person and pedigree functions.**
   *
   * @param {string} pid id of the person
   * @return {Person} the {@link person.types:constructor.Person Person} for this Id in this search result
   */
  $getPerson: function(pid) {
    return utils.find(maybe(maybe(this.content).gedcomx).persons, {id: pid});
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getPrimaryPerson
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {Person} the primary {@link person.types:constructor.Person Person} for this search result
   */
  $getPrimaryPerson: function() {
    return this.$getPerson(this.id);
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getFullPrimaryPerson
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  $getFullPrimaryPerson: function() { return this.$client.getPerson(this.id); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getFatherIds
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {String[]} array of father Id's for this search result
   */
  $getFatherIds: function() {
    var primaryId = this.id, self = this;
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person2.resourceId === primaryId &&
          r.person1 &&
          maybe(self.$getPerson(r.person1.resourceId).gender).type === 'http://gedcomx.org/Male';
      }),
      function(r) { return r.person1.resourceId; }
    ));
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getFathers
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {Person[]} array of father {@link person.types:constructor.Person Persons} for this search result
   */
  $getFathers: function() { return utils.map(this.$getFatherIds(), this.$getPerson, this); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getMotherIds
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {String[]} array of mother Id's for this search result
   */
  $getMotherIds: function() {
    var primaryId = this.id, self = this;
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person2.resourceId === primaryId &&
          r.person1 &&
          maybe(self.$getPerson(r.person1.resourceId).gender).type !== 'http://gedcomx.org/Male';
      }),
      function(r) { return r.person1.resourceId; }
    ));
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getMothers
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {Person[]} array of mother {@link person.types:constructor.Person Persons} for this search result
   */
  $getMothers: function() { return utils.map(this.$getMotherIds(), this.$getPerson, this); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getSpouseIds
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {String[]} array of spouse Id's for this search result
   */
  $getSpouseIds:  function() {
    var primaryId = this.id;
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/Couple' &&
          (r.person1.resourceId === primaryId || r.person2.resourceId === primaryId);
      }),
      function(r) { return r.person1.resourceId === primaryId ? r.person2.resourceId : r.person1.resourceId; }
    ));
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getSpouses
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {Person[]} array of spouse {@link person.types:constructor.Person Persons} for this search result
   */
  $getSpouses: function() { return utils.map(this.$getSpouseIds(), this.$getPerson, this); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getChildIds
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {String[]} array of child Id's for this search result
   */
  $getChildIds:  function() {
    var primaryId = this.id;
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person1.resourceId === primaryId &&
          r.person2;
      }),
      function(r) { return r.person2.resourceId; }
    ));
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getChildren
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {Person[]} array of spouse {@link person.types:constructor.Person Persons} for this search result
   */
  $getChildren: function() { return utils.map(this.$getChildIds(), this.$getPerson, this); }
};
},{"./../FamilySearch":1,"./../utils":48}],24:[function(require,module,exports){
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
 * @param {Object=} data an object with optional attributes {about, $citation, $title, $text}.
 * _about_ is a URL (link to the record) it can be a memory URL.
 */
var SourceDescription = FS.SourceDescription = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.$citation) {
      //noinspection JSUnresolvedFunction
      this.$setCitation(data.$citation);
    }
    if (data.$title) {
      //noinspection JSUnresolvedFunction
      this.$setTitle(data.$title);
    }
    if (data.$text) {
      //noinspection JSUnresolvedFunction
      this.$setText(data.$text);
    }
    if (data.attribution && !(data.attribution instanceof FS.Attribution)) {
      this.attribution = client.createAttribution(data.attribution);
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

SourceDescription.prototype = {
  constructor: SourceDescription,
  /**
   * @ngdoc property
   * @name sources.types:constructor.SourceDescription#id
   * @propertyOf sources.types:constructor.SourceDescription
   * @return {String} Id of the source description
   */

  /**
   * @ngdoc property
   * @name sources.types:constructor.SourceDescription#about
   * @propertyOf sources.types:constructor.SourceDescription
   * @return {String} URL (link to the record)
   */

  /**
   * @ngdoc property
   * @name sources.types:constructor.SourceDescription#attribution
   * @propertyOf sources.types:constructor.SourceDescription
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#$getCitation
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @return {String} source citation
   */
  $getCitation: function() { return maybe(maybe(this.citations)[0]).value; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#$getTitle
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @return {String} title of the source description
   */
  $getTitle: function() { return maybe(maybe(this.titles)[0]).value; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#$getText
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @return {String} Text / Description of the source
   */
  $getText: function() { return maybe(maybe(this.notes)[0]).text; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#$getSourceDescriptionUrl
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @return {String} Url of the of this source description
   */
  $getSourceDescriptionUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).description).href); },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#$getSourceRefsQuery
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @return {Object} promise for the {@link sources.functions:getSourceRefsQuery getSourceRefsQuery} response
   */
  $getSourceRefsQuery: function() {
    return this.$client.getSourceRefsQuery(this.id);
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#$setCitation
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @param {String} citation source description citation
   * @return {SourceDescription} this source description
   */
  $setCitation: function(citation) {
    this.citations = [ { value: citation } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#$setTitle
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @param {String} title source description title
   * @return {SourceDescription} this source description
   */
  $setTitle: function(title) {
    this.titles = [ { value: title } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#$setText
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @param {String} text source description text
   * @return {SourceDescription} this source description
   */
  $setText: function(text) {
    this.notes = [ { text: text } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#$save
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @description
   * Create a new source description (if this source description does not have an id) or update the existing source description
   *
   * {@link http://jsfiddle.net/mtets2sf/ editable example}
   *
   * @param {string=} changeMessage change message
   * @param {boolean=} refresh true to read the source description after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the source description id, which is fulfilled after the source description has been updated,
   * and if refresh is true, after the source description has been read.
   */
  $save: function(changeMessage, refresh, opts) {
    var self = this;
    if (changeMessage) {
      self.attribution = self.$client.createAttribution(changeMessage);
    }
    var promise = self.$helpers.chainHttpPromises(
      self.id ? self.$plumbing.getUrl('source-description-template', null, {sdid: self.id}) : self.$plumbing.getUrl('source-descriptions'),
      function(url) {
        return self.$plumbing.post(url, { sourceDescriptions: [ self ] }, {}, opts, function(data, promise) {
          // x-entity-id and location headers are not set on update, only on create
          return self.id || promise.getResponseHeader('X-ENTITY-ID');
        });
      });
    var returnedPromise = promise.then(function(sdid) {
      self.$helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
      if (refresh) {
        // re-read the SourceDescription and set this object's properties from response
        return self.$client.getSourceDescription(sdid, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getSourceDescription());
          return sdid;
        });
      }
      else {
        return sdid;
      }
    });
    return returnedPromise;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#$delete
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @description delete this source description as well as all source references that refer to this source description
   * - see {@link sources.functions:deleteSourceDescription deleteSourceDescription}
   *
   * @param {string} changeMessage reason for the deletion
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the source description id
   */
  $delete: function(changeMessage, opts) {
    // must use the id, not the full url, here
    return this.$client.deleteSourceDescription(this.id, changeMessage, opts);
  }

};
},{"./../FamilySearch":1,"./../utils":48}],25:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name sources.types:constructor.SourceRef
 * @description
 * Reference from a person or relationship to a source.
 * To create a new SourceRef you must set sourceDescription and either $personId, $coupleId, or $childAndParentsId
 *
 * FamilySearch API Docs:
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource Person SourceRef},
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_References_resource Couple SourceRef}, and
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource ChildAndParents SourceRef}
 *
 * @param {Object=} data an object with optional attributes {$personId, $coupleId, $childAndParentsId, $sourceDescription, $tags}.
 * _$sourceDescription_ can be a {@link sources.types:constructor.SourceDescription SourceDescription},
 * a source description id, or a source description URL.
 * _$tags_ is an array (string[]) of tag names
 */
var SourceRef = FS.SourceRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    this.$personId = data.$personId;
    this.$coupleId = data.$coupleId;
    this.$childAndParentsId = data.$childAndParentsId;
    if (data.$sourceDescription) {
      //noinspection JSUnresolvedFunction
      this.$setSourceDescription(data.$sourceDescription);
    }
    if (data.$tags) {
      //noinspection JSUnresolvedFunction
      this.$setTags(data.$tags);
    }
    if (data.attribution && !(data.attribution instanceof FS.Attribution)) {
      this.attribution = client.createAttribution(data.attribution);
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

SourceRef.prototype = {
  constructor: SourceRef,
  /**
   * @ngdoc property
   * @name sources.types:constructor.SourceRef#id
   * @propertyOf sources.types:constructor.SourceRef
   * @return {string} Id of the source reference
   */

  /**
   * @ngdoc property
   * @name sources.types:constructor.SourceRef#attribution
   * @propertyOf sources.types:constructor.SourceRef
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc property
   * @name sources.types:constructor.SourceRef#$personId
   * @propertyOf sources.types:constructor.SourceRef
   * @return {String} Id of the person to which this source is attached if it is attached to a person
   */

  /**
   * @ngdoc property
   * @name sources.types:constructor.SourceRef#$childAndParentsId
   * @propertyOf sources.types:constructor.SourceRef
   * @return {String} Id of the child and parents relationship to which this source is attached if it is attached to child and parents
   */

  /**
   * @ngdoc property
   * @name sources.types:constructor.SourceRef#$coupleId
   * @propertyOf sources.types:constructor.SourceRef
   * @return {String} Id of the couple relationship to which this source is attached if it is attached to a couple
   */

  /**
   * @ngdoc property
   * @name sources.types:constructor.SourceRef#$sourceDescriptionId
   * @propertyOf sources.types:constructor.SourceRef
   * @return {string} Id of the source description
   */

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$getSourceRefUrl
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @return {string} URL of this source reference - _NOTE_ however that you cannot read individual source references
   */
  $getSourceRefUrl: function() {
    return this.$helpers.removeAccessToken(maybe(maybe(this.links)['source-reference']).href);
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$getSourceDescriptionUrl
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @return {string} URL of the source description - pass into {@link sources.functions:getSourceDescription getSourceDescription} for details
   */
  $getSourceDescriptionUrl: function() {
    return this.$helpers.removeAccessToken(this.description);
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$getSourceDescription
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @return {Object} promise for the {@link sources.functions:getSourceDescription getSourceDescription} response
   */
  $getSourceDescription: function() {
    return this.$client.getSourceDescription(this.$getSourceDescriptionUrl());
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$getTags
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @return {string[]} an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
   */
  $getTags: function() { 
    return utils.map(this.tags, function(tag) {
      return tag.resource;
    });
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$setSourceDescription
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @param {SourceDescription|string} srcDesc SourceDescription object, or id or URL of the source description
   * @return {SourceRef} this source reference
   */
  $setSourceDescription: function(srcDesc) {
    if (srcDesc instanceof FS.SourceDescription) {
      this.$sourceDescriptionId = srcDesc.id;
      this.description = srcDesc.$getSourceDescriptionUrl();
    }
    else if (this.$helpers.isAbsoluteUrl(srcDesc)) {
      delete this.$sourceDescriptionId;
      this.description = this.$sourceDescriptionUrl;
    }
    else {
      this.$sourceDescriptionId = srcDesc;
      delete this.description;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$setTags
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @param {string[]} tags an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
   * @return {SourceRef} this source reference
   */
  $setTags: function(tags) {
    this.tags = utils.map(tags, function(tag) {
      return {resource: tag};
    });
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$addTag
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @param {string} tag tag to add
   * @return {SourceRef} this source reference
   */
  $addTag: function(tag) {
    if (!utils.isArray(this.tags)) {
      this.tags = [];
    }
    this.tags.push({resource: tag});
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$removeTag
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @param {string} tag tag to remove
   * @return {SourceRef} this source reference
   */
  $removeTag: function(tag) {
    tag = utils.find(this.tags, {resource: tag});
    if (tag) {
      this.tags.splice(utils.indexOf(this.tags, tag), 1);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$save
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @description
   * Create a new source reference (if this source reference does not have an id) or update the existing source reference
   *
   * _NOTE_: there's no _refresh_ parameter because it's not possible to read individual source references;
   * however, the source reference's id and URL are set when creating a new source reference.
   *
   * _NOTE_: the person/couple/childAndParents id and the source description are not updateable.
   * Only the tags are updateable.
   *
   * {@link http://jsfiddle.net/sqsejsjq/ editable example}
   *
   * @param {string} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the source reference id, which is fulfilled after the source reference has been updated
   */
  $save: function(changeMessage, opts) {
    var self = this;
    if (changeMessage) {
      self.attribution = self.$client.createAttribution(changeMessage);
    }
    var template, label;
    var headers = {};
    if (self.$personId) {
      template = 'person-source-references-template';
      label = 'persons';
    }
    else if (self.$coupleId) {
      template = 'couple-relationship-source-references-template';
      label = 'relationships';
    }
    else if (self.$childAndParentsId) {
      template = 'child-and-parents-relationship-source-references-template';
      template = 'child-and-parents-relationship-source-references-template';
      label = 'childAndParentsRelationships';
      headers['Content-Type'] = 'application/x-fs-v1+json';
    }
    return self.$helpers.chainHttpPromises(
      self.$plumbing.getUrl(template, null, {pid: self.$personId, crid: self.$coupleId, caprid: self.$childAndParentsId, srid: self.id}),
      function(url) {
        if (!self.description && !!self.$sourceDescriptionId) {
          // the discovery resource is guaranteed to be set due to the getUrl statement
          self.description = self.$helpers.getUrlFromDiscoveryResource(self.$client.settings.discoveryResource, 'source-description-template',
                                                                 {sdid: self.$sourceDescriptionId});
        }
        self.description = self.$helpers.removeAccessToken(self.description);
        var payload = {};
        payload[label] = [ { sources: [ self ] } ];
        return self.$plumbing.post(url, payload, headers, opts, function(data, promise) {
          // x-entity-id and location headers are not set on update, only on create
          if (!self.id) {
            self.id = promise.getResponseHeader('X-ENTITY-ID');
          }
          if (!self.$getSourceRefUrl()) {
            self.links = { 'source-reference' : { href: self.$helpers.removeAccessToken(promise.getResponseHeader('Location')) } };
          }
          return self.id;
        });
      });
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$delete
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @description delete this source reference
   * - see {@link sources.functions:deletePersonSourceRef deletePersonSourceRef},
   * {@link sources.functions:deleteCoupleSourceRef deleteCoupleSourceRef}, or
   * {@link sources.functions:deleteChildAndParentsSourceRef deleteChildAndParentsSourceRef}
   *
   * @param {string} changeMessage reason for the deletion
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the source reference URL
   */
  $delete: function(changeMessage, opts) {
    if (this.$personId) {
      return this.$client.deletePersonSourceRef(this.$getSourceRefUrl() || this.$personID, this.id, changeMessage, opts);
    }
    else if (this.$coupleId) {
      return this.$client.deleteCoupleSourceRef(this.$getSourceRefUrl() || this.$coupleId, this.id, changeMessage, opts);
    }
    else {
      return this.$client.deleteChildAndParentsSourceRef(this.$getSourceRefUrl() || this.$childAndParentsId, this.id, changeMessage, opts);
    }
  }

};
},{"./../FamilySearch":1,"./../utils":48}],26:[function(require,module,exports){
var FS = require('../FamilySearch');

/**
 * @ngdoc function
 * @name user.types:constructor.User
 * @description
 *
 * User - a user is returned from {@link user.functions:getCurrentUser getCurrentUser};
 * Contributor Ids are agent ids, not user ids.
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

User.prototype = {
  constructor: User
  /**
   * @ngdoc property
   * @name user.types:constructor.User#id
   * @propertyOf user.types:constructor.User
   * @return {String} Id of the user
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#personId
   * @propertyOf user.types:constructor.User
   * @return {String} id of the {@link person.types:constructor.Person Person} for this user
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#treeUserId
   * @propertyOf user.types:constructor.User
   * @return {String} agent (contributor) id of the user
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#contactName
   * @propertyOf user.types:constructor.User
   * @return {String} contact name
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#displayName
   * @propertyOf user.types:constructor.User
   * @return {String} full display name
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#givenName
   * @propertyOf user.types:constructor.User
   * @return {String} given name
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#familyName
   * @propertyOf user.types:constructor.User
   * @return {String} family name
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#gender
   * @propertyOf user.types:constructor.User
   * @return {String} MALE or FEMALE
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#email
   * @propertyOf user.types:constructor.User
   * @return {String} email address
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#preferredLanguage
   * @propertyOf user.types:constructor.User
   * @return {String} e.g., en
   */
};
},{"../FamilySearch":1}],27:[function(require,module,exports){
/**
 * TODO: Add interface for modifying these so that you
 * don't have to pass the same config options
 * to each new instance
 */

module.exports = {
  clientId: null,
  environment: null,
  httpWrapper: null,
  deferredWrapper: null,
  setTimeout: null,
  clearTimeout: null,
  redirectUri: null,
  autoSignin: false,
  autoExpire: false,
  accessToken: null,
  saveAccessToken: false,
  logging: false,
  // constants for now, but could become options in the future
  accessTokenCookie: 'FS_ACCESS_TOKEN',
  authCodePollDelay: 50,
  defaultThrottleRetryAfter: 500,
  maxHttpRequestRetries: 2,
  maxAccessTokenInactivityTime: 3540000, // 59 minutes to be safe
  maxAccessTokenCreationTime:  86340000, // 23 hours 59 minutes to be safe
  apiServer: {
    'sandbox'   : 'https://sandbox.familysearch.org',
    'staging'   : 'https://stage.familysearch.org',
    'beta'      : 'https://beta.familysearch.org',
    'production': 'https://familysearch.org'
  },
  oauthServer: {
    'sandbox'   : 'https://sandbox.familysearch.org/cis-web/oauth2/v3',
    'staging'   : 'https://identbeta.familysearch.org/cis-web/oauth2/v3',
    'beta'      : 'https://identbeta.familysearch.org/cis-web/oauth2/v3',
    'production': 'https://ident.familysearch.org/cis-web/oauth2/v3'
  },
  authoritiesServer: {
    'sandbox'   : 'https://sandbox.familysearch.org',
    'staging'   : 'https://stage.familysearch.org',
    'beta'      : 'https://apibeta.familysearch.org',
    'production': 'https://api.familysearch.org'
  },
  discoveryUrl: '/.well-known/app-meta'
};

},{}],28:[function(require,module,exports){
var utils = require('./utils'),
    forEach = utils.forEach;

/**
 * Internal utility functions
 */

var Helpers = function(client){
  this.settings = client.settings;
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
 * Prepend authorities server to path if path doesn't start with https?://
 * @param path
 * @returns {string} server + path
 */
Helpers.prototype.getAuthoritiesServerUrl = function(path) {
  return this.getAbsoluteUrl(this.settings.authoritiesServer[this.settings.environment], path);
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
  if (this.settings.debug) {
    console.log.apply(null, arguments);
  }
};

/**
 * Call the callback on the next tick
 * @param {function()} cb Function to call
 */
Helpers.prototype.nextTick = function(cb) {
  this.settings.setTimeout(function() {
    cb();
  },0);
};

/**
 * borrowed from AngularJS's implementation of $q
 * If passed a promise returns the promise; otherwise returns a pseudo-promise returning the value
 * @param {*} value Promise or value
 * @returns {Object} Promise
 */
Helpers.prototype.refPromise = function(value) {
  if (value && utils.isFunction(value.then)) {
    return value;
  }
  var self = this;
  return {
    then: function(callback) {
      var d = self.settings.deferredWrapper();
      self.nextTick(function() {
        d.resolve(callback(value));
      });
      return d.promise;
    }
  };
};

/**
 * borrowed from AngularJS's implementation of $q
 * @param {Array|Object} promises Array or object of promises
 * @returns {Object} Promise that is resolved when all promises resolve
 */
Helpers.prototype.promiseAll = function(promises) {
  var d = this.settings.deferredWrapper(),
    counter = 0,
    results = utils.isArray(promises) ? [] : {},
    self = this;

  forEach(promises, function(promise, key) {
    counter++;
    self.refPromise(promise).then(
      function(value) {
        if (results.hasOwnProperty(key)) {
          return;
        }
        results[key] = value;
        if (!(--counter)) {
          d.resolve(results);
        }
      },
      function() {
        if (results.hasOwnProperty(key)) {
          return;
        }
        d.reject.apply(d, arguments);
      });
  });

  if (counter === 0) {
    d.resolve(results);
  }

  return d.promise;
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
    this.settings.clearTimeout(oldTimer);
  }
  return this.settings.setTimeout(function() {
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
  this.settings.clearTimeout(this.accessTokenInactiveTimer);
  this.accessTokenInactiveTimer = null;
  this.settings.clearTimeout(this.accessTokenCreationTimer);
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
    this.settings.expireCallback();
  }
};

/**
 * The following functions are more like utility functions that
 * don't need access to any instance data
 */



/**
 * Extend the destPromise with functions from the sourcePromise
 * @param {Object} destPromise Destination promise
 * @param {Object} sourcePromise Source promise
 * @returns {Object} Destination promise with functions from source promise
 */
Helpers.prototype.extendHttpPromise = function(destPromise, sourcePromise) {
  return utils.wrapFunctions(destPromise, sourcePromise, ['getResponseHeader', 'getAllResponseHeaders', 'getStatusCode', 'getRequest']);
};

/**
 * Chain multiple http promises so the http functions (e.g., getResponseHeader) from the last promise are available in the returned promise
 * Pass an initial promise and one or more http-promise-generating functions to chain
 * @returns {Object} promise with http functions
 */
Helpers.prototype.chainHttpPromises = function() {
  var promise = arguments[0];
  var bridge = {}; // bridge object is needed because the "then" function is executed immediately in unit tests
  var self = this;
  forEach(Array.prototype.slice.call(arguments, 1), function(fn) {
    promise = promise.then(function() {
     var result = fn.apply(null, arguments);
      if (result && result.then) {
        // the bridge object is extended with the functions from each promise-generating function,
        // but the final functions will be those from the last promise-generating function
        self.extendHttpPromise(bridge, result);
      }
      return result;
    });
  });
  // the returned promise will call into the bridge object for the http functions
  self.extendHttpPromise(promise, bridge);
  return promise;
};

/**
 * Get the last segment of a URL
 * @param url
 * @returns {string}
 */
Helpers.prototype.getLastUrlSegment = function(url) {
  if (url) {
    url = url.replace(/^.*\//, '').replace(/\?.*$/, '');
  }
  return url;
};

/**
 * Response mapper that returns the X-ENTITY-ID header
 * @param data ignored
 * @param promise http promise
 * @returns {string} the X-ENTITY-ID response header
 */
Helpers.prototype.getResponseEntityId = function(data, promise) {
  return promise.getResponseHeader('X-ENTITY-ID');
};

/**
 * Response mapper that returns the location header
 * @param data ignored
 * @param promise http promise
 * @returns {string} the location response header
 */
Helpers.prototype.getResponseLocation = function(data, promise) {
  return this.removeAccessToken(promise.getResponseHeader('Location'));
};

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
 * get a URL from the provided discoveryResource by combining resourceName with params
 * @param discoveryResource discovery resource
 * @param resourceName resource name
 * @param params object of params to populate in template
 * @returns {string} url
 */
Helpers.prototype.getUrlFromDiscoveryResource = function(discoveryResource, resourceName, params) {
  var url = '';
  var resource = discoveryResource.links[resourceName];
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
 * return true if no attribution or attribution without a change message or an existing attribution
 * @param {Object} conclusion name or fact or gender - anything with an attribution
 * @returns {boolean}
 */
Helpers.prototype.attributionNeeded = function(conclusion) {
  return !!(!conclusion.attribution || !conclusion.attribution.changeMessage || conclusion.attribution.contributor);
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
},{"./utils":48}],29:[function(require,module,exports){
var utils = require('./utils'),
    exports = {};

/**
 * httpWrapper function based upon jQuery's $.ajax function
 * @param ajax jQuery's $.ajax function
 * @returns {Function} http function that exposes a standard interface
 */
exports.httpWrapper = function(ajax, client) {
  return function(method, url, headers, data, opts) {
    // set up the options
    opts = utils.extend({
      url: url,
      type: method,
      dataType: 'json',
      data: data,
      processData: false
    }, opts);
    opts.headers = utils.extend({}, headers, opts.headers);
    if (opts.headers['Content-Type'] === 'multipart/form-data') {
      opts.contentType = false;
      delete opts.headers['Content-Type'];
    }

    // make the call
    var jqXHR = ajax(opts);

    // process the response
    var d = client.settings.deferredWrapper();
    var returnedPromise = d.promise;
    var statusCode = null;
    jqXHR.then(
      function(data, textStatus, jqXHR) {
        statusCode = jqXHR.status;
        d.resolve(data);
      },
      function(jqXHR, textStatus, errorThrown) {
        statusCode = jqXHR.status;
        if (statusCode >= 200 && statusCode <= 299 && !jqXHR.responseText) {
          // FamilySearch sometimes returns no content in the response even though we have requested json
          // No content is not valid json, so we get an error parsing it
          // Treat it as valid but empty content
          d.resolve(null);
        }
        else {
          d.reject(jqXHR, textStatus, errorThrown);
        }
      });

    // add http-specific functions to the returned promise
    utils.wrapFunctions(returnedPromise, jqXHR, ['getResponseHeader', 'getAllResponseHeaders']);
    returnedPromise.getStatusCode = function() {
      return statusCode;
    };
    returnedPromise.getRequest = function() {
      return opts;
    };
    return returnedPromise;
  };
};

/**
 * deferredWrapper function based upon jQuery's $.Deferred function
 * @param deferred jQuery's $.Deferred function
 * @returns {Function} deferred function that exposes a standard interface
 */
exports.deferredWrapper = function(deferred) {
  return function() {
    var d = deferred();
    return {
      promise: d.promise(),
      resolve: d.resolve,
      reject: d.reject
    };
  };
};

module.exports = exports;

},{"./utils":48}],30:[function(require,module,exports){
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
 * @function
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
    var d = settings.deferredWrapper();
    d.reject();
    return d.promise;
  } else {
    return self.plumbing.getUrl('http://oauth.net/core/2.0/endpoint/authorize').then(function(url) {
      var popup = self.openPopup(url, {
        'response_type' : 'code',
        'client_id'     : settings.clientId,
        'redirect_uri'  : settings.redirectUri
      });
      return self._pollForAuthCode(popup);
    });
  }
};

/**
 * Process the response from the access token endpoint
 *
 * @param {Object} promise promise from the access token endpoint
 * @param {Object} accessTokenDeferred deferred that needs to be resolved or rejected
 */
FS.prototype.handleAccessTokenResponse = function(promise, accessTokenDeferred) {
  var self = this;
  promise.then(
    function(data) {
      var accessToken = data['access_token'];
      if (accessToken) {
        self.helpers.setAccessToken(accessToken);
        accessTokenDeferred.resolve(accessToken);
      }
      else {
        accessTokenDeferred.reject(data['error']);
      }
    },
    function() {
      accessTokenDeferred.reject.apply(accessTokenDeferred, arguments);
    });
};

/**
 * @ngdoc function
 * @name authentication.functions:getAccessToken
 * @function
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
 * {@link http://jsfiddle.net/fqn6j7fs/ editable example}
 *
 * @param {String=} authCode auth code from getAuthCode; if not passed in, this function will call getAuthCode
 * @return {Object} a promise of the (string) access token.
 */
FS.prototype.getAccessToken = function(authCode) {
  var self = this,
      settings = self.settings,
      accessTokenDeferred = settings.deferredWrapper(),
      plumbing = self.plumbing,
      helpers = self.helpers;
  if (settings.accessToken) {
    helpers.nextTick(function() {
      accessTokenDeferred.resolve(settings.accessToken);
    });
  }
  else {
    // get auth code if not passed in
    var authCodePromise;
    if (authCode) {
      authCodePromise = helpers.refPromise(authCode);
    }
    else {
      authCodePromise = self.getAuthCode();
    }
    authCodePromise.then(
      function(authCode) {
        // get the access token given the auth code
        plumbing.getUrl('http://oauth.net/core/2.0/endpoint/token').then(function(url) {
          var promise = plumbing.post(url, {
              'grant_type' : 'authorization_code',
              'code'       : authCode,
              'client_id'  : settings.clientId
            },
            {'Content-Type': 'application/x-www-form-urlencoded'}); // access token endpoint says it accepts json but it doesn't
          self.handleAccessTokenResponse(promise, accessTokenDeferred);
        });
      },
      function() {
        accessTokenDeferred.reject.apply(accessTokenDeferred, arguments);
      });
  }
  return accessTokenDeferred.promise;
};

/**
 * @ngdoc function
 * @name authentication.functions:getAccessTokenForMobile
 * @function
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
 * @return {Object} a promise of the (string) access token.
 */
FS.prototype.getAccessTokenForMobile = function(userName, password) {
  var self = this,
      accessTokenDeferred = self.settings.deferredWrapper(),
      plumbing = self.plumbing,
      helpers = self.helpers;
  if (self.settings.accessToken) {
    helpers.nextTick(function() {
      accessTokenDeferred.resolve(self.settings.accessToken);
    });
  }
  else {
    plumbing.getUrl('http://oauth.net/core/2.0/endpoint/token').then(function(url) {
      var promise = plumbing.post(url, {
          'grant_type': 'password',
          'client_id' : self.settings.clientId,
          'username'  : userName,
          'password'  : password
        },
        {'Content-Type': 'application/x-www-form-urlencoded'}); // access token endpoint says it accepts json but it doesn't
      self.handleAccessTokenResponse(promise, accessTokenDeferred);
    });
  }
  return accessTokenDeferred.promise;
};

/**
 * @ngdoc function
 * @name authentication.functions:hasAccessToken
 * @function
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
 * @function
 *
 * @description
 * Invalidate the current access token
 *
 * @return {Object} promise that is resolved once the access token has been invalidated
 */
FS.prototype.invalidateAccessToken = function() {
  var self = this;
  self.helpers.eraseAccessToken(true);
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('http://oauth.net/core/2.0/endpoint/token'),
    function(url) {
      return self.plumbing.del(url);
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

FS.prototype.getCode = function(href, d) {
  var params = this.helpers.decodeQueryString(href);
  if (params['code']) {
    d.resolve(params['code']);
  }
  else {
    d.reject(params['error']);
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
  var self = this,
      d = self.settings.deferredWrapper();

  if (popup) {
    var interval = setInterval(function() {
      try {
        if (popup.location.hostname === window.location.hostname) {
          self.getCode(popup.location.href, d);
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
      self.getCode(href, d);
      clearInterval(interval);
    };
  }
  else {
    d.reject('Popup blocked');
  }
  return d.promise;
};

},{"./../FamilySearch":1,"./../utils":48}],31:[function(require,module,exports){
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
 * @function
 *
 * @description
 * Get the standardized date
 *
 * - `getDate()` - get the {@link authorities.types:constructor.Date Date} from the response
 *
 * {@link https://familysearch.org/developers/docs/guides/authorities/date-authority FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/mL906m82/ editable example}
 *
 * @param {String} date text to standardize
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getDate = function(date, opts) {
  var self = this,
      params = {
        date: date,
        dataFormat: 'application/json'
      };
  return self.plumbing.get(self.helpers.getAuthoritiesServerUrl('/authorities/v1/date'), params, {'Accept': 'application/json'}, opts,
    utils.compose(
      utils.objectExtender({getDate: function() { return utils.maybe(utils.maybe(this.dates).date)[0]; }}),
      function(response){
        utils.forEach(response.dates.date, function(date, index, obj){
          obj[index] = self.createDate(date);
        });
        return response;
      }
    ));
};

/**
 * @ngdoc function
 * @name authorities.functions:getPlaceSearch
 * @function
 *
 * @description
 * Get the standardized place
 *
 * - `getPlaces()` - get the array of {@link authorities.types:constructor.Place Places} from the response
 *
 * {@link https://familysearch.org/developers/docs/guides/authorities/place-authority FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/1hjbpzgs/ editable example}
 *
 * @param {String} place text to standardize
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceSearch = function(place, opts) {
  var self = this,
      params = {
        place: place,
        view: 'simple',
        dataFormat: 'application/json'
      };
  return self.plumbing.get(self.helpers.getAuthoritiesServerUrl('/authorities/v1/place'), params, {'Accept': 'application/json'}, opts,
    utils.compose(
      utils.objectExtender({getPlaces: function() { return utils.maybe(this.places).place; }}),
      function(response){
        utils.forEach(response.places.place, function(place, index, obj){
          obj[index] = self.createPlace(place);
        });
        return response;
      }
    ));
};

// TODO authorities properties
// TODO name authority
// TODO culture authority

},{"./../FamilySearch":1,"./../utils":48}],32:[function(require,module,exports){
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

FS.prototype._changeHistoryResponseMapper = function(){
  var self = this;
  return utils.compose(
    utils.objectExtender({getChanges: function() { return this.entries || []; }}),
    function(response){
      for(var i = 0; i < response.entries.length; i++){
        response.entries[i] = self.createChange(response.entries[i]);
      }
      return response;
    }
  );
};

/**
 * @ngdoc function
 * @name changeHistory.functions:getPersonChanges
 * @function
 *
 * @description
 * Get change history for a person
 * The response includes the following convenience function
 *
 * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_History_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/s90nqqLs/ editable example}
 *
 * @param {String} pid id of the person or full URL of the person changes endpoint
 * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonChanges = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-changes-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self._changeHistoryResponseMapper());
    });
};

/**
 * @ngdoc function
 * @name changeHistory.functions:getChildAndParentsChanges
 * @function
 *
 * @description
 * Get change history for a child and parents relationship
 * The response includes the following convenience function
 *
 * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Change_History_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/v6e1yjsz/ editable example}
 *
 * @param {String} caprid id of the child and parents relationship or full URL of the child and parents relationship changes endpoint
 * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getChildAndParentsChanges = function(caprid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-changes-template', caprid, {caprid: caprid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self._changeHistoryResponseMapper());
    });
};

/**
 * @ngdoc function
 * @name changeHistory.functions:getCoupleChanges
 * @function
 *
 * @description
 * Get change history for a couple relationship
 * The response includes the following convenience function
 *
 * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Change_History_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/940x4gux/ editable example}
 *
 * @param {String} crid id of the couple relationship to read or full URL of the couple relationship changes endpoint
 * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCoupleChanges = function(crid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-changes-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self._changeHistoryResponseMapper());
    });
};

/**
 * @ngdoc function
 * @name changeHistory.functions:restoreChange
 * @function
 *
 * @description
 * Restore the specified change
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Restore_Change_resource}
 *
 * {@link http://jsfiddle.net/xL50x20d/ editable example}
 *
 * @param {string} chid change id or full URL of the restore changes endpoint
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the chid
 */
FS.prototype.restoreChange = function(chid, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('change-restore-template', chid, {chid: chid}),
    function(url) {
      return self.plumbing.post(url, null, {'Content-Type': void 0}, opts, function() { // don't send a Content-Type header
        return chid;
      });
    });
};

},{"./../FamilySearch":1,"./../utils":48}],33:[function(require,module,exports){
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
 * @function
 *
 * @description
 * Get information about a discussion
 * The response includes the following convenience function
 *
 * - `getDiscussion()` - get the {@link discussions.types:constructor.Discussion Discussion} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/gb1y9jdj/ editable example}
 *
 * @param {String} did id or full URL of the discussion to read
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getDiscussion = function(did, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('discussion-template', did, {did: did}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getDiscussion: function() {
            return maybe(maybe(this).discussions)[0];
          }}),
          function(response){
            for(var i = 0; i < response.discussions.length; i++){
              response.discussions[i] = self.createDiscussion(response.discussions[i]);
            }
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name discussions.functions:getMultiDiscussion
 * @function
 *
 * @description
 * Get multiple discussions at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/9je6gfp5/ editable example}
 *
 * @param {string[]|DiscussionRef[]} dids id's, full URLs, or {@link discussions.types:constructor.DiscussionRef DiscussionRefs} of the discussions
 * @param {Object=} params pass to getDiscussion currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the discussions have been read,
 * returning a map of discussion id (or URL if dids is an array of URLs) to
 * {@link discussions.functions:getDiscussion getDiscussion} response
 */
FS.prototype.getMultiDiscussion = function(dids, params, opts) {
  var self = this,
      promises = {};
  utils.forEach(dids, function(did) {
    var key, url;
    if (did instanceof FS.DiscussionRef) {
      url = did.$getDiscussionUrl();
      key = did.resourceId;
    }
    else {
      url = did;
      key = did;
    }
    promises[key] = self.getDiscussion(url, params, opts);
  });
  return self.helpers.promiseAll(promises);
};

/**
 * @ngdoc function
 * @name discussions.functions:getPersonDiscussionRefs
 * @function
 *
 * @description
 * Get references to discussions for a person
 * The response includes the following convenience function
 *
 * - `getDiscussionRefs()` - get an array of {@link discussions.types:constructor.DiscussionRef DiscussionRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_References_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/rx9wd0nz/ editable example}
 *
 * @param {String} pid id of the person to read or full URL of the person-discussion-references endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonDiscussionRefs = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-discussion-references-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params,
        {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getDiscussionRefs: function() {
            return maybe(maybe(maybe(this).persons)[0])['discussion-references'] || [];
          }}),
          function(response){
            if(response && response.persons && response.persons[0] && utils.isArray(response.persons[0]['discussion-references'])){
              var refs = response.persons[0]['discussion-references'];
              for(var i = 0; i < refs.length; i++){
                refs[i] = self.createDiscussionRef(refs[i]);
              }
            }
            return response;
          },
          utils.objectExtender(function(response) {
            return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
          }, function(response) {
            return maybe(maybe(maybe(response).persons)[0])['discussion-references'];
          })
        ));
    });
};

FS.prototype._commentsResponseMapper = function(){
  var self = this;
  return utils.compose(
    utils.objectExtender({getComments: function() {
      return maybe(maybe(maybe(this).discussions)[0]).comments || [];
    }}),
    function(response){
      if(response && response.discussions && response.discussions[0] && utils.isArray(response.discussions[0].comments)){
        var comments = response.discussions[0].comments;
        for(var i = 0; i < comments.length; i++){
          comments[i] = self.createComment(comments[i]);
        }
      }
      return response;
    }
  );
};

/**
 * @ngdoc function
 * @name discussions.functions:getDiscussionComments
 * @function
 *
 * @description
 * Get comments for a discussion
 * The response includes the following convenience function
 *
 * - `getComments()` - get an array of {@link discussions.types:constructor.Comment Comments} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/discussions/Comments_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/3wfxrkj0/ editable example}
 *
 * @param {String} did of the discussion or full URL of the discussion-comments endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getDiscussionComments = function(did, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('discussion-comments-template', did, {did: did}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          self._commentsResponseMapper(),
          utils.objectExtender(function(response) {
            return { $discussionId: maybe(maybe(maybe(response).discussions)[0]).id };
          }, function(response) {
            return maybe(maybe(maybe(response).discussions)[0])['comments'];
          })
        ));
    });
};

/**
 * @ngdoc function
 * @name discussions.functions:deleteDiscussion
 * @function
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
 * {@link http://jsfiddle.net/quj3enjs/ editable example}
 *
 * @param {string} did id or full URL of the discussion
 * @param {string=} changeMessage change message (currently ignored)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the discussion id/URL
 */
FS.prototype.deleteDiscussion = function(did, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('discussion-template', did, {did: did}),
    function(url) {
      return self.plumbing.del(url, {'Content-Type': 'application/x-fs-v1+json'}, opts, function() {
        return did;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name discussions.functions:deleteDiscussionRef
 * @function
 *
 * @description
 * Delete the specified discussion reference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_Reference_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/p2sjn4ob/ editable example}
 *
 * @param {string} pid person id or full URL of the discussion reference
 * @param {string=} drid id of the discussion reference (must be set if pid is a person id and not the full URL)
 * @param {string=} changeMessage change message
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the pid
 */
FS.prototype.deleteDiscussionRef = function(pid, drid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-discussion-reference-template', pid, {pid: pid, drid: drid}),
    function(url) {
      var headers = {'Content-Type': 'application/x-fs-v1+json'};
      if (changeMessage) {
        headers['X-Reason'] = changeMessage;
      }
      return self.plumbing.del(url, headers, opts, function() {
        return pid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name discussions.functions:deleteDiscussionComment
 * @function
 *
 * @description
 * Delete the specified discussion comment
 *
 * {@link https://familysearch.org/developers/docs/api/discussions/Comment_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/fwnjq1nq/ editable example}
 *
 * @param {string} did discussion id or full URL of the comment
 * @param {string=} cmid id of the comment (must be set if did is a comment id and not the full URL)
 * @param {string=} changeMessage change message (currently ignored)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the did
 */
FS.prototype.deleteDiscussionComment = function(did, cmid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('discussion-comment-template', did, {did: did, cmid: cmid}),
    function(url) {
      return self.plumbing.del(url, {'Content-Type': 'application/x-fs-v1+json'}, opts, function() {
        return did;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name discussions.functions:deleteMemoryComment
 * @function
 *
 * @description
 * Delete the specified memory comment
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Comment_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/Lxcy6pcz/ editable example}
 *
 * @param {string} mid memory id or full URL of the comment
 * @param {string=} cmid id of the comment (must be set if mid is a memory id and not the full URL)
 * @param {string=} changeMessage change message (currently ignored)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the mid
 */
FS.prototype.deleteMemoryComment = function(mid, cmid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('memory-comment-template', mid, {mid: mid, cmid: cmid}),
    function(url) {
      return self.plumbing.del(url, {}, opts, function() {
        return mid;
      });
    }
  );
};

},{"./../FamilySearch":1,"./../utils":48}],34:[function(require,module,exports){
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

FS.prototype._memoriesResponseMapper = function(){
  var self = this;
  return function(response){
    if(response && utils.isArray(response.sourceDescriptions)){
      for(var i = 0; i < response.sourceDescriptions.length; i++){
        if(response.sourceDescriptions[i].attribution){
          response.sourceDescriptions[i].attribution = self.createAttribution(response.sourceDescriptions[i].attribution);
        }
        response.sourceDescriptions[i] = self.createMemory(response.sourceDescriptions[i]);
      }
    }
    return response;
  };
};

/**
 * @ngdoc function
 * @name memories.functions:getPersonMemoriesQuery
 * @function
 *
 * @description
 * Get a paged list of memories for a person
 * The response includes the following convenience function
 *
 * - `getMemories()` - get the array of {@link memories.types:constructor.Memory Memories} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_Query_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/48hw65vz/ editable example}
 *
 * @param {string} pid id of the person or full URL of the person-memories-query endpoint
 * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0,
 * `type` type of artifacts to return - possible values are photo and story - defaults to both
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonMemoriesQuery = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-memories-query', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, 
        utils.compose(
          // TODO when the response contains personas, add a function to return them (last checked 14 July 14)
          utils.objectExtender({getMemories: function() { return this.sourceDescriptions || []; }}),
          self._memoriesResponseMapper()
        ));
    });
};

/**
 * @ngdoc function
 * @name memories.functions:getUserMemoriesQuery
 * @function
 *
 * @description
 * Get a paged list of memories for a user
 * The response includes the following convenience function
 *
 * - `getMemories()` - get the array of {@link memories.types:constructor.Memory Memories} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/User_Memories_Query_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/ywg2um4q/ editable example}
 *
 * @param {string} uid user id or full URL of the user-memories-query endpoint - note this is a _user_ id, not an _agent_ id
 * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getUserMemoriesQuery = function(uid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-memories-query', uid, {cisUserId: uid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, 
        utils.compose(
          // TODO when the response contains personas, add a function to return them (last checked 14 July 14)
          utils.objectExtender({getMemories: function() { return this.sourceDescriptions || []; }}),
          self._memoriesResponseMapper()
        ));
    });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemory
 * @function
 *
 * @description
 * Get information about a memory
 * The response includes the following convenience function
 *
 * - `getMemory()` - get the {@link memories.types:constructor.Memory Memory} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/k064qtLt/ editable example}
 *
 * @param {String} mid id or full URL of the memory
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getMemory = function(mid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('memory-template', mid, {mid: mid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, 
        utils.compose(
          // TODO when the response contains personas, add a function to return them (last checked 14 July 14)
          utils.objectExtender({getMemory: function() { return maybe(this.sourceDescriptions)[0]; }}),
          self._memoriesResponseMapper()
        ));
    });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryComments
 * @function
 *
 * @description
 * Get comments for a memory
 * The response includes the following convenience function
 *
 * - `getComments()` - get the array of {@link discussions.types:constructor.Comment Comments} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Comments_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/n4rtc6mo/ editable example}
 *
 * @param {String} mid of the memory or full URL of the memory-comments endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryComments = function(mid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('memory-comments-template', mid, {mid: mid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          self._commentsResponseMapper(),
          utils.objectExtender(function(response) {
            return { $memoryId: maybe(maybe(maybe(response).sourceDescriptions)[0]).id };
          }, function(response) {
            return maybe(maybe(maybe(response).discussions)[0])['comments'];
          })
        ));
    });
};

FS.prototype._memoryPersonasMapper = function(){
  var self = this;
  return utils.compose(
    function(response){
      if(response && utils.isArray(response.persons)){
        for(var i = 0; i < response.persons.length; i++){
          response.persons[i] = self.createMemoryPersona(response.persons[i]);
        }
      }
      return response;
    },
    function(response){
      if(response && utils.isArray(response.persons)){
        for(var i = 0; i < response.persons.length; i++){
          if(utils.isArray(response.persons[i].names)){
            for(var j = 0; j < response.persons[i].names.length; j++){
              response.persons[i].names[j] = self.createName(response.persons[i].names[j]);
            }
          }
        }
      }
      return response;
    },
    function(response){
      if(response && utils.isArray(response.persons)){
        for(var i = 0; i < response.persons.length; i++){
          if(response.persons[i].media){
            response.persons[i].media = self.createMemoryArtifactRef(response.persons[i].media);
          }
        }
      }
      return response;
    },
    utils.objectExtender(function(response) {
      return { $memoryId: maybe(maybe(response.sourceDescriptions)[0]).id };
    }, function(response) {
      return maybe(response).persons;
    })
  );
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryPersonas
 * @function
 *
 * @description
 * Get personas for a memory
 * The response includes the following convenience function
 *
 * - `getMemoryPersonas()` - get the array of {@link memories.types:constructor.MemoryPersona MemoryPersonas} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/ozybtk5v/ editable example}
 *
 * @param {string} mid of the memory or full URL of the memory-personas endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryPersonas = function(mid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('memory-personas-template', mid, {mid: mid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getMemoryPersonas: function() {
            return this && this.persons ? this.persons : [];
          }}),
          self._memoryPersonasMapper()
        ));
    });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryPersona
 * @function
 *
 * @description
 * Get a single memory persona
 * The response includes the following convenience function
 *
 * - `getMemoryPersona()` - get the {@link memories.types:constructor.MemoryPersona MemoryPersona} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Persona_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/180vfb1w/ editable example}
 *
 * @param {String} mid memory id or full URL of the memory persona
 * @param {string=} mpid id of the memory persona (must be set if mid is a memory id and not the full URL)
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryPersona = function(mid, mpid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('memory-persona-template', mid, {mid: mid, pid: mpid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getMemoryPersona: function() { return maybe(this.persons)[0]; }}),
          self._memoryPersonasMapper()
        ));
    });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryPersonaRefs
 * @function
 *
 * @description
 * Get references to memories for a person
 * The response includes the following convenience function
 *
 * - `getMemoryPersonaRefs()` - get an array of {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/Ldveszee/ editable example}
 *
 * @param {String} pid id of the person or full URL of the person-memory-references endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryPersonaRefs = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-memory-persona-references-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getMemoryPersonaRefs: function() {
            return maybe(maybe(this.persons)[0]).evidence || [];
          }}),
          function(response){
            try {
            if(response && utils.isArray(response.persons) && response.persons[0]){
              var person = response.persons[0];
              if(person.evidence && utils.isArray(person.evidence)){
                for(var i = 0; i < person.evidence.length; i++){
                  person.evidence[i] = self.createMemoryPersonaRef(person.evidence[i]);
                }
              }
            }
            } catch(e) { console.error(e.stack); }
            return response;
          },
          utils.objectExtender(function(response) {
            return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
          }, function(response) {
            return maybe(maybe(maybe(response).persons)[0]).evidence;
          })
        ));
    }
  );
};

/**
 * @ngdoc function
 * @name memories.functions:getPersonPortraitUrl
 * @function
 *
 * @description
 * Get the URL of the portrait of a person
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_Portrait_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/oc4g7334/ editable example}
 *
 * @param {String} pid of the person
 * @param {Object=} params `default` URL to redirect to if portrait doesn't exist;
 * `followRedirect` if true, follow the redirect and return the final URL
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the URL
 */
FS.prototype.getPersonPortraitUrl = function(pid, params, opts) {
  var self = this;
  return self.plumbing.getUrl('person-portrait-template', pid, {pid: pid}).then(function(url) {
    if (params && params.followRedirect) {
      params = utils.extend({}, params);
      delete params.followRedirect;
      var promise = self.plumbing.get(url, params, { 'X-Expect-Override': '200-ok' }, opts);
      // we don't use chaining directly between the .get() and the .then() because .then()
      // returns a new promise representing the return value of the resolve/reject functions
      return promise.then(function(){
        return promise.getStatusCode() === 204 ? '' : self.helpers.appendAccessToken(promise.getResponseHeader('Location'));
      });
    }
    else {
      return self.helpers.appendAccessToken(url);
    }
  });
};

// TODO wrap call to read all portrait urls

/**
 * @ngdoc function
 * @name memories.functions:deleteMemory
 * @function
 *
 * @description
 * Delete the specified memory
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/r3bb6e0u/ editable example}
 *
 * @param {string} mid id or full URL of the memory
 * @param {string=} changeMessage change message (currently ignored)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the memory id/URL
 */
FS.prototype.deleteMemory = function(mid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('memory-template', mid, {mid: mid}),
    function(url) {
      return self.plumbing.del(url, {}, opts, function() {
        return mid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name memories.functions:deleteMemoryPersona
 * @function
 *
 * @description
 * Delete the specified memory persona
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Persona_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/77ba424q/ editable example}
 *
 * @param {string} mid memory id or full URL of the memory persona
 * @param {string=} mpid id of the memory persona (must be set if mid is a memory id and not the full URL)
 * @param {string=} changeMessage change message (currently ignored)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the mid
 */
FS.prototype.deleteMemoryPersona = function(mid, mpid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('memory-persona-template', mid, {mid: mid, pid: mpid}),
    function(url) {
      return self.plumbing.del(url, {}, opts, function() {
        return mid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name memories.functions:deleteMemoryPersonaRef
 * @function
 *
 * @description
 * Delete the specified memory persona ref
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_Reference_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/cbcs86s5/ editable example}
 *
 * @param {string} pid person id or full URL of the memory persona reference
 * @param {string=} mprid id of the memory persona reference (must be set if pid is a person id and not the full URL)
 * @param {string=} changeMessage change message (currently ignored)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the pid
 */
FS.prototype.deleteMemoryPersonaRef = function(pid, mprid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-memory-persona-reference-template', pid, {pid: pid, erid: mprid}),
    function(url) {
      return self.plumbing.del(url, {}, opts, function() {
        return pid;
      });
    }
  );
};

},{"./../FamilySearch":1,"./../utils":48}],35:[function(require,module,exports){
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

function getRoot(obj) {
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

FS.prototype._getNote = function(url, params, opts) {
  var self = this;
  return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts, // child and parents note requires x-fs-v1; others allow fs or gedcomx
    utils.compose(
      utils.objectExtender({getNote: function() {
        return maybe(maybe(getRoot(this)[0]).notes)[0];
      }}),
      function(response){
        var notes = maybe(getRoot(response)[0]).notes;
        utils.forEach(notes, function(note, i){
          notes[i] = self.createNote(note);
        });
        return response;
      },
      utils.objectExtender(function(response) {
        var label = response.persons ? '$personId' : (response.childAndParentsRelationships ? '$childAndParentsId' : '$coupleId');
        var result = {};
        result[label] = maybe(getRoot(response)[0]).id;
        return result;
      }, function(response) {
        return maybe(getRoot(response)[0]).notes;
      })
    ));
};

FS.prototype._getMultiNote = function(id, nids, params, opts, getNoteFn) {
  var self = this,
      promises = {};
  if (utils.isArray(id)) {
    utils.forEach(id, function(e) {
      promises[e] = getNoteFn.call(self, e, null, params, opts);
    });
  }
  else {
    utils.forEach(nids, function(nid) {
      promises[nid] = getNoteFn.call(self, id, nid, params, opts);
    });
  }
  return promises;
};

/**
 * @ngdoc function
 * @name notes.functions:getPersonNote
 * @function
 *
 * @description
 * Get information about a note
 * The response includes the following convenience function
 *
 * - `getNote()` - get the {@link notes.types:constructor.Note Note} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/rcud84ur/ editable example}
 *
 * @param {string} pid id of the person or full URL of the note
 * @param {string=} nid id of the note (required if pid is the id of the person)
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonNote = function(pid, nid, params, opts) {
  // NOTE: this function is called in note.$save() to read couple and child-and-parents notes also by passing in the full note URL
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-note-template', pid, {pid: pid, nid: nid}),
    function(url) {
      return self._getNote(url, params, opts);
    });
};

/**
 * @ngdoc function
 * @name notes.functions:getMultiPersonNote
 * @function
 *
 * @description
 * Get multiple notes at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/4d1wLp8a/ editable example}
 *
 * @param {string|string[]} pid id of the person, or full URLs of the notes
 * @param {string[]=} nids ids of the notes (required if pid is the id of the person)
 * @param {Object=} params pass to getPersonNote currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the notes have been read,
 * returning a map of note id or URL to {@link notes.functions:getPersonNote getPersonNote} response
 */
FS.prototype.getMultiPersonNote = function(pid, nids, params, opts) {
  var promises = this._getMultiNote(pid, nids, params, opts, this.getPersonNote);
  return this.helpers.promiseAll(promises);
};

/**
 * @ngdoc function
 * @name notes.functions:getCoupleNote
 * @function
 *
 * @description
 * Get information about a couple relationship note
 * The response includes the following convenience function
 *
 * - `getNote()` - get the {@link notes.types:constructor.Note Note} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/khbxwa0u/ editable example}
 *
 * @param {string} crid id of the couple relationship or full URL of the note
 * @param {string=} nid id of the note (required if crid is the id of the couple relationship)
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCoupleNote = function(crid, nid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-note-template', crid, {crid: crid, nid: nid}),
    function(url) {
      return self._getNote(url, params, opts);
    });
};

/**
 * @ngdoc function
 * @name notes.functions:getMultiCoupleNote
 * @function
 *
 * @description
 * Get multiple notes at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/1Lch860h/ editable example}
 *
 * @param {string|string[]} crid id of the couple relationship, or full URLs of the notes
 * @param {string[]=} nids ids of the notes (required if crid is the id of the couple relationship)
 * @param {Object=} params pass to getCoupleNote currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the notes have been read,
 * returning a map of note id to {@link notes.functions:getCoupleNote getCoupleNote} response
 */
FS.prototype.getMultiCoupleNote = function(crid, nids, params, opts) {
  var promises = this._getMultiNote(crid, nids, params, opts, this.getCoupleNote);
  return this.helpers.promiseAll(promises);
};

/**
 * @ngdoc function
 * @name notes.functions:getChildAndParentsNote
 * @function
 *
 * @description
 * Get information about a child and parents relationship note
 * The response includes the following convenience function
 *
 * - `getNote()` - get the {@link notes.types:constructor.Note Note} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/1t1uzgq6/ editable example}
 *
 * @param {string} caprid id of the child and parents relationship or full URL of the note
 * @param {string=} nid id of the note (required if caprid is the id of the child and parents relationship)
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getChildAndParentsNote = function(caprid, nid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-note-template', caprid, {caprid: caprid, nid: nid}),
    function(url) {
      return self._getNote(url, params, opts);
    });
};

/**
 * @ngdoc function
 * @name notes.functions:getMultiChildAndParentsNote
 * @function
 *
 * @description
 * Get multiple notes at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/wp4hecco/ editable example}
 *
 * @param {string|string[]} caprid id of the child and parents relationship, or full URLs of the notes
 * @param {string[]=} nids ids of the notes (required if caprid is the id of the child and parents relationship)
 * @param {Object=} params pass to getChildAndParentsNote currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the notes have been read,
 * returning a map of note id to {@link notes.functions:getChildAndParentsNote getChildAndParentsNote} response
 */
FS.prototype.getMultiChildAndParentsNote = function(caprid, nids, params, opts) {
  var promises = this._getMultiNote(caprid, nids, params, opts, this.getChildAndParentsNote);
  return this.helpers.promiseAll(promises);
};

/**
 * @ngdoc function
 * @name notes.functions:getPersonNotes
 * @function
 *
 * @description
 * Get notes for a person
 * The response includes the following convenience function
 *
 * - `getNotes()` - get an array of {@link notes.types:constructor.Note Notes} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Notes_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/rcud84ur/ editable example}
 *
 * @param {String} pid id of the person or full URL of the person-notes endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonNotes = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-notes-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getNotes: function() {
            return maybe(maybe(maybe(this).persons)[0]).notes || [];
          }}),
          function(response){
            var notes = maybe(maybe(maybe(response).persons)[0]).notes;
            utils.forEach(notes, function(note, index){
              notes[index] = self.createNote(note);
            });
            return response;
          },
          utils.objectExtender(function(response) {
            return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
          }, function(response) {
            return maybe(maybe(maybe(response).persons)[0]).notes;
          })
        ));
    });
};

/**
 * @ngdoc function
 * @name notes.functions:getCoupleNotes
 * @function
 *
 * @description
 * Get the notes for a couple relationship
 * The response includes the following convenience function
 *
 * - `getNotes()` - get an array of {@link notes.types:constructor.Note Notes} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Notes_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/khbxwa0u/ editable example}
 *
 * @param {String} crid id of the couple relationship or full URL of the couple-relationship-notes endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCoupleNotes = function(crid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-notes-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getNotes: function() {
            return maybe(maybe(this.relationships)[0]).notes || [];
          }}),
          function(response){
            var notes = maybe(maybe(maybe(response).relationships)[0]).notes;
            utils.forEach(notes, function(note, index){
              notes[index] = self.createNote(note);
            });
            return response;
          },
          utils.objectExtender(function(response) {
            return { $coupleId: maybe(maybe(maybe(response).relationships)[0]).id };
          }, function(response) {
            return maybe(maybe(maybe(response).relationships)[0]).notes;
          })
        ));
    });
};

/**
 * @ngdoc function
 * @name notes.functions:getChildAndParentsNotes
 * @function
 *
 * @description
 * Get the notes for a child and parents relationship
 * The response includes the following convenience function
 *
 * - `getNotes()` - get an array of {@link notes.types:constructor.Note Notes} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Notes_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/1t1uzgq6/ editable example}
 *
 * @param {String} caprid id of the child and parents relationship or full URL of the child-and-parents-relationship-notes endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getChildAndParentsNotes = function(caprid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-notes-template', caprid, {caprid: caprid}),
    function(url) {
      return self.plumbing.get(url, params,
        {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getNotes: function() {
            return maybe(maybe(this.childAndParentsRelationships)[0]).notes || [];
          }}),
          function(response){
            var notes = maybe(maybe(maybe(response).childAndParentsRelationships)[0]).notes;
            utils.forEach(notes, function(note, index){
              notes[index] = self.createNote(note);
            });
            return response;
          },
          utils.objectExtender(function(response) {
            return { $childAndParentsId: maybe(maybe(maybe(response).childAndParentsRelationships)[0]).id };
          }, function(response) {
            return maybe(maybe(maybe(response).childAndParentsRelationships)[0]).notes;
          })
        ));
    });
};

/**
 * @ngdoc function
 * @name notes.functions:deletePersonNote
 * @function
 *
 * @description
 * Delete the specified person note
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/zxwsxzjr/ editable example}
 *
 * @param {string} pid person id or full URL of the note
 * @param {string=} nid id of the note (must be set if pid is an id and not the full URL of the note)
 * @param {string=} changeMessage change message
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the pid
 */
FS.prototype.deletePersonNote = function(pid, nid, changeMessage, opts) {
  // this function is called from note.$delete() also to delete couple notes and child-and-parents notes by passing in the full URL
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-note-template', pid, {pid: pid, nid: nid}),
    function(url) {
      // need to use x-fs-v1+json, required for child-and-parents notes
      var headers = {'Content-Type': 'application/x-fs-v1+json'};
      if (changeMessage) {
        headers['X-Reason'] = changeMessage;
      }
      return self.plumbing.del(url, headers, opts, function() {
        return pid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name notes.functions:deleteCoupleNote
 * @function
 *
 * @description
 * Delete the specified couple note
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource FamilySearch API Docs}
 *
 * @param {string} crid couple relationship id or full URL of the note
 * @param {string=} nid id of the note (must be set if crid is an id and not the full URL of the note)
 * @param {string=} changeMessage change message
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the crid
 */
FS.prototype.deleteCoupleNote = function(crid, nid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-note-template', crid, {crid: crid, nid: nid}),
    function(url) {
      var headers = {};
      if (changeMessage) {
        headers['X-Reason'] = changeMessage;
      }
      return self.plumbing.del(url, headers, opts, function() {
        return crid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name notes.functions:deleteChildAndParentsNote
 * @function
 *
 * @description
 * Delete the specified child-and-parents note
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource FamilySearch API Docs}
 *
 * @param {string} caprid child-and-parents relationship id or full URL of the note
 * @param {string=} nid id of the note (must be set if caprid is an id and not the full URL of the note)
 * @param {string=} changeMessage change message
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the pid
 */
FS.prototype.deleteChildAndParentsNote = function(caprid, nid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-note-template', caprid, {caprid: caprid, nid: nid}),
    function(url) {
      var headers = {'Content-Type': 'application/x-fs-v1+json'};
      if (changeMessage) {
        headers['X-Reason'] = changeMessage;
      }
      return self.plumbing.del(url, headers, opts, function() {
        return caprid;
      });
    }
  );
};

},{"./../FamilySearch":1,"./../utils":48}],36:[function(require,module,exports){
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
  getRelationship: function() { return maybe(this.childAndParentsRelationships)[0]; },
  getPerson:       function(id) { return utils.find(this.persons, {id: id}); }
};

/**
 * @ngdoc function
 * @name parentsAndChildren.functions:getChildAndParents
 * @function
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
 * {@link http://jsfiddle.net/swk1pmo7/ editable example}
 *
 * @param {String} caprid id or full URL of the child-and-parents relationship
 * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
 * which you can access using the `getPerson(id)` convenience function.
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getChildAndParents = function(caprid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-template', caprid, {caprid: caprid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender(childAndParentsConvenienceFunctions),
          function(response){
            utils.forEach(response.persons, function(person, index, obj){
              obj[index] = self.createPerson(person);
            });
            utils.forEach(response.childAndParentsRelationships, function(rel, index, obj){
              obj[index] = self.createChildAndParents(rel);
            });
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name parentsAndChildren.functions:deleteChildAndParents
 * @function
 *
 * @description
 * Delete the specified relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/hguctxyv/ editable example}
 *
 * @param {string} caprid id or full URL of the child-and-parents relationship
 * @param {string} changeMessage reason for the deletion
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the relationship id/URL
 */
FS.prototype.deleteChildAndParents = function(caprid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-template', caprid, {caprid: caprid}),
    function(url) {
      var headers = {'Content-Type': 'application/x-fs-v1+json'};
      if (changeMessage) {
        headers['X-Reason'] = changeMessage;
      }
      return self.plumbing.del(url, headers, opts, function() {
        return caprid;
      });
    }
  );
};

},{"../FamilySearch":1,"../utils":48}],37:[function(require,module,exports){
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
    getPersons:    function()    { return this.persons; },
    exists:        function(num) { return !!maybe(utils.find(this.persons, matchPersonNum(numberLabel, num))).id; },
    getPerson:     function(num) { return utils.find(this.persons, matchPersonNum(numberLabel, num)); }
  };
}

function matchPersonNum(numberLabel, num) {
  return function(p) {
    /*jshint eqeqeq:false */
    return p.display[numberLabel] == num; // == so users can pass in either numbers or strings for ascendancy numbers
  };
}

/**
 * @ngdoc function
 * @name pedigree.functions:getAncestry
 * @function
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
 * * Each Person object has an additional `$getAscendancyNumber()` function that returns the person's ascendancy number,
 * and if the descendants parameter is true, a $getDescendancyNumber() function that returns the person's descendancy number
 * * Some information on the Person objects is available only if `params` includes `personDetails`
 * * If `params` includes `marriageDetails`, then `person.display` includes `marriageDate` and `marriagePlace`.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Ancestry_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/15z6fzkf/ editable example}
 *
 * @param {string} pid id of the person
 * @param {Object=} params includes `generations` to retrieve (max 8),
 * `spouse` id to get ancestry of person and spouse,
 * `personDetails` set to true to retrieve full person objects for each ancestor,
 * `descendants` set to true to retrieve one generation of descendants
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the ancestry
 */
FS.prototype.getAncestry = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('ancestry-query'),
    function(url) {
      return self.plumbing.get(url, utils.extend({'person': pid}, params), {}, opts,
        utils.compose(
          utils.objectExtender(pedigreeConvenienceFunctionGenerator('ascendancyNumber')),
          !!params && !!params.descendants ? utils.objectExtender({
            getDescendant:    function(num) { return utils.find(this.persons, matchPersonNum('descendancyNumber', num)); },
            existsDescendant: function(num) { return !!maybe(utils.find(this.persons, matchPersonNum('descendancyNumber', num))).id; }
          }) : null,
          function(response){
            utils.forEach(response.persons, function(person, index, obj){
              obj[index] = self.createPerson(person);
            });
            return response;
          },
          utils.objectExtender({$getAscendancyNumber: function() { return this.display.ascendancyNumber; }}, function(response) {
            return maybe(response).persons;
          }),
          !!params && !!params.descendants ? utils.objectExtender({$getDescendancyNumber: function() { return this.display.descendancyNumber; }}, function(response) {
            return maybe(response).persons;
          }) : null
        ));
    });
};

/**
 * @ngdoc function
 * @name pedigree.functions:getDescendancy
 * @function
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
 * * Each Person object has an additional `$getDescendancyNumber()` function that returns the person's descendancy number.
 * * Some information on the Person objects is available only if `params` includes `personDetails`
 * * If `params` includes `marriageDetails`, then `person.display` includes `marriageDate` and `marriagePlace`.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Descendancy_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/fbcppezv/ editable example}
 *
 * @param {string} pid id of the person
 * @param {Object=} params includes
 * `generations` to retrieve max 2,
 * `spouse` id to get descendency of person and spouse (set to null to get descendants of unknown spouse),
 * `marriageDetails` set to true to provide marriage details, and
 * `personDetails` set to true to provide person details.
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the descendancy
 */
FS.prototype.getDescendancy = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('descendancy-query'),
    function(url) {
      return self.plumbing.get(url, utils.extend({'person': pid}, params), {}, opts,
        utils.compose(
          utils.objectExtender(pedigreeConvenienceFunctionGenerator('descendancyNumber')),
          function(response){
            utils.forEach(response.persons, function(person, index, obj){
              obj[index] = self.createPerson(person);
            });
            return response;
          },
          utils.objectExtender({$getDescendancyNumber: function() { return this.display.descendancyNumber; }}, function(response) {
            return maybe(response).persons;
          })
        ));
    });
};

},{"./../FamilySearch":1,"./../utils":48}],38:[function(require,module,exports){
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

// Functions to extract various pieces of the response
var personWithRelationshipsConvenienceFunctions = {
  getPrimaryId: function() {
    var sourceDescriptionId = this.description.substring(1),
        sourceDescription = utils.find(this.sourceDescriptions, function(sourceDescription){
          return sourceDescription.id === sourceDescriptionId;
        });
    if(sourceDescription){
      return sourceDescription.about.substring(1);
    }
  },
  getPerson: function(id) { return utils.find(this.persons, {id: id}); },
  getPrimaryPerson: function() { return this.getPerson(this.getPrimaryId()); },
  getParentRelationships: function() {
    var primaryId = this.getPrimaryId();
    return utils.filter(this.childAndParentsRelationships, function(r) {
      return maybe(r.child).resourceId === primaryId;
    });
  },
  getSpouseRelationships: function() {
    return utils.filter(this.relationships, function(r) {
      return r.type === 'http://gedcomx.org/Couple';
    });
  },
  getSpouseRelationship: function(spouseId) {
    var primaryId = this.getPrimaryId();
    return utils.find(this.relationships, function(r) {
      return r.type === 'http://gedcomx.org/Couple' &&
        (primaryId === r.$getHusbandId() ? r.$getWifeId() : r.$getHusbandId()) === spouseId;
    });
  },
  getChildRelationships: function() {
    var primaryId = this.getPrimaryId();
    return utils.filter(this.childAndParentsRelationships, function(r) {
      return maybe(r.father).resourceId === primaryId || maybe(r.mother).resourceId === primaryId;
    });
  },
  getChildRelationshipsOf: function(spouseId) {
    var primaryId = this.getPrimaryId();
    return utils.filter(this.childAndParentsRelationships, function(r) {
      /*jshint eqeqeq:false */
      return (maybe(r.father).resourceId === primaryId || maybe(r.mother).resourceId === primaryId) &&
        (maybe(r.father).resourceId == spouseId || maybe(r.mother).resourceId == spouseId); // allow spouseId to be null or undefined
    });
  },
  getFatherIds:  function() {
    return utils.uniq(utils.map(
      utils.filter(this.getParentRelationships(), function(r) {
        return !!r.$getFatherId();
      }),
      function(r) {
        return r.$getFatherId();
      }, this));
  },
  getFathers:    function() { return utils.map(this.getFatherIds(), this.getPerson, this); },
  getMotherIds:  function() {
    return utils.uniq(utils.map(
      utils.filter(this.getParentRelationships(), function(r) {
        return !!r.$getMotherId();
      }),
      function(r) {
        return r.$getMotherId();
      }, this));
  },
  getMothers:    function() { return utils.map(this.getMotherIds(), this.getPerson, this); },
  getSpouseIds:  function() {
    return utils.uniq(utils.map(
      utils.filter(this.getSpouseRelationships(), function(r) {
        return r.$getHusbandId() && r.$getWifeId(); // only consider couple relationships with both spouses
      }),
      function(r) {
        return this.getPrimaryId() === r.$getHusbandId() ? r.$getWifeId() : r.$getHusbandId();
      }, this));
  },
  getSpouses:    function() { return utils.map(this.getSpouseIds(), this.getPerson, this); },
  getChildIds:   function() {
    return utils.uniq(utils.map(this.getChildRelationships(),
      function(r) {
        return r.$getChildId();
      }, this));
  },
  getChildren:   function() { return utils.map(this.getChildIds(), this.getPerson, this); },
  getChildIdsOf:   function(spouseId) {
    return utils.uniq(utils.map(this.getChildRelationshipsOf(spouseId),
      function(r) {
        return r.$getChildId();
      }, this));
  },
  getChildrenOf:   function(spouseId) { return utils.map(this.getChildIdsOf(spouseId), this.getPerson, this); }
};

// TODO consider moving to another documentation generator so we can link to _methods_ like $save and $delete

/**
 * @ngdoc function
 * @name person.functions:getPerson
 * @function
 *
 * @description
 * Get the specified person
 * The response includes the following convenience function
 *
 * - `getPerson()` - get the {@link person.types:constructor.Person Person} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/m2y1qwm3/ editable example}
 *
 * @param {String} pid id or full URL of the person
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPerson = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getPerson: function() { return this.persons[0]; }}),
          function(response){
            utils.forEach(response.persons, function(person, index, obj){
              obj[index] = self.createPerson(person);
            });
            return response;
          },
          function(response, promise) {
            response.persons[0].$isReadOnly = function() {
              var allowHeader = promise.getResponseHeader('Allow');
              return !!allowHeader && allowHeader.indexOf('POST') < 0;
            };
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name person.functions:getMultiPerson
 * @function
 *
 * @description
 * Get multiple people at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/ukvu1dqs/ editable example}
 *
 * @param {Array} pids of the people to read
 * @param {Object=} params to pass to getPerson currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the people have been read,
 * returning a map of person id to {@link person.functions:getPerson getPerson} response
 */
FS.prototype.getMultiPerson = function(pids, params, opts) {
  var promises = {},
      self = this;
  utils.forEach(pids, function(pid) {
    promises[pid] = self.getPerson(pid, params, opts);
  });
  return self.helpers.promiseAll(promises);
};

FS.prototype._personsAndRelationshipsMapper = function(){
  var self = this;
  return utils.compose(
    utils.objectExtender({
      getCoupleRelationships: function() { return utils.filter(maybe(this).relationships, {type: 'http://gedcomx.org/Couple'}) || []; },
      getChildAndParentsRelationships: function() { return maybe(this).childAndParentsRelationships || []; },
      getPerson:    function(id) { return utils.find(this.persons, {id: id}); }
    }),
    function(response){
      utils.forEach(response.persons, function(person, index, obj){
        obj[index] = self.createPerson(person);
      });
      utils.forEach(response.relationships, function(rel, index, obj){
        // This will create couple objects for ParentChild relationships
        // but those are ignored/filtered out in the convenience functions.
        // TODO: try removing the ParentChild relationships
        obj[index] = self.createCouple(rel);
      });
      utils.forEach(response.childAndParentsRelationships, function(rel, index, obj){
        obj[index] = self.createChildAndParents(rel);
      });
      return response;
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:getPersonWithRelationships
 * @function
 *
 * @description
 * Get a person and their children, spouses, and parents.
 * The response has the following convenience functions
 *
 * - `getPrimaryId()` - id of the person requested
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
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_With_Relationships_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/6vpk7asr/ editable example}
 *
 * @param {String} pid id of the person
 * @param {Object=} params set `persons` to true to retrieve full person objects for each relative
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person with relationships
 */
FS.prototype.getPersonWithRelationships = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-with-relationships-query'),
    function(url) {
      return self.plumbing.get(url, utils.extend({'person': pid}, params), {}, opts,
        utils.compose(
          self._personsAndRelationshipsMapper(),
          utils.objectExtender(personWithRelationshipsConvenienceFunctions),
          function(response, promise) {
            response.persons[0].$isReadOnly = function() {
              var allowHeader = promise.getResponseHeader('Allow');
              return !!allowHeader && allowHeader.indexOf('POST') < 0;
            };
            return response;
          }
        ));
    });
};

// TODO check if person change summary has been fixed (last checked 14 July 14)
// also check if the entries really contain changeInfo and contributors attributes
// can't get any data from this resource as of 12 Feb 2015
// needs to be adapted to new sdk structure when fixed
//  /**
//   * @ngdoc function
//   * @name person.functions:getPersonChangeSummary
//   * @function
//   *
//   * @description
//   * Get the change summary for a person. For detailed change information see functions in the changeHistory module
//   * The response includes the following convenience function
//   *
//   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
//   *
//   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_Summary_resource FamilySearch API Docs}
//   *
//   * {@link http://jsfiddle.net/DallanQ/ga37h/ editable example}
//   *
//   * @param {String} pid id of the person or full URL of the person-change-summary endpoint
//   * @param {Object=} params currently unused
//   * @param {Object=} opts options to pass to the http function specified during init
//   * @return {Object} promise for the response
//   */
//  exports.getPersonChangeSummary = function(pid, params, opts) {
//    return helpers.chainHttpPromises(
//      plumbing.getUrl('person-change-summary-template', pid, {pid: pid}),
//      function(url) {
//        return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
//          helpers.compose(
//            helpers.objectExtender({getChanges: function() { return this.entries || []; }}),
//            helpers.constructorSetter(changeHistory.Change, 'entries')));
//      });
//  };

/**
 * @ngdoc function
 * @name person.functions:getSpouses
 * @function
 *
 * @description
 * Get the relationships to a person's spouses.
 * The response includes the following convenience functions
 *
 * - `getCoupleRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships
 * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents}
 * relationships for children of the couples
 * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship except children
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Spouses_of_a_Person_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/1311jcz8/ editable example}
 *
 * @param {String} pid id of the person or full URL of the spouses endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getSpouses = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('spouses-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._personsAndRelationshipsMapper());
    });
};

/**
 * @ngdoc function
 * @name person.functions:getParents
 * @function
 *
 * @description
 * Get the relationships to a person's parents.
 * The response includes the following convenience functions
 *
 * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
 * - `getCoupleRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships for parents
 * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Parents_of_a_person_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/Lf9fe61r/ editable example}
 *
 * @param {String} pid id of the person or full URL of the parents endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getParents = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('parents-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._personsAndRelationshipsMapper());
    });
};

/**
 * @ngdoc function
 * @name person.functions:getChildren
 * @function
 *
 * @description
 * Get the relationships to a person's children
 * The response includes the following convenience functions
 *
 * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
 * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Children_of_a_person_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/fownteLe/ editable example}
 *
 * @param {String} pid id of the person or full URL of the children endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getChildren = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('children-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._personsAndRelationshipsMapper());
    });
};

/**
 * @ngdoc function
 * @name person.functions:deletePerson
 * @function
 *
 * @description
 * Delete the specified person
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/cv5wravg/ editable example}
 *
 * @param {string} pid id or full URL of the person
 * @param {string} changeMessage reason for the deletion
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id/URL
 */
FS.prototype.deletePerson = function(pid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
        return pid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:getPreferredSpouse
 * @function
 *
 * @description
 * Get the preferred Couple relationship id if any for this person and this user.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Spouse_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/fh5jxsre/ editable example}
 *
 * @param {string} pid id of the person
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the preferred couple relationship id,
 * null if the preferred spouse is the unknown spouse,
 * or undefined if no preference
 */
FS.prototype.getPreferredSpouse = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.getCurrentUser(),
    function(response) {
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('preferred-spouse-relationship-template', null, {uid: uid, pid: pid});
    },
    function(url) {
      var promise = self.plumbing.get(url + '.json', params, { 'X-Expect-Override': '200-ok' }, opts);
      return promise.then(function(){
        if (promise.getStatusCode() === 200) {
          var contentLocation = promise.getResponseHeader('Location');
          if (contentLocation.indexOf('child-and-parents-relationships') >= 0) {
            return null;
          }
          else {
            return self.helpers.getLastUrlSegment(contentLocation);
          }
        }
        return void 0;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:setPreferredSpouse
 * @function
 *
 * @description
 * Set the preferred spouse for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Spouse_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/j8kws5n3/ editable example}
 *
 * @param {string} pid id of the person
 * @param {string} crid id or URL of the preferred Couple relationship, or null to set the unknown spouse
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id
 */
FS.prototype.setPreferredSpouse = function(pid, crid, opts) {
  var location,
      promises = [],
      self = this;
  if (crid === null) {
    // grab the first child-and-parents relationship with an unknown parent
    promises.push(
      self.getChildren(pid),
      function(response) {
        var capr = utils.find(response.getChildAndParentsRelationships(), function(capr) {
          return !capr.$getFatherId() || !capr.$getMotherId();
        });
        return self.plumbing.getUrl('child-and-parents-relationship-template', null, {caprid: capr.id});
      }
    );
  }
  else {
    promises.push(
      self.plumbing.getUrl('couple-relationship-template', crid, {crid: crid})
    );
  }
  promises.push(
    function(url) {
      location = url;
      return self.getCurrentUser();
    },
    function(response) {
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('preferred-spouse-relationship-template', null, {uid: uid, pid: pid});
    },
    function(url) {
      return self.plumbing.put(url, null, {'Location': location}, opts, function() {
        return pid;
      });
    }
  );
  return self.helpers.chainHttpPromises.apply(self.helpers, promises);
};

/**
 * @ngdoc function
 * @name person.functions:deletePreferredSpouse
 * @function
 *
 * @description
 * Delete the preferred spouse preference for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Spouse_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/2cxup42f/ editable example}
 *
 * @param {string} pid id of the person
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id
 */
FS.prototype.deletePreferredSpouse = function(pid, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.getCurrentUser(),
    function(response) {
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('preferred-spouse-relationship-template', null, {uid: uid, pid: pid});
    },
    function(url) {
      return self.plumbing.del(url, {}, opts, function() {
        return pid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:getPreferredParents
 * @function
 *
 * @description
 * Get the preferred ChildAndParents relationship id if any for this person and this user.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Parent_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/rarpqLb6/ editable example}
 *
 * @param {string} pid id of the person
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the preferred ChildAndParents relationship id or undefined if no preference
 */
FS.prototype.getPreferredParents = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.getCurrentUser(),
    function(response) {
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('preferred-parent-relationship-template', null, {uid: uid, pid: pid});
    },
    function(url) {
      // TODO remove accept header when FS bug is fixed (last checked 4/2/14) - unable to check 14 July 14
      // couldn't check 14 July 14 because the endpoint returns a 403 now
      var promise = self.plumbing.get(url + '.json', params, {Accept: 'application/x-fs-v1+json', 'X-Expect-Override': '200-ok'}, opts);
      return promise.then(function(){
        return promise.getStatusCode() === 200 ? self.helpers.getLastUrlSegment(promise.getResponseHeader('Location')) : void 0;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:setPreferredParents
 * @function
 *
 * @description
 * Set the preferred parents for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Parent_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/swfsnarb/ editable example}
 *
 * @param {string} pid id of the person
 * @param {string} caprid id or URL of the preferred ChildAndParents relationship
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id
 */
FS.prototype.setPreferredParents = function(pid, caprid, opts) {
  var childAndParentsUrl,
      self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-template', caprid, {caprid: caprid}),
    function(url) {
      childAndParentsUrl = url;
      return self.getCurrentUser();
    },
    function(response) {
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('preferred-parent-relationship-template', null, {uid: uid, pid: pid});
    },
    function(url) {
      return self.plumbing.put(url, null, {'Location': childAndParentsUrl}, opts, function() {
        return pid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:deletePreferredParents
 * @function
 *
 * @description
 * Delete the preferred parents preference for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Parent_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/r5erwvft/ editable example}
 *
 * @param {string} pid id of the person
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id
 */
FS.prototype.deletePreferredParents = function(pid, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.getCurrentUser(),
    function(response) {
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('preferred-parent-relationship-template', null, {uid: uid, pid: pid});
    },
    function(url) {
      return self.plumbing.del(url, {}, opts, function() {
        return pid;
      });
    }
  );
};

// TODO person merge
// TODO person not a match
// TODO restore person

},{"../FamilySearch":1,"../utils":48}],39:[function(require,module,exports){
var FS = require('./../FamilySearch');

/**
 * @ngdoc overview
 * @name redirect
 * @description
 * Utility functions
 *
 * {@link https://familysearch.org/developers/docs/api/resources#redirect FamilySearch API Docs}
 */

/**
 * @ngdoc function
 * @name redirect.functions:getRedirectUrl
 * @function
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
},{"./../FamilySearch":1}],40:[function(require,module,exports){
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

var nonQueryParams = {start: true, count: true, context: true};

function quote(value) {
  if(!utils.isString(value)){
    return value;
  }
  value = value.replace(/[:"]/g, '').trim();
  return value.indexOf(' ') >= 0 ? '"' + value + '"' : value;
}

function getQuery(params) {
  return utils.map(utils.filter(utils.keys(params), function(key) { return !nonQueryParams[key]; }),
    function(key) { return key+':'+quote(params[key]); }).join(' ');
}

var searchMatchResponseConvenienceFunctions = {
  getSearchResults: function() { return this.entries || []; },
  getResultsCount: function() { return this.results || 0; },
  getIndex: function() { return this.index || 0; }
};

FS.prototype._getSearchMatchResponseMapper = function() {
  var self = this;
  return utils.compose(
    utils.objectExtender(searchMatchResponseConvenienceFunctions),
    function(response){
      utils.forEach(response.entries, function(entry, index, obj){
        obj[index] = self.createSearchResult(entry);
      });
      return response;
    }
  );
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:getPersonSearch
 * @function
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
 * {@link http://jsfiddle.net/ghsyjzLb/ editable example}
 *
 * @param {Object} params described above
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonSearch = function(params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-search'),
    function(url) {
      return self.plumbing.get(url, utils.removeEmptyProperties({
          q: getQuery(utils.removeEmptyProperties(utils.extend({}, params))),
          start: params.start,
          count: params.count,
          context: params.context
        }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        utils.compose(
          self._getSearchMatchResponseMapper(),
          function(obj, promise) {
            obj.getContext = function() {
              return promise.getResponseHeader('X-FS-Page-Context');
            };
            return obj;
          }
        )
      );
    });
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:getPersonMatches
 * @function
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
 * {@link http://jsfiddle.net/xb0ts69q/ editable example}
 *
 * @param {String} pid id of the person or full URL of the person-matches endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonMatches = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-matches-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self._getSearchMatchResponseMapper());
    });
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:getPersonMatchesQuery
 * @function
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
 * {@link http://jsfiddle.net/fdLrujkb/ editable example}
 *
 * @param {Object} params generally the same parameters as described for
 * {@link searchAndMatch.functions:getPersonSearch getPersonSearch}, with the the following differences:
 * `context` is not a valid parameter for match,
 * `fatherId`, `motherId`, and `spouseId` assist in finding matches for people whose relatives have already been matched, and
 * `candidateId` restricts matches to the person with that Id (what does this mean?)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonMatchesQuery = function(params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-matches-query'),
    function(url) {
      try {
      return self.plumbing.get(url, utils.removeEmptyProperties({
          q: getQuery(utils.removeEmptyProperties(utils.extend({}, params))),
          start: params.start,
          count: params.count
        }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self._getSearchMatchResponseMapper());
      } catch(e) {
        console.log(e.stack);
      }
    });
};

},{"./../FamilySearch":1,"./../utils":48}],41:[function(require,module,exports){
var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name sourceBox.functions:getCollectionsForUser
 * @function
 *
 * @description
 * Get the collections for the specified user
 * The response includes the following convenience function
 *
 * - `getCollections()` - get an array of {@link sourceBox.types:constructor.Collection Collections} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_for_a_User_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/a0eLkwtb/ editable example}
 *
 * @param {String} uid of the user or full URL of the collections-for-user endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCollectionsForUser = function(uid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-collections-for-user-template', uid, {uid: uid}),
    function(url) {
      return self.plumbing.get(url, {}, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getCollections: function() { return this.collections || []; }}),
          function(response){
            utils.forEach(response.collections, function(collection, index, obj){
              obj[index] = self.createCollection(collection);
            });
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:getCollection
 * @function
 *
 * @description
 * Get information about a user-defined collection
 * The response includes the following convenience function
 *
 * - `getCollection()` - get a {@link sourceBox.types:constructor.Collection Collection} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/rn5hd0cd/ editable example}
 *
 * @param {String} udcid id or full URL of the collection
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCollection = function(udcid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-collection-template', udcid, {udcid: udcid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getCollection: function() { return maybe(this.collections)[0]; }}),
          function(response){
            utils.forEach(response.collections, function(collection, index, obj){
              obj[index] = self.createCollection(collection);
            });
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:getCollectionSourceDescriptions
 * @function
 *
 * @description
 * Get a paged list of source descriptions in a user-defined collection
 * The response includes the following convenience function
 *
 * - `getSourceDescriptions()` - get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_Source_Descriptions_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/a73eysbs/ editable example}
 *
 * @param {String} udcid id of the collection or full URL of the collection-source-descriptions endpoint
 * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCollectionSourceDescriptions = function(udcid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-collection-source-descriptions-template', udcid, {udcid: udcid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getSourceDescriptions: function() { return this.sourceDescriptions || []; }}),
          function(response){
            utils.forEach(response.sourceDescriptions, function(source, index, obj){
              obj[index] = self.createSourceDescription(source);
            });
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:getCollectionSourceDescriptionsForUser
 * @function
 *
 * @description
 * Get a paged list of source descriptions in all user-defined collections defined by a user
 * The response includes the following convenience function
 *
 * - `getSourceDescriptions()` - get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_Source_Descriptions_for_a_User_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/pse56a1f/ editable example}
 *
 * @param {String} uid of the user or full URL of the collection-source-descriptions-for-user endpoint
 * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCollectionSourceDescriptionsForUser = function(uid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-collections-source-descriptions-for-user-template', uid, {uid: uid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getSourceDescriptions: function() { return this.sourceDescriptions || []; }}),
          function(response){
            utils.forEach(response.sourceDescriptions, function(source, index, obj){
              obj[index] = self.createSourceDescription(source);
            });
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:moveSourceDescriptionsToCollection
 * @function
 *
 * @description
 * Move the specified source descriptions to the specified collection
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_Source_Descriptions_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/5mva0why/ editable example}
 *
 * @param {string} udcid id of the collection or full URL of the collection descriptions endpoint
 * @param {SourceDescription[]|string[]} srcDescs array of source descriptions - may be objects or id's
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the udcid
 */
FS.prototype.moveSourceDescriptionsToCollection = function(udcid, srcDescs, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-collection-source-descriptions-template', udcid, {udcid: udcid}),
    function(url) {
      var srcDescIds = utils.map(srcDescs, function(srcDesc) {
        return { id: (srcDesc instanceof FS.SourceDescription) ? srcDesc.id : srcDesc };
      });
      return self.plumbing.post(url, { sourceDescriptions: srcDescIds }, {}, opts, function() {
        return udcid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name sourceBox.functions:removeSourceDescriptionsFromCollections
 * @function
 *
 * @description
 * Remove the specified source descriptions from all collections
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_Source_Descriptions_for_a_User_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/k39uo7zk/ editable example}
 *
 * @param {SourceDescription[]|string[]} srcDescs array of source descriptions - may be objects or id's
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the srcDescs
 */
FS.prototype.removeSourceDescriptionsFromCollections = function(srcDescs, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.getCurrentUser(),
    function(response) {
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('user-collections-source-descriptions-for-user-template', null, {uid: uid});
    },
    function(url) {
      var sdids = utils.map(srcDescs, function(srcDesc) {
        return (srcDesc instanceof FS.SourceDescription) ? srcDesc.id : srcDesc;
      });
      return self.plumbing.del(self.helpers.appendQueryParameters(url, {id: sdids}), {}, opts, function() {
        return srcDescs;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name sourceBox.functions:deleteCollection
 * @function
 *
 * @description
 * Delete the specified collection
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/yhdznLu0/ editable example}
 *
 * @param {string} udcid id or full URL of the collection
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the udcid
 */
FS.prototype.deleteCollection = function(udcid, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-collection-template', udcid, {udcid: udcid}),
    function(url) {
      return self.plumbing.del(url, {}, opts, function() {
        return udcid;
      });
    }
  );
};

},{"./../FamilySearch":1,"./../utils":48}],42:[function(require,module,exports){
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
 * @function
 *
 * @description
 * Get information about a source
 * The response includes the following convenience function
 *
 * - `getSourceDescription()` - get the {@link sources.types:constructor.SourceDescription SourceDescription} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/m4Lhab24/ editable example}
 *
 * @param {String|SourceRef} sdid id or full URL or {@link sources.types:constructor.SourceRef SourceRef} of the source description
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getSourceDescription = function(sdid, params, opts) {
  if (sdid instanceof FS.SourceRef) {
    //noinspection JSUnresolvedFunction
    sdid = sdid.$getSourceDescriptionUrl() || sdid.$sourceDescriptionId;
  }
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('source-description-template', sdid, {sdid: sdid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getSourceDescription: function() { return maybe(this.sourceDescriptions)[0]; }}),
          function(response){
            var sourceDescriptions = maybe(maybe(response).sourceDescriptions);
            for(var i = 0; i < sourceDescriptions.length; i++){
              sourceDescriptions[i] = self.createSourceDescription(sourceDescriptions[i]);
            }
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name sources.functions:getMultiSourceDescription
 * @function
 *
 * @description
 * Get multiple source descriptions at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/jvvohktt/ editable example}
 *
 * @param {string[]|SourceRef[]} sdids ids or full URLs or {@link sources.types:constructor.SourceRef SourceRefs} of the source descriptions
 * @param {Object=} params pass to getSourceDescription currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the source descriptions have been read,
 * returning a map of source description id or URL to {@link sources.functions:getSourceDescription getSourceDescription} response
 */
FS.prototype.getMultiSourceDescription = function(sdids, params, opts) {
  var promises = {},
      self = this;
  utils.forEach(sdids, function(sdid) {
    var id, url;
    if (sdid instanceof FS.SourceRef) {
      id = sdid.$sourceDescriptionId || sdid.$getSourceDescriptionUrl();
      url = sdid.$getSourceDescriptionUrl() || sdid.$sourceDescriptionId;
    }
    else {
      id = sdid;
      url = sdid;
    }
    promises[id] = self.getSourceDescription(url, params, opts);
  });
  return self.helpers.promiseAll(promises);
};

/**
 * @ngdoc function
 * @name sources.functions:getSourceRefsQuery
 * @function
 *
 * @description
 * Get the people, couples, and child-and-parents relationships referencing a source
 * The response includes the following convenience functions
 *
 * - `getPersonSourceRefs()` - get an array of person {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getCoupleSourceRefs()` - get an array of couple relationship {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getChildAndParentsSourceRefs()` - get an array of child and parent relationship {@link sources.types:constructor.SourceRef SourceRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Source_References_Query_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/gbusgbys/ editable example}
 *
 * @param {String} sdid id of the source description (cannot be the URL)
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getSourceRefsQuery = function(sdid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('source-references-query'),
    function(url) {
      url = self.helpers.appendQueryParameters(url, {source: sdid});
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getPersonSourceRefs: function() {
            return utils.flatMap(maybe(this.persons), function(person) {
              return person.sources;
            });
          }}),
          utils.objectExtender({getCoupleSourceRefs: function() {
            return utils.flatMap(maybe(this.relationships), function(couple) {
              return couple.sources;
            });
          }}),
          utils.objectExtender({getChildAndParentsSourceRefs: function() {
            return utils.flatMap(maybe(this.childAndParentsRelationships), function(childAndParents) {
              return childAndParents.sources;
            });
          }}),
          function(response){
            utils.forEach(['persons','relationships','childAndParentsRelationships'], function(type){
              maybe(response)[type] = utils.map(maybe(response)[type], function(group){
                group.sources = utils.map(group.sources, function(source){
                  return self.createSourceRef(source);
                });
                return group;
              });
            });
            return response;
          },
          utils.objectExtender(function(response, sourceRef) {
            // get the person that contains this source ref
            var person = utils.find(maybe(response).persons, function(person) {
              return !!utils.find(maybe(person).sources, {id: sourceRef.id});
            });
            return {
              $personId: person.id,
              $sourceDescriptionId: sdid
            };
          }, function(response) {
            return utils.flatMap(maybe(response).persons, function(person) {
              return person.sources;
            });
          }),
          utils.objectExtender(function(response, sourceRef) {
            // get the couple that contains this source ref
            var couple = utils.find(maybe(response).relationships, function(couple) {
              return !!utils.find(maybe(couple).sources, {id: sourceRef.id});
            });
            return {
              $coupleId: couple.id,
              $sourceDescriptionId: sdid
            };
          }, function(response) {
            return utils.flatMap(maybe(response).relationships, function(couple) {
              return couple.sources;
            });
          }),
          utils.objectExtender(function(response, sourceRef) {
            // get the child-and-parents that contains this source ref
            var childAndParents = utils.find(maybe(response).childAndParentsRelationships, function(childAndParents) {
              return !!utils.find(maybe(childAndParents).sources, {id: sourceRef.id});
            });
            return {
              $childAndParentsId: childAndParents.id,
              $sourceDescriptionId: sdid
            };
          }, function(response) {
            return utils.flatMap(maybe(response).childAndParentsRelationships, function(childAndParents) {
              return childAndParents.sources;
            });
          })
        ));
    }
  );
};

FS.prototype._getSourcesResponseMapper = function(root, label, includeDescriptions) {
  var self = this;
  return utils.compose(
    utils.objectExtender(utils.removeEmptyProperties({
      getSourceRefs: function() {
        return maybe(maybe(this[root])[0]).sources || [];
      },
      getSourceDescriptions: includeDescriptions ? function() {
        return this.sourceDescriptions || [];
      } : null,
      getSourceDescription: includeDescriptions ? function(id) {
        return utils.find(this.sourceDescriptions, {id: id});
      } : null
    })),
    function(response){
      utils.forEach(maybe(maybe(maybe(response)[root])[0]).sources, function(source, index, obj){
        obj[index] = self.createSourceRef(source);
      });
      return response;
    },
    utils.objectExtender(function(response, srcRef) {
      var result;
      if (self.helpers.isAbsoluteUrl(srcRef.description)) {
        // TODO check whether source description id is in source references as resourceId (last checked 14 July 14)
        result = {
          $sourceDescriptionId: self.helpers.getLastUrlSegment(srcRef.description)
        };
      }
      else { // '#id' format (or maybe just 'id', though 'id' may be deprecated now)
        var sdid = srcRef.description.charAt(0) === '#' ? srcRef.description.substr(1) : srcRef.description;
        result = {
          $sourceDescriptionId: sdid,
          description: self.helpers.getUrlFromDiscoveryResource(self.settings.discoveryResource, 'source-description-template',
            {sdid: sdid})
        };
      }
      result[label] = maybe(maybe(maybe(response)[root])[0]).id;
      return result;
    }, function(response) {
      return maybe(maybe(maybe(response)[root])[0]).sources;
    }),
    includeDescriptions ? function(response){
      utils.forEach(response.sourceDescriptions, function(source, index, obj){
        obj[index] = self.createSourceDescription(source);
      });
      return response;
    } : null
  );
};

/**
 * @ngdoc function
 * @name sources.functions:getPersonSourceRefs
 * @function
 *
 * @description
 * Get the source references for a person
 * The response includes the following convenience function
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/xdqcv2dn/ editable example}
 *
 * @param {String} pid person id or full URL of the source-references endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonSourceRefs = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-source-references-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._getSourcesResponseMapper('persons', '$personId', false));
    });
};

/**
 * @ngdoc function
 * @name sources.functions:getPersonSourcesQuery
 * @function
 *
 * @description
 * Get source references and descriptions for a person
 * The response includes the following convenience functions
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
 * with the specified source description id from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Sources_Query_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/bxt10adm/ editable example}
 *
 * @param {String} pid person id or full URL of the person-sources-query endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonSourcesQuery = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-sources-query-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._getSourcesResponseMapper('persons','$personId', true));
    });
};

/**
 * @ngdoc function
 * @name sources.functions:getCoupleSourceRefs
 * @function
 *
 * @description
 * Get the source references for a couple relationship
 * The response includes the following convenience function
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
 * with the specified source description id from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_References_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/v8Lbxyu3/ editable example}
 *
 * @param {String} crid couple relationship id or full URL of the couple-relationship-source-references endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCoupleSourceRefs = function(crid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-source-references-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._getSourcesResponseMapper('relationships', '$coupleId', false));
    });
};

/**
 * @ngdoc function
 * @name sources.functions:getCoupleSourcesQuery
 * @function
 *
 * @description
 * Get the source references and descriptions for a couple relationship
 * The response includes the following convenience function
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
 * with the specified source description id from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Sources_Query_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/z1nv7dnc/ editable example}
 *
 * @param {String} crid couple relationship id or full URL of the couple-relationship-sources-query endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCoupleSourcesQuery = function(crid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-sources-query-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._getSourcesResponseMapper('relationships', '$coupleId', true));
    });
};

/**
 * @ngdoc function
 * @name sources.functions:getChildAndParentsSourceRefs
 * @function
 *
 * @description
 * Get the source references for a child and parents relationship
 * The response includes the following convenience function
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
 * with the specified source description id from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/hoxqrLcy/ editable example}
 *
 * @param {String} caprid child-and-parents relationship id or full URL of the child-and-parents-relationship-sources-query endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getChildAndParentsSourceRefs = function(caprid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-source-references-template', caprid, {caprid: caprid}),
    function(url) {
      return self.plumbing.get(url, params,
        {'Accept': 'application/x-fs-v1+json'}, opts, self._getSourcesResponseMapper('childAndParentsRelationships', '$childAndParentsId', false));
    });
};

/**
 * @ngdoc function
 * @name sources.functions:getChildAndParentsSourcesQuery
 * @function
 *
 * @description
 * Get the source references and descriptions for a child and parents relationship
 * The response includes the following convenience function
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
 * with the specified source description id from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/192zfzh3/ editable example}
 *
 * @param {String} caprid child-and-parents relationship id or full URL of the child-and-parents-relationship-sources-query endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getChildAndParentsSourcesQuery = function(caprid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-sources-template', caprid, {caprid: caprid}),
    function(url) {
      return self.plumbing.get(url, params,
        {'Accept': 'application/x-fs-v1+json'}, opts, self._getSourcesResponseMapper('childAndParentsRelationships', '$childAndParentsId', true));
    });
};

/**
 * @ngdoc function
 * @name sources.functions:deleteSourceDescription
 * @function
 *
 * @description
 * Delete the specified source description as well as all source references that refer to it
 *
 * __NOTE__ if you delete a source description, FamilySearch does not automatically delete references to it.
 * Therefore, this function reads and deletes source references before deleting the source description.
 * FamilySearch is aware of this issue but hasn't committed to a fix.
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/fb2fzgsv/ editable example}
 *
 * @param {string} sdid id of the source description (cannot be the URL)
 * @param {string} changeMessage reason for the deletion
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the sdid
 */
FS.prototype.deleteSourceDescription = function(sdid, changeMessage, opts) {
  // read the source references
  var self = this;
  var returnedPromise = self.getSourceRefsQuery(sdid, {}, opts).then(function(response) {
    // delete source references
    var promises = utils.union(
      utils.map(response.getPersonSourceRefs(), function(srcRef) {
        return self.deletePersonSourceRef(srcRef.$getSourceRefUrl(), null, changeMessage, opts);
      }),
      utils.map(response.getCoupleSourceRefs(), function(srcRef) {
        return self.deleteCoupleSourceRef(srcRef.$getSourceRefUrl(), null, changeMessage, opts);
      }),
      utils.map(response.getChildAndParentsSourceRefs(), function(srcRef) {
        return self.deleteChildAndParentsSourceRef(srcRef.$getSourceRefUrl(), null, changeMessage, opts);
      }));
    // once the source references are deleted, delete the source description
    return self.helpers.promiseAll(promises).then(function() {
      var promise = self.helpers.chainHttpPromises(
        self.plumbing.getUrl('source-description-template', null, {sdid: sdid}),
        function(url) {
          return self.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
            return sdid;
          });
        });
      self.helpers.extendHttpPromise(returnedPromise, promise); // extend this promise into the returned promise
      return promise;
    });
  });
  return returnedPromise;
};

/**
 * @ngdoc function
 * @name sources.functions:deletePersonSourceRef
 * @function
 *
 * @description
 * Delete the specified person source reference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_Reference_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/nenz4de2/ editable example}
 *
 * @param {string} changeMessage reason for the deletion
 * @param {string} pid person id or full url of the source reference
 * @param {string=} srid id of the source reference (must be set if pid is a person id and not the full URL)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the pid
 */
FS.prototype.deletePersonSourceRef = function(pid, srid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-source-reference-template', pid, {pid: pid, srid: srid}),
    function(url) {
      return self.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
        return pid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name sources.functions:deleteCoupleSourceRef
 * @function
 *
 * @description
 * Delete the specified couple source reference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_Reference_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/txcf4ke3/ editable example}
 *
 * @param {string} changeMessage reason for the deletion
 * @param {string} crid couple relationship id or full url of the source reference
 * @param {string=} srid id of the source reference (must be set if crid is a couple relationship id and not the full URL)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the crid
 */
FS.prototype.deleteCoupleSourceRef = function(crid, srid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-source-reference-template', crid, {crid: crid, srid: srid}),
    function(url) {
      return self.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
        return crid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name sources.functions:deleteChildAndParentsSourceRef
 * @function
 *
 * @description
 * Delete the specified child-and-parents source reference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_Reference_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/hche691q/ editable example}
 *
 * @param {string} changeMessage reason for the deletion
 * @param {string} caprid child-and-parents relationship id or full url of the source reference
 * @param {string=} srid id of the source reference (must be set if caprid is a child-and-parents relationship id and not the full URL)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the caprid
 */
FS.prototype.deleteChildAndParentsSourceRef = function(caprid, srid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-source-reference-template', caprid, {caprid: caprid, srid: srid}),
    function(url) {
      var headers = {'Content-Type' : 'application/x-fs-v1+json'};
      if (changeMessage) {
        headers['X-Reason'] = changeMessage;
      }
      return self.plumbing.del(url, headers, opts, function() {
        return caprid;
      });
    }
  );
};

},{"./../FamilySearch":1,"./../utils":48}],43:[function(require,module,exports){
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
  getRelationship: function() { return maybe(this.relationships)[0]; },
  getPerson:       function(id) { return utils.find(this.persons, {id: id}); }
};

/**
 * @ngdoc function
 * @name spouses.functions:getCouple
 * @function
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
 * {@link http://jsfiddle.net/x1v6vxoy/ editable example}
 *
 * @param {String} crid id or full URL of the couple relationship
 * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
 * which you can access using the `getPerson(id)` convenience function.
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCouple = function(crid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender(coupleConvenienceFunctions),
          function(response){
            utils.forEach(response.persons, function(person, index, obj){
              obj[index] = self.createPerson(person);
            });
            utils.forEach(response.relationships, function(rel, index, obj){
              obj[index] = self.createCouple(rel);
            });
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name spouses.functions:deleteCouple
 * @function
 *
 * @description
 * Delete the specified relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/1hsj5b59/ editable example}
 *
 * @param {string} crid id or full URL of the couple relationship
 * @param {string} changeMessage reason for the deletion
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the relationship id/URL
 */
FS.prototype.deleteCouple = function(crid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.del(url, changeMessage ? {'X-Reason' : changeMessage} : {}, opts, function() {
        return crid;
      });
    }
  );
};

},{"../FamilySearch":1,"../utils":48}],44:[function(require,module,exports){
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
 * @function
 *
 * @description
 * Get the current user with the following convenience function
 *
 * - `getUser()` - get the {@link user.types:constructor.User User} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/users/Current_User_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/u7esw4u3/ editable example}
 *
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} a promise for the current user
 */
FS.prototype.getCurrentUser = function(params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('current-user'),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getUser: function() { return maybe(this.users)[0]; }}),
          function(response){
            utils.forEach(response.users, function(user, index, obj){
              obj[index] = self.createUser(user);
            });
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name user.functions:getAgent
 * @function
 *
 * @description
 * Get information about the specified agent (contributor)
 * The response includes the following convenience function
 *
 * - `getAgent()` - get the {@link user.types:constructor.Agent Agent} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/dcxy9a59/ editable example}
 *
 * @param {String} aid id or full URL of the agent (contributor)
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 */
FS.prototype.getAgent = function(aid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('agent-template', aid, {uid: aid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getAgent: function() { return maybe(this.agents)[0]; }}),
          function(response){
            utils.forEach(response.agents, function(agent, index, obj){
              obj[index] = self.createAgent(agent);
            });
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name user.functions:getMultiAgent
 * @function
 *
 * @description
 * Get multiple agents at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/88gbgae5/ editable example}
 *
 * @param {Array} aids Ids or full URLs of the agents (contributors) to read
 * @param {Object=} params pass to getAgent currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the agents have been read,
 * returning a map of agent id to {@link user.functions:getAgent getAgent} response
 */
FS.prototype.getMultiAgent = function(aids, params, opts) {
  var self = this,
      promises = {};
  utils.forEach(aids, function(aid) {
    promises[aid] = self.getAgent(aid, params, opts);
  });
  return self.helpers.promiseAll(promises);
};

},{"./../FamilySearch":1,"./../utils":48}],45:[function(require,module,exports){
var utils = require('./utils'),
    exports = {};

/**
 * httpWrapper function based upon request
 * https://github.com/request/request
 * @param request request library
 * @returns {Function} http function that exposes a standard interface
 */
exports.httpWrapper = function(http, client) {
  return function(method, url, headers, data, opts) {
    
    // set up the options
    opts = utils.extend({
      url: url,
      method: method,
      json: true,
      body: data
    }, opts);
    opts.headers = utils.extend({}, headers, opts.headers);

    if (opts.headers['Content-Type'] === 'multipart/form-data') {
      opts.formData = opts.body;
      delete opts.body;
      delete opts.headers['Content-Type'];
      delete opts.json;
    }
    
    // process the response
    var d = client.settings.deferredWrapper();
    var returnedPromise = d.promise;
    var statusCode = null;
    var responseHeaders = {};

    // make the call
    http(opts, function(error, response, body){
      if(response){
        if(response.headers){
          responseHeaders = response.headers;
        }
        statusCode = response.statusCode;
      }
      if(error){
        d.reject(error);
      } else if(statusCode >= 400) {
        if(body.errors){
          error = body.errors[0];
        } else {
          error = new Error('server responded with a ' + statusCode);
        }
        d.reject(error);
      } else {
        d.resolve(body);
      }
    });

    // add http-specific functions to the returned promise
    returnedPromise.getStatusCode = function() {
      return statusCode;
    };
    returnedPromise.getResponseHeader = function(header) {
      return responseHeaders[header];
    };
    returnedPromise.getAllResponseHeaders = function() {
      return responseHeaders;
    };
    returnedPromise.getRequest = function() {
      return opts;
    };
    return returnedPromise;
    
  };
};

/**
 * deferredWrapper function based upon Q's defer function
 * @param deferred Q's defer function
 * @returns {Function} deferred function that exposes a standard interface
 */
exports.deferredWrapper = function(defer) {
  return function() {
    var d = defer();
    return {
      promise: d.promise,
      resolve: d.resolve,
      reject: d.reject
    };
  };
};

module.exports = exports;
},{"./utils":48}],46:[function(require,module,exports){
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
 * @function
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
 * @function
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
 * @ngdoc function
 * @name plumbing.functions:getUrl
 * @function
 *
 * @description
 * Low-level call to get a  URL from the discovery resource given a resource name, an possible-url, and a set of parameters
 *
 * @param {string} resourceName resource name
 * @param {string=} possibleUrl possible url - return this if it is an absolute url
 * @param {Object=} params parameters
 * @return {Object} promise for the url
 */
Plumbing.prototype.getUrl = function(resourceName, possibleUrl, params) {
  var self = this;
  return this.settings.discoveryPromise.then(function(discoveryResource) {
    var url = '';

    if (self.helpers.isAbsoluteUrl(possibleUrl)) {
      url = possibleUrl;
    }
    else {
      url = self.helpers.getUrlFromDiscoveryResource(discoveryResource, resourceName, params);
    }
    return url;
  });
};

/**
 * @ngdoc function
 * @name plumbing.functions:get
 * @function
 *
 * @description
 * Low-level call to get a specific REST endpoint from FamilySearch
 *
 * @param {String} url may be relative; e.g., /platform/users/current
 * @param {Object=} params query parameters
 * @param {Object=} headers options headers
 * @param {Object=} opts options to pass to the http function specified during init
 * @param {Function=} responseMapper function to map response data to something else
 * @return {Object} a promise that behaves like promises returned by the http function specified during init
 */
Plumbing.prototype.get = function(url, params, headers, opts, responseMapper) {
  return this.http('GET',
    this.helpers.appendQueryParameters(url, params),
    utils.extend({'Accept': 'application/x-gedcomx-v1+json'}, headers),
    null,
    opts,
    responseMapper);
};

/**
 * @ngdoc function
 * @name plumbing.functions:post
 * @function
 *
 * @description
 * Low-level call to post to a specific REST endpoint from FamilySearch
 *
 * @param {String} url may be relative
 * @param {Object=} data post data
 * @param {Object=} headers options headers
 * @param {Object=} opts options to pass to the http function specified during init
 * @param {Function=} responseMapper function to map response data to something else
 * @return {Object} a promise that behaves like promises returned by the http function specified during init
 */
Plumbing.prototype.post = function(url, data, headers, opts, responseMapper) {
  return this.http('POST',
    url,
    utils.extend({'Content-Type': 'application/x-gedcomx-v1+json'}, headers),
    data,
    opts,
    responseMapper);
};

/**
 * @ngdoc function
 * @name plumbing.functions:put
 * @function
 *
 * @description
 * Low-level call to put to a specific REST endpoint from FamilySearch
 *
 * @param {String} url may be relative
 * @param {Object=} data post data
 * @param {Object=} headers options headers
 * @param {Object=} opts options to pass to the http function specified during init
 * @param {Function=} responseMapper function to map response data to something else
 * @return {Object} a promise that behaves like promises returned by the http function specified during init
 */
Plumbing.prototype.put = function(url, data, headers, opts, responseMapper) {
  return this.http('PUT',
    url,
    utils.extend({'Content-Type': 'application/x-gedcomx-v1+json'}, headers),
    data,
    opts,
    responseMapper);
};

/**
 * @ngdoc function
 * @name plumbing.functions:del
 * @function
 *
 * @description
 * Low-level call to delete to a specific REST endpoint from FamilySearch
 *
 * @param {String} url may be relative
 * @param {Object=} opts options to pass to the http function specified during init
 * @param {Object=} headers options headers
 * @param {Function=} responseMapper function to map response data to something else
 * @return {Object} a promise that behaves like promises returned by the http function specified during init
 */
Plumbing.prototype.del = function(url, headers, opts, responseMapper) {
  return this.http('DELETE',
    url,
    utils.extend({'Content-Type': 'application/x-gedcomx-v1+json'}, headers),
    null,
    opts,
    responseMapper);
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
    // remove $... and _... attrs from data
    data = utils.clonePartial(data, function(key) {
      return (!(utils.isString(key) && (key.charAt(0) === '$' || key.charAt(0) === '_')));
    });
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
 * @function
 *
 * @description
 * Low-level call to issue an http request to a specific REST endpoint from FamilySearch
 *
 * @param {String} method GET, POST, PUT, or DELETE
 * @param {String} url may be relative
 * @param {Object=} headers headers object
 * @param {Object=} data post data
 * @param {Object=} opts options to pass to the http function specified during init
 * @param {Function=} responseMapper function to map response data into the data to return
 * @param {Number=} retries number of times to retry
 * @return {Object} a promise that behaves like promises returned by the http function specified during init
 */
Plumbing.prototype.http = function(method, url, headers, data, opts, responseMapper, retries) {
  var d = this.settings.deferredWrapper();
  var returnedPromise = d.promise;
  var self = this;
  // prepend the server
  var absoluteUrl = this.helpers.getAPIServerUrl(url);
  headers = headers || {};
    
  // do we need to request an access token?
  var accessTokenPromise;
  if (!this.settings.accessToken &&
      this.settings.autoSignin &&
      !this.helpers.isOAuthServerUrl(absoluteUrl) &&
      url !== this.settings.discoveryUrl) {
    accessTokenPromise = this.settings.getAccessToken();
  }
  else {
    accessTokenPromise = this.helpers.refPromise(this.settings.accessToken);
  }
  accessTokenPromise.then(function() {
    // append the access token as a query parameter to avoid cors pre-flight
    // this is detrimental to browser caching across sessions, which seems less bad than cors pre-flight requests
    var accessTokenName = self.helpers.isAuthoritiesServerUrl(absoluteUrl) ? 'sessionId' : 'access_token';
    if (self.settings.accessToken && absoluteUrl.indexOf(accessTokenName+'=') === -1) {
      var accessTokenParam = {};
      accessTokenParam[accessTokenName] = self.settings.accessToken;
      absoluteUrl = self.helpers.appendQueryParameters(absoluteUrl, accessTokenParam);
    }

    // default retries
    if (retries == null) { // also catches undefined
      retries = self.settings.maxHttpRequestRetries;
    }

    // call the http wrapper
    var promise = self.settings.httpWrapper(method,
      absoluteUrl,
      headers,
      self.transformData(data, headers['Content-Type']),
      opts || {});

    // process the response
    self.helpers.extendHttpPromise(returnedPromise, promise);
    promise.then(
      function(data) {
        if (method === 'GET' && promise.getStatusCode() === 204) {
          data = {}; // an empty GET response should become an empty json object
        }
        self.helpers.refreshAccessToken();
        var processingTime = promise.getResponseHeader('X-PROCESSING-TIME');
        if (processingTime) {
          self.totalProcessingTime += parseInt(processingTime,10);
        }
        if (responseMapper) {
          data = responseMapper(data, promise);
        }
        d.resolve(data);
      },
      function() {
        var statusCode = promise.getStatusCode();
        self.helpers.log('http failure', statusCode, retries, promise.getAllResponseHeaders());
        if (statusCode === 401) {
          self.helpers.eraseAccessToken();
        }
        if ((method === 'GET' && statusCode >= 500 && retries > 0) || statusCode === 429) {
          var retryAfterHeader = promise.getResponseHeader('Retry-After');
          var retryAfter = retryAfterHeader ? parseInt(retryAfterHeader,10) : self.settings.defaultThrottleRetryAfter;
          self.settings.setTimeout(function() {
            promise = self.http(method, url, headers, data, opts, responseMapper, retries-1);
            self.helpers.extendHttpPromise(returnedPromise, promise);
            promise.then(
              function(data) {
                d.resolve(data);
              },
              function() {
                d.reject.apply(d, arguments);
              });
          }, retryAfter);
        }
        else {
          d.reject.apply(d, arguments);
        }
      });
  },
  function() {
    d.reject.apply(d, arguments);
  });

  return returnedPromise;
};

module.exports = Plumbing;

},{"./utils":48}],47:[function(require,module,exports){
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
  if (!this[role]) {
    this[role] = {};
  }
  if (person instanceof FS.Person) {
    this[role].resource = person.$getPersonUrl();
    delete this[role].resourceId;
  }
  else if (this.$helpers.isAbsoluteUrl(person)) {
    this[role].resource = person;
    delete this[role].resourceId;
  }
  else if (utils.isString(person)) {
    this[role].resourceId = person;
    delete this[role].resource;
  } else {
    this[role] = person;
  }
};

exports.deleteMember = function(role, changeMessage) {
  if (!this.$deletedMembers) {
    this.$deletedMembers = {};
  }
  this.$deletedMembers[role] = changeMessage;
  delete this[role];
};

exports.setFacts = function(prop, values, changeMessage) {
  if (utils.isArray(this[prop])) {
    utils.forEach(this[prop], function(fact) {
      exports.deleteFact.call(this, prop, fact, changeMessage);
    }, this);
  }
  this[prop] = [];
  utils.forEach(values, function(value) {
    exports.addFact.call(this, prop, value);
  }, this);
};

exports.addFact = function(prop, value) {
  if (!utils.isArray(this[prop])) {
    this[prop] = [];
  }
  if (!(value instanceof FS.Fact)) {
    value = this.$client.createFact(value);
  }
  this[prop].push(value);
};

exports.deleteFact = function(prop, value, changeMessage) {
  if (!(value instanceof FS.Fact)) {
    value = utils.find(this[prop], { id: value });
  }
  var pos = utils.indexOf(this[prop], value);
  if (pos >= 0) {
    // add fact to $deletedFacts map; key is the href to delete
    var key = this.$helpers.removeAccessToken(maybe(maybe(maybe(value).links).conclusion).href);
    if (key) {
      if (!this.$deletedFacts) {
        this.$deletedFacts = {};
      }
      this.$deletedFacts[key] = changeMessage;
    }
    // remove fact from array
    this[prop].splice(pos,1);
  }
};

module.exports = exports;
},{"./FamilySearch":1,"./utils":48}],48:[function(require,module,exports){
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
 * borrowed from underscore.js
 * Compose functions from right to left, with each function consuming the return value of the function that follows
 * @returns {Function} Composed function
 */
exports.compose = function() {
  var funcs = arguments;
  return function() {
    var args = arguments;
    for (var i = funcs.length - 1; i >= 0; i--) {
      if (!!funcs[i]) {
        args = [funcs[i].apply(this, args)];
      }
    }
    return args[0];
  };
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
 * @returns {Array} Flattened array
 */
exports.flatMap = exports.compose(exports.flatten, exports.map);

/**
 * borrowed from underscore
 * Union arrays, removing duplicates
 * @returns {Array} Unioned array
 */
exports.union = function() {
  return exports.uniq(exports.flatten(arguments));
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
 * Create a new function which is the specified function with the right-most arguments pre-filled with arguments from this call
 * @param {function()} fn Function to wrap
 * @returns {Function} Wrapped function
 */
exports.partialRight = function(fn) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    return fn.apply(this, Array.prototype.slice.call(arguments).concat(args));
  };
};

/**
 * Create a new function which is the specified function with the left-most arguments pre-filled with arguments from this call
 * @param {function()} fn Function to wrap
 * @returns {Function} Wrapped function
 */
exports.partial = function(fn) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
  };
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
 * clone with a filter function to limit which fields are cloned
 * borowed from http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
 * doesn't handle cyclic objects, functions, may not handle regex's
 * @param {Object} obj Object to clone
 * @param {Function=} filter Function(key) returns true to clone the field; all fields are cloned if omitted
 * @returns {Object} cloned object
 */
exports.clonePartial = function(obj, filter) {
  var copy;
  // Handle the 3 simple types, and null or undefined
  if (null == obj || 'object' !== typeof(obj)) {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      if (!filter || filter(i)) {
        copy.push(exports.clonePartial(obj[i], filter));
      }
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    // set the constructor on the cloned object
    copy = Object.create(Object.getPrototypeOf(obj));
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr) && (!filter || filter(attr))) {
        copy[attr] = exports.clonePartial(obj[attr], filter);
      }
    }
    return copy;
  }

  throw new Error('Unable to copy obj');
};

/**
 * Return a function that takes an object and extends it with the specified extensions
 * @param {Object|function(Object)} extensions object or a function that takes the object and extension point and returns an extensions object
 * @param {function(Object)=} extensionPointGetter Optional function that returns (sub)objects to extend
 * @return {function(Object)} The extender function
 */
exports.objectExtender = function(extensions, extensionPointGetter) {
  return function(obj) {
    if (obj) {
      if (extensionPointGetter) {
        forEach(extensionPointGetter(obj), function(extensionPoint) {
          exports.extend(extensionPoint, exports.isFunction(extensions) ? extensions(obj, extensionPoint) : extensions);
        });
      }
      else {
        exports.extend(obj, exports.isFunction(extensions) ? extensions(obj, obj) : extensions);
      }
    }
    return obj;
  };
};

exports.appFieldRejector = function(key) {
  return !(exports.isString(key) && key.charAt(0) === '_');
};

/**
 * delete properties of an object with a filter function to limit which fields are deleted
 * @param {Object} obj object to delete properties from
 * @param {Function=} filter Function(key) returns true to delete the field; all fields are deleted if omitted
 */
exports.deletePropertiesPartial = function(obj, filter) {
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr) && (!filter || filter(attr))) {
      delete obj[attr];
    }
  }
};

/**
 * Copy functions from source to dest, binding them to source
 * @param {Object} dest Destination object
 * @param {Object} source Source object
 * @param {Array<string>} fns Names of functions to copy
 * @returns {Object} Destination object with functions
 */
exports.wrapFunctions = function(dest, source, fns) {
  forEach(fns, function(fn) {
    dest[fn] = function() {
      return source[fn].apply(source, arguments);
    };
  });
  return dest;
};
},{}]},{},[1])(1)
});