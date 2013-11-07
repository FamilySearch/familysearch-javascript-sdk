Overview
========

To use the SDK, you need to

1. init the SDK; e.g.,

        FamilySearch.init({
          app_key: 'YOUR_ACCESS_KEY_GOES_HERE',
          environment: 'sandbox',
          // auth_callback is the URI you registered with FamilySearch;
          // it does not need to exist but it must have the same host and port as the server running your script
          auth_callback: 'REDIRECT_GOES_HERE',
          http_function: jQuery.ajax,
          deferred_function: jQuery.Deferred,
          logging: true
        });

2. get an access token; e.g.,

        FamilySearch.getAccessToken().then(function(response) {
          // now you have an access token
        });

3. make API calls; e.g.,

        FamilySearch.getCurrentUser().then(function(response) {
          // now you have the response
        });

Promises
--------

Most functions return promises.  The returned promises are roughly identical to the promises returned by the
`http_function` you passed into the `FamilySearch.init` call.

// TODO explain the difference between promises returned by API and plumbing functions

**jQuery**

Requires jQuery 1.8 or later.

If you pass `jQuery.ajax` and `jQuery.Deferred` into the `FamilySearch.init` call, the returned promises
will have the following methods, described in detail at http://api.jquery.com/jQuery.ajax/

* done(function(data, textStatus, jqXHR) {})
* fail(function(jqXHR, textStatus, errorThrown) {})
* always(function(data|jqXHR, textStatus, jqXHR|errorThrown) {})
* then(function(data, textStatus, jqXHR) {}, function(jqXHR, textStatus, errorThrown) {})
* getResponseHeader(header)
* getAllResponseHeaders()

In addition, the following function is available when the promise is fulfilled

* getData()

And the following function is available when the promise is fulfilled or rejected

* getStatusCode()

The following functions and properties are not available on the promise returned, but are available on the jqXHR
parameter of the done, fail, always, and then methods

* abort()
* statusCode()
* responseText
* responseXML
* readyState
* status
* statusText

**AngularJS -- not yet implemented**

If you pass `$http` and `$q.defer` into the `FamilySearch.init` call, the returned promises
will have the following methods, described in detail at http://docs.angularjs.org/api/ng.$http

* success(function(data, status, headers, config) {})
* error(function(data, status, headers, config) {})
* then(function({data: data, status: status, headers: headers, config: config}) {}, function({data: data, status: status, headers: headers, config: config}) {})
* finally(function(data, status, headers, config) {}) // TODO is this right?

In addition, the following function is available when the promise is fulfilled

* getData()

And the following functions are available when the promise is fulfilled or rejected

* getResponseHeader(header)
* getAllResponseHeaders()
* getStatusCode()

**Node.js -- not yet implemented**
