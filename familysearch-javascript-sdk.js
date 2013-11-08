/**
 * @preserve FamilySearch JavaScript SDK
 * (c) 2013, Dallan Quass & Dovy Paukstys
 * License: MIT
*/
/*jshint sub:true*/
/*global console:false */

/**
 * @ngdoc overview
 * @name index
 * @description
 * Overall description goes here
 */

;(function() {
  'use strict';

  var appKey,
    environment,
    httpWrapper,
    deferredWrapper,
    authCallbackUri,
    autoSignin,
    accessToken,
    logging,
    server = {
      'sandbox'   : 'https://sandbox.familysearch.org',
      'staging'   : 'https://stage.familysearch.org',
      'production': 'https://familysearch.org'
    },
    oauthServer = {
      'sandbox'   : 'https://sandbox.familysearch.org/cis-web/oauth2/v3',
      'staging'   : 'https://identbeta.familysearch.org/cis-web/oauth2/v3',
      'production': 'https://ident.familysearch.org/cis-web/oauth2/v3'
    },
    authCodePollDelay = 50,
    throttleRetryAfter = 500,
    maxHttpRequestRetries = 5,
    totalProcessingTime = 0;


  //==================================================================================================================
  // INITIALIZATION
  //==================================================================================================================

  /**
   * @ngdoc overview
   * @name init
   * @description
   * Call the init function once to initialize the FamilySearch object before calling any other functions.
   */

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
   * - `http_function` - a function for issuing http requests: jQuery.ajax, and eventually angular's $http, or node.js's ...
   * - `deferred_function` - a function for creating deferred's: jQuery.Deferred, and eventually angular's $q or Q
   * - `auth_callback` - the OAuth2 redirect uri you registered with FamilySearch.  Does not need to exist, but must have the same host and port as the server running your script
   * - `auto_signin` - set to true if you want the user to be prompted to sign in when a call returns 401 unauthorized (must be false for node.js, and may require the user to enable popups in their browser)
   * - `access_token` - pass this in if you already have an access token
   * - `logging` - not currently used
   *
   * @param {Object} opts options
   */
  function init(opts) {
    opts = opts || {};

    if(!opts['app_key']) {
      throw 'app_key must be set';
    }
    appKey = opts['app_key'];

    if(!opts['environment']) {
      throw 'environment must be set';
    }
    environment = opts['environment'];

    if(!opts['http_function']) {
      throw 'http must be set; e.g., jQuery.ajax';
    }
    httpWrapper = jqueryHttpWrapper(opts['http_function']);

    if(!opts['deferred_function']) {
      throw 'deferred_function must be set; e.g., jQuery.Deferred';
    }
    deferredWrapper = jqueryDeferredWrapper(opts['deferred_function']);

    if(opts['auth_callback']) {
      authCallbackUri = opts['auth_callback'];
    }

    if(opts['auto_signin']) {
      autoSignin = opts['auto_signin'];
    }

    if(opts['access_token']) {
      accessToken = opts['access_token'];
    }

    logging = opts['logging'];
  }

  //==================================================================================================================
  // AUTHENTICATION
  //==================================================================================================================

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
  function getAuthCode() {
    var popup = openPopup(getAbsoluteUrl(oauthServer[environment], 'authorization'), {
      'response_type' : 'code',
      'client_id'     : appKey,
      'redirect_uri'  : authCallbackUri
    });
    return pollForAuthCode(popup);
  }

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
   * {@link http://jsfiddle.net/DallanQ/MpUg7/ editable example}
   *
   * @param {String=} authCode auth code from getAuthCode; if not passed in, this function will call getAuthCode
   * @return {Object} a promise of the (string) access token.
   */
  function getAccessToken(authCode) {
    var accessTokenDeferred = deferredWrapper();
    if (accessToken) {
      nextTick(function() {
        accessTokenDeferred.resolve(accessToken);
      });
    }
    else {
      // get auth code if not passed in
      var authCodePromise;
      if (authCode) {
        authCodePromise = refPromise(authCode);
      }
      else {
        authCodePromise = getAuthCode();
      }
      authCodePromise.then(
        function(authCode) {
          // get the access token given the auth code
          var promise = post(getAbsoluteUrl(oauthServer[environment], 'token'), {
            'grant_type' : 'authorization_code',
            'code'       : authCode,
            'client_id'  : appKey
          });
          promise.then(
            function() {
              var data = promise.getData();
              console.log('accessToken=',data);
              accessToken = data['access_token'];
              if (accessToken) {
                accessTokenDeferred.resolve(accessToken);
              }
              else {
                accessTokenDeferred.reject(data['error']);
              }
            },
            function() {
              accessTokenDeferred.reject.apply(accessTokenDeferred, arguments);
            });
        },
        function() {
          accessTokenDeferred.reject.apply(accessTokenDeferred, arguments);
        });
    }
    return accessTokenDeferred.promise;
  }

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
  function invalidateAccessToken() {
    accessToken = null;
    return del(getAbsoluteUrl(oauthServer[environment], 'token'));
  }

  //==================================================================================================================
  // API
  //==================================================================================================================

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
   * Get the current user with the following convenience functions
   *
   * - getContactName
   * - getId
   * - getTreeUserId
   *
   * {@link https://familysearch.org/developers/docs/api/users/Current_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/3NJFM/ editable example}
   *
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} a promise for the current user
   */
  function getCurrentUser(opts) {
    console.log('getCurrentUser');
    return get('/platform/users/current', {}, {}, opts, objectExtender(currentUserConvenienceFunctions));
  }
  var currentUserConvenienceFunctions = {
    getContactName: function() { return this.users[0].contactName; },
    getId:          function() { return this.users[0].id; },
    getTreeUserId:  function() { return this.users[0].treeUserId; }
  };

  /**
   * @ngdoc function
   * @name user.functions:getCurrentUserPerson
   * @function
   *
   * @description
   * Get the id of the current user person in the tree
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Current_User_Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/c4puF/ editable example}
   *
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the (string) id of the current user person
   */
  function getCurrentUserPerson(opts) {
    console.log('getCurrentUserPerson');
    var promise = get('/platform/tree/current-person', {}, {}, opts);
    var d = deferredWrapper();
    var returnedPromise = extendHttpPromise(d.promise, promise);
    promise.then(
      function() {
        handleCurrentUserPersonResponse(d, promise);
      },
      function() {
        // in Chrome, the current person response is expected to fail because it involves a redirect and chrome doesn't
        // re-send the Accept header on a CORS redirect, so the response comes back as XML and jQuery can't parse it.
        // That's ok, because we'll pick up the ID from the Content-Location header
        handleCurrentUserPersonResponse(d, promise);
      });

    return returnedPromise;
  }

  // common code for current user person promise fulfillment and failure
  function handleCurrentUserPersonResponse(d, promise) {
    var id = null;
    // this is the expected result for Node.js because it doesn't follow redirects
    var location = promise.getResponseHeader('Location');
    if (!location) {
      // this is the expected result for browsers because they follow redirects
      // NOTE: Chrome doesn't re-send the accept header on CORS redirect requests, so the request fails because we can't
      // parse the returned XML into JSON. We still get a Content-Location header though.
      location = promise.getResponseHeader('Content-Location');
    }

    if (location) {
      var matchResult = location.match(/\/persons\/([^?]*)/);
      if (matchResult) {
        id = matchResult[1];
      }
    }

    if (id) {
      d.resolve(id);
    }
    else {
      d.reject('not found');
    }
  }

  /**
   * @ngdoc overview
   * @name person
   * @description
   * Functions related to persons
   *
   * {@link https://familysearch.org/developers/docs/api/resources#person FamilySearch API Docs}
   */

  /**
   * @ngdoc function
   * @name person.functions:getPerson
   * @function
   *
   * @description
   * Get the specified person with the following convenience functions
   *
   * - getId
   * - getBirthDate
   * - getBirthPlace
   * - getDeathDate
   * - getDeathPlace
   * - getGender
   * - getLifeSpan
   * - getName
   * - isLiving
   * - getGivenName
   * - getSurname
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/cST4L/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person
   */
  function getPerson(id, opts) {
    return get('/platform/tree/persons/'+encodeURI(id), {}, {}, opts, objectExtender(personConvenienceFunctions));
  }
  var personConvenienceFunctions = {
    getId:         function() { return this.persons[0].id; },
    getBirthDate:  function() { return this.persons[0].display.birthDate; },
    getBirthPlace: function() { return this.persons[0].display.birthPlace; },
    getDeathDate:  function() { return this.persons[0].display.deathDate; },
    getDeathPlace: function() { return this.persons[0].display.deathPlace; },
    getGender:     function() { return this.persons[0].display.gender; },
    getLifeSpan:   function() { return this.persons[0].display.lifespan; },
    getName:       function() { return this.persons[0].display.name; },
    isLiving:      function() { return this.persons[0].living; },
    getGivenName:  function() { return findOrEmpty(firstOrEmpty(findOrEmpty(this.persons[0].names, {preferred: true}).nameForms).parts,
      {type: 'http://gedcomx.org/Given'}).value; },
    getSurname:    function() { return findOrEmpty(firstOrEmpty(findOrEmpty(this.persons[0].names, {preferred: true}).nameForms).parts,
      {type: 'http://gedcomx.org/Surname'}).value; }
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
   * {@link http://jsfiddle.net/DallanQ/TF6Lg/ editable example}
   *
   * @param {Array} ids of the people to read
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the people have been read, returning a map of person id to response
   */
  function getMultiPerson(ids, opts) {
    var promises = {};
    forEach(ids, function(id) {
      promises[id] = getPerson(id, opts);
    });
    return promiseAll(promises);
  }

  /**
   * @ngdoc overview
   * @name pedigree
   * @description
   * Get someone's ancestry or descendancy
   *
   * {@link https://familysearch.org/developers/docs/api/resources#pedigree FamilySearch API Docs}
   */

  /**
   * @ngdoc function
   * @name pedigree.functions:getAncestry
   * @function
   *
   * @description
   * Get the ancestors of a specified person and optionally a specified spouse with the following convenience functions
   *
   * - exists(ascendancyNumber) *ascendancyNumber* is the {@link http://en.wikipedia.org/wiki/Ahnentafel Ahnentafel number} of the person in the tree
   * - getId(ascendancyNumber)
   * - getGender(ascendancyNumber)
   * - getLifeSpan(ascendancyNumber)
   * - getName(ascendancyNumber)
   * - isLiving(ascendancyNumber)
   * - getGivenName(ascendancyNumber)
   * - getSurname(ascendancyNumber)
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Ancestry_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/gt726/ editable example}
   *
   * @param {String} id of the person
   * @param {Number} generations number of generations to retrieve (max 8)
   * @param {String=} spouseId spouse id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the ancestry
   */
  function getAncestry(id, generations, spouseId, opts) {
    return get('/platform/tree/ancestry', removeEmptyProperties({
      'person': id,
      'generations': generations,
      'spouse': spouseId}),
      {}, opts, objectExtender(ancestryConvenienceFunctions));
  }
  var ancestryConvenienceFunctions = {
    exists:        function(ascNum) { return !!findOrEmpty(this.persons, matchPersonAscNum(ascNum)).id; },
    getId:         function(ascNum) { return findOrEmpty(this.persons, matchPersonAscNum(ascNum)).id; },
    getGender:     function(ascNum) { return valueOrEmpty(findOrEmpty(this.persons, matchPersonAscNum(ascNum)).display).gender; },
    getLifeSpan:   function(ascNum) { return valueOrEmpty(findOrEmpty(this.persons, matchPersonAscNum(ascNum)).display).lifespan; },
    getName:       function(ascNum) { return valueOrEmpty(findOrEmpty(this.persons, matchPersonAscNum(ascNum)).display).name; },
    isLiving:      function(ascNum) { return findOrEmpty(this.persons, matchPersonAscNum(ascNum)).living; },
    getGivenName:  function(ascNum) { return findOrEmpty(firstOrEmpty(firstOrEmpty(findOrEmpty(this.persons, matchPersonAscNum(ascNum)).names).nameForms).parts,
      {type: 'http://gedcomx.org/Given'}).value; },
    getSurname:    function(ascNum) { return findOrEmpty(firstOrEmpty(firstOrEmpty(findOrEmpty(this.persons, matchPersonAscNum(ascNum)).names).nameForms).parts,
      {type: 'http://gedcomx.org/Surname'}).value; }
  };
  function matchPersonAscNum(ascNum) {
    return function(p) {
      //noinspection JSHint
      return p.display.ascendancyNumber == ascNum;
    };
  }

  //==================================================================================================================
  // PLUMBING
  //==================================================================================================================

  /**
   * @ngdoc overview
   * @name plumbing
   * @description
   * These are the low-level "plumbing" functions. You don't normally need to use these functions.
   */

  /**
   * @ngdoc function
   * @name plumbing.functions:getTotalProcessingTime
   * @function
   * @description
   * Return the total "processing time" spent in FamilySearch REST endpoints
   *
   * @return {Number} time in milliseconds
   */
  function getTotalProcessingTime() {
    return totalProcessingTime;
  }

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
  function setTotalProcessingTime(time) {
    totalProcessingTime = time;
  }

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
   * @param {Function=} responseDataExtender function to extend response data
   * @return {Object} a promise that behaves like promises returned by the http function specified during init
   */
  function get(url, params, headers, opts, responseDataExtender) {
    return http('GET', appendQueryParameters(url, params), extend({'Accept': 'application/x-gedcomx-v1+json'},headers), {}, opts, responseDataExtender);
  }

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
   * @param {Function=} responseDataExtender function to extend response data
   * @return {Object} a promise that behaves like promises returned by the http function specified during init
   */
  function post(url, data, headers, opts, responseDataExtender) {
    return http('POST', url, extend({'Content-type': 'application/x-www-form-urlencoded'},headers), data, opts, responseDataExtender);
  }

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
   * @param {Function=} responseDataExtender function to extend response data
   * @return {Object} a promise that behaves like promises returned by the http function specified during init
   */
  function put(url, data, headers, opts, responseDataExtender) {
    return http('PUT', url, extend({'Content-type': 'application/x-www-form-urlencoded'},headers), data, opts, responseDataExtender);
  }

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
   * @param {Function=} responseDataExtender function to extend response data
   * @return {Object} a promise that behaves like promises returned by the http function specified during init
   */
  function del(url, headers, opts, responseDataExtender) {
    return http('DELETE', url, headers, {}, opts, responseDataExtender);
  }

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
   * @param {Function=} responseDataExtender function to extend response data
   * @param {Number=} retries number of times to retry
   * @return {Object} a promise that behaves like promises returned by the http function specified during init
   */
  function http(method, url, headers, data, opts, responseDataExtender, retries) {
    // prepend the server
    var absoluteUrl = getAbsoluteUrl(server[environment], url);

    // append the access token as a query parameter to avoid cors pre-flight
    // this is detrimental to browser caching across sessions, which seems less bad than cors pre-flight requests
    // TODO investigate this further
    if (accessToken) {
      absoluteUrl = appendQueryParameters(absoluteUrl, {'access_token': accessToken});
    }

    // default retries
    if (isUndefined(retries) || retries === null) {
      retries = maxHttpRequestRetries;
    }

    // call the http wrapper
    var promise = httpWrapper(method, absoluteUrl, headers || {}, data || {}, opts || {});

    // process the response
    var d = deferredWrapper();
    var returnedPromise = extendHttpPromise(d.promise, promise);
    promise.then(
      function() {
        var processingTime = promise.getResponseHeader('X-PROCESSING-TIME');
        if (processingTime) {
          totalProcessingTime += parseInt(processingTime,10);
        }
        // TODO call this a responseDataInterceptor and return its results
        if (responseDataExtender) {
          responseDataExtender(promise.getData());
        }
        d.resolve.apply(d, arguments);
      },
      function() {
        var statusCode = promise.getStatusCode();
        console.log('http failure', statusCode, retries, promise.getAllResponseHeaders());
        if (retries > 0 && (statusCode === 429 || (statusCode === 401 && autoSignin))) {
          var retryAfter = 0;
          if (statusCode === 401) {
            accessToken = null; // clear the access token in case it has expired
          }
          else if (statusCode === 429) {
            var retryAfterHeader = promise.getResponseHeader('Retry-After');
            console.log('retryAfter',retryAfterHeader, promise.getAllResponseHeaders());
            if (retryAfterHeader) {
              retryAfter = parseInt(retryAfterHeader,10);
            }
            else {
              retryAfter = throttleRetryAfter;
            }
          }
          getAccessToken().then(
            function() { // promise will resolve right away if access code exists
              setTimeout(function() {
                promise = http(method, url, headers, data, opts, responseDataExtender, retries-1);
                extendHttpPromise(returnedPromise, promise);
                promise.then(
                  function() {
                    d.resolve.apply(d, arguments);
                  },
                  function() {
                    d.reject.apply(d, arguments);
                  });
              }, retryAfter);
            });
        }
        else {
          d.reject.apply(d, arguments);
        }
      });
    return returnedPromise;
  }

  //==================================================================================================================
  // HELPER FUNCTIONS
  //==================================================================================================================

  // borrowed from underscore.js
  function isArray(value) {
    //noinspection JSHint
    return Array.isArray ? Array.isArray(value) : Object.prototype.toString.call(value) == '[object Array]';
  }

  // borrowed from underscore.js
  function isObject(obj) {
    return obj === Object(obj);
  }

  // borrowed from underscore.js
  function isFunction(value) {
    //noinspection JSHint
    return typeof value == 'function' && Object.prototype.toString.call(value) == '[object Function]';
  }

  function isUndefined(value) {
    //noinspection JSHint
    return typeof value == 'undefined';
  }

  // borrowed from underscore.js
  function forEach(obj, iterator, context) {
    //noinspection JSHint
    if (obj == null) { // catches undefined as well
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
  }

  // simplified version of underscore's find
  // also, returns an empty object if the no matching elements found
  function findOrEmpty(arr, objOrFn) {
    var result = {};
    var isFn = isFunction(objOrFn);
    if (arr) {
      for (var i = 0, len = arr.length; i < len; i++) {
        var elm = arr[i];
        var matches;
        if (isFn) {
          matches = objOrFn.call(null, elm);
        }
        else {
          matches = true;
          for (var key in objOrFn) {
            if (objOrFn.hasOwnProperty(key) && elm[key] !== objOrFn[key]) {
              matches = false;
              break;
            }
          }
        }
        if (matches) {
          result = elm;
          break;
        }
      }
    }
    return result;
  }

  // returns the first element of the array or an empty object
  function firstOrEmpty(arr) {
    return (arr && arr.length > 0 ? arr[0] : {});
  }

  // returns the specified value or an empty object if the value is null or undefined
  function valueOrEmpty(val) {
    return isUndefined(val) || val === null ? {} : val;
  }

  function extend(dest) {
    forEach(Array.prototype.slice.call(arguments, 1), function(source) {
      if (source) {
        forEach(source, function(value, key) {
          dest[key] = value;
        });
      }
    });
    return dest;
  }

  function partialRight(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
      return fn.apply(this, Array.prototype.slice.call(arguments, 0).concat(args));
    };
  }

  function objectExtender(extensions) {
    return partialRight(extend, extensions);
  }

  // copy functions from source to dest, binding them to source
  function wrapFunctions(dest, source, fns) {
    forEach(fns, function(fn) {
      dest[fn] = function() {
        return source[fn].apply(source, arguments);
      };
    });
    return dest;
  }

  // extend the destPromise with functions from the sourcePromise
  function extendHttpPromise(destPromise, sourcePromise) {
    return wrapFunctions(destPromise, sourcePromise, ['getResponseHeader', 'getAllResponseHeaders', 'getStatusCode', 'getData', 'setResponseData']);
  }

  // "empty" properties are undefined, null, or the empty string
  function removeEmptyProperties(obj) {
    forEach(obj, function(value, key) {
      if (isUndefined(value) || value === null || value === '') {
        delete obj[key];
      }
    });
    return obj;
  }

  function getAbsoluteUrl(server, path) {
    if (!path.match(/^https?:\/\//)) {
      return server + (path.charAt(0) !== '/' ? '/' : '') + path;
    }
    else {
      return path;
    }
  }

  // Create a URL-encoded query string from an object
  function encodeQueryString(params) {
    var arr = [];
    forEach(params, function(value, key) {
      arr.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    });
    return arr.join('&');
  }

  function appendQueryParameters(url, params) {
    var queryString = encodeQueryString(params);
    if (queryString.length === 0) {
      return url;
    }
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + queryString;
  }

  function decodeQueryString(qs) {
    var obj = {}, segments = qs.substring(qs.indexOf('?')+1).split('&');
    forEach(segments, function(segment) {
      var kv = segment.split('=', 2);
      if (kv && kv[0]) {
        obj[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
      }
    });
    return obj;
  }

  function nextTick(cb) {
    setTimeout(function() {
      cb();
    },0);
  }

  // borrowed from AngularJS's implementation of $q
  // if passed a promise returns the promise; otherwise returns an a pseudo-promise returning the value
  function refPromise(value) {
    if (value && isFunction(value.then)) {
      return value;
    }
    return {
      then: function(callback) {
        var d = deferredWrapper();
        nextTick(function() {
          d.resolve(callback(value));
        });
        // TODO add getData to returned promise
        return d.promise;
      }
    };
  }

  // borrowed from AngularJS's implementation of $q
  function promiseAll(promises) {
    var d = deferredWrapper(),
      counter = 0,
      results = isArray(promises) ? [] : {};

    forEach(promises, function(promise, key) {
      counter++;
      // TODO use promise.getData() instead of value
      refPromise(promise).then(
        function(value) {
          if (results.hasOwnProperty(key)) {
            return;
          }
          // TODO customize how results are combined - pass in a fn that accepts a results, key, and value and returns extended results
          // call this fn the resultsExtender
          // have a default resultsExtender that does the default thing: init results
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
  }


  /**
   * Open a popup window for user to authenticate and authorize this app
   *
   * @private
   * @param {String} url window url
   * @param {Object} params query parameters to append to the window url
   * @return {window} reference to the popup window
   */
  function openPopup(url, params) {
    // figure out where the center is
    var
      screenX     = isUndefined(window.screenX) ? window.screenLeft : window.screenX,
      screenY     = isUndefined(window.screenY) ? window.screenTop : window.screenY,
      outerWidth  = isUndefined(window.outerWidth) ? document.documentElement.clientWidth : window.outerWidth,
      outerHeight = isUndefined(window.outerHeight) ? (document.documentElement.clientHeight - 22) : window.outerHeight,
      width       = params.width|| 780,
      height      = params.height || 500,
      left        = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top         = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features    = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;
    return window.open(appendQueryParameters(url, params),'',features);
  }
  /**
   * Polls the popup window location for the auth code
   *
   * @private
   * @param {window} popup window to poll
   * @return a promise of the auth code
   */
  function pollForAuthCode(popup) {
    var d = deferredWrapper();
    if (popup) {
      var i = setInterval(function() {
        try {
          if (popup.location.hostname === window.location.hostname) {
            var params = decodeQueryString(popup.location.href);
            clearInterval(i);
            popup.close();
            if (params['code']) {
              d.resolve(params['code']);
            }
            else {
              d.reject(params['error']);
            }
          }
        }
        catch(err) {}
      }, authCodePollDelay);
    }
    else {
      d.reject('Popup blocked');
    }
    return d.promise;
  }

  //==================================================================================================================
  // jQuery, Angular, and Node.js wrappers
  //==================================================================================================================

  function jqueryHttpWrapper(ajax) {
    return function(method, url, headers, data, opts) {
      // set up the options
      opts = extend({
        url: url,
        type: method,
        dataType: 'json',
        data: data
      }, opts);
      opts.headers = extend({}, headers, opts.headers);

      // make the call
      var jqXHR = ajax(opts);

      // process the response
      var d = deferredWrapper();
      var returnedPromise = d.promise;
      var responseData = null;
      var statusCode = null;
      jqXHR.then(
        function(data, textStatus, jqXHR) {
          responseData = data;
          statusCode = jqXHR.status;
          d.resolve(data, textStatus, jqXHR);
        },
        function(jqXHR, textStatus, errorThrown) {
          statusCode = jqXHR.status;
          responseData = jqXHR.responseText;
          d.reject(jqXHR, textStatus, errorThrown);
        });

      // add http-specific functions to the returned promise
      wrapFunctions(returnedPromise, jqXHR, ['getResponseHeader', 'getAllResponseHeaders']);
      returnedPromise.getData = function() {
        return responseData;
      };
      returnedPromise.getStatusCode = function() {
        return statusCode;
      };
      return returnedPromise;
    };
  }

  function jqueryDeferredWrapper(deferred) {
    return function() {
      var d = deferred();
      return {
        promise: d.promise(),
        resolve: d.resolve,
        reject: d.reject
      };
    };
  }

//  function qDeferredWrapper(deferred) {
//    return function() {
//      var d = deferred();
//      return {
//        promise: d.promise,
//        resolve: d.resolve,
//        reject: d.reject
//      };
//    };
//  }

  //==================================================================================================================
  // Exported functions
  //==================================================================================================================

  window.FamilySearch = {
    init: init,
    getAuthCode: getAuthCode,
    getAccessToken: getAccessToken,
    invalidateAccessToken: invalidateAccessToken,
    getCurrentUser: getCurrentUser,
    getCurrentUserPerson: getCurrentUserPerson,
    getPerson: getPerson,
    getMultiPerson: getMultiPerson,
    getAncestry: getAncestry,
    // plumbing
    get: get,
    post: post,
    put: put,
    del: del,
    http: http,
    getTotalProcessingTime: getTotalProcessingTime,
    setTotalProcessingTime: setTotalProcessingTime
  };
})();
