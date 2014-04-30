define([
  'globals',
  'helpers',
  'plumbing'
], function(globals, helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name authentication
   * @description
   * These are the authentication functions. `getAccessToken` is the main function.
   * If you do not pass in an authorization code to `getAccessToken`, it will call the `getAuthCode` function to get one.
   *
   * {@link https://familysearch.org/developers/docs/api/resources#authentication FamilySearch API docs}
   */

  var exports = {};

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
  exports.getAuthCode = function() {
    return plumbing.getUrl('http://oauth.net/core/2.0/endpoint/authorize').then(function(url) {
      var popup = openPopup(url, {
        'response_type' : 'code',
        'client_id'     : globals.appKey,
        'redirect_uri'  : globals.authCallbackUri
      });
      return pollForAuthCode(popup);
    });
  };

  /**
   * Process the response from the access token endpoint
   *
   * @param {Object} promise promise from the access token endpoint
   * @param {Object} accessTokenDeferred deferred that needs to be resolved or rejected
   */
  function handleAccessTokenResponse(promise, accessTokenDeferred) {
    promise.then(
      function(data) {
        var accessToken = data['access_token'];
        if (accessToken) {
          helpers.setAccessToken(accessToken);
          accessTokenDeferred.resolve(accessToken);
        }
        else {
          accessTokenDeferred.reject(data['error']);
        }
      },
      function() {
        accessTokenDeferred.reject.apply(accessTokenDeferred, arguments);
      });
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
  // plumbing.http may call getAccessToken if there was an error; copy into globals to avoid circular dependency
  globals.getAccessToken = exports.getAccessToken = function(authCode) {
    var accessTokenDeferred = globals.deferredWrapper();
    if (globals.accessToken) {
      helpers.nextTick(function() {
        accessTokenDeferred.resolve(globals.accessToken);
      });
    }
    else {
      // get auth code if not passed in
      var authCodePromise;
      if (authCode) {
        authCodePromise = helpers.refPromise(authCode);
      }
      else {
        authCodePromise = exports.getAuthCode();
      }
      authCodePromise.then(
        function(authCode) {
          // get the access token given the auth code
          plumbing.getUrl('http://oauth.net/core/2.0/endpoint/token').then(function(url) {
            var promise = plumbing.post(url, {
                'grant_type' : 'authorization_code',
                'code'       : authCode,
                'client_id'  : globals.appKey
              },
              {'Content-Type': 'application/x-www-form-urlencoded'}); // access token endpoint says it accepts json but it doesn't
            handleAccessTokenResponse(promise, accessTokenDeferred);
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
  exports.getAccessTokenForMobile = function(userName, password) {
    var accessTokenDeferred = globals.deferredWrapper();
    plumbing.getUrl('http://oauth.net/core/2.0/endpoint/token').then(function(url) {
      var promise = plumbing.post(url, {
          'grant_type': 'password',
          'client_id' : globals.appKey,
          'username'  : userName,
          'password'  : password
        },
        {'Content-Type': 'application/x-www-form-urlencoded'}); // access token endpoint says it accepts json but it doesn't
      handleAccessTokenResponse(promise, accessTokenDeferred);
    });
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
  exports.hasAccessToken = function() {
    return !!globals.accessToken;
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
  exports.invalidateAccessToken = function() {
    helpers.eraseAccessToken();
    return helpers.chainHttpPromises(
      plumbing.getUrl('http://oauth.net/core/2.0/endpoint/token'),
      function() {
        // See issue #48 - issuing the delete to FamilySearch returns an error
        // so for not, just return an empty string
        //return plumbing.del(url);
        return '';
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
  function openPopup(url, params) {
    // figure out where the center is
    var
      screenX     = helpers.isUndefined(window.screenX) ? window.screenLeft : window.screenX,
      screenY     = helpers.isUndefined(window.screenY) ? window.screenTop : window.screenY,
      outerWidth  = helpers.isUndefined(window.outerWidth) ? document.documentElement.clientWidth : window.outerWidth,
      outerHeight = helpers.isUndefined(window.outerHeight) ? (document.documentElement.clientHeight - 22) : window.outerHeight,
      width       = params.width|| 780,
      height      = params.height || 500,
      left        = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top         = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features    = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;
    return window.open(helpers.appendQueryParameters(url, params),'',features);
  }

  /**
   * Polls the popup window location for the auth code
   *
   * @private
   * @param {window} popup window to poll
   * @return a promise of the auth code
   */
  function pollForAuthCode(popup) {
    var d = globals.deferredWrapper();
    if (popup) {
      var i = setInterval(function() {
        try {
          if (popup.location.hostname === window.location.hostname) {
            var params = helpers.decodeQueryString(popup.location.href);
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
      }, globals.authCodePollDelay);
    }
    else {
      d.reject('Popup blocked');
    }
    return d.promise;
  }

  return exports;
});
