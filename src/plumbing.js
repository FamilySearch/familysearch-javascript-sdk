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
    
    var body = self.transformData(data, headers['Content-Type']);
    
    // Make the HTTP request
    return fetch(absoluteUrl, {
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
    
    // Handle throttling
    .then(function(response){
      if ((method === 'GET' && response.status >= 500 && retries > 0) || response.status === 429) {
        //var retryAfterHeader = response.headers.get('Retry-After');
        //var retryAfter = retryAfterHeader ? parseInt(retryAfterHeader,10) : self.settings.defaultThrottleRetryAfter;
        return self.http(method, url, headers, data, retries-1);
      } else {
        return response;
      }
    })
    
    // Catch all other errors
    .then(function(response){
      if (response.status >= 200 && response.status < 400) {
        return response;
      } else {
        self.helpers.log('http failure', response.status, retries, response.headers.raw());
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    })
    
    // Process the response body and make available at the `body` property
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
    
    // Processing time
    .then(function(response){
      self.helpers.refreshAccessToken();
      var processingTime = response.headers.get('X-PROCESSING-TIME');
      if (processingTime) {
        self.totalProcessingTime += parseInt(processingTime,10);
      }
      return response;
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

module.exports = Plumbing;