Overview
========

To use the SDK, you need to

1. init the SDK; e.g.,

        FamilySearch.init({
          app_key: 'YOUR_ACCESS_KEY_GOES_HERE',
          environment: 'sandbox',
          // auth_callback is the URI you registered with FamilySearch;
          // it does not need to exist but it must have the same host and port as the server for familysearch-javascript-sdk.js
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

        FamilySearch.get('/platform/users/current').then(function(response) {
          // now you have the response
        });
