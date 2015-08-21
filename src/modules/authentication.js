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
    return Promise.reject(new Error('This method can only be used in browsers.'));
  } else if(!!settings.expireCallback && !settings.autoSignin) {
    settings.expireCallback(this);
    // TODO: figure this out
    return Promise.reject(new Error('Not sure why we are rejecting here'));
  } else {
    return self.plumbing.getCollectionUrl('FSFT', 'http://oauth.net/core/2.0/endpoint/authorize').then(function(url) {
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
FS.prototype.handleAccessTokenResponse = function(response) {
  var self = this,
      data = response.getData();
  var accessToken = data['access_token'];
  if (accessToken) {
    self.helpers.setAccessToken(accessToken);
    response.getAccessToken = function(){
      return accessToken;
    };
    return response;
  }
  else {
    throw new Error(data['error']);
  }
};

/**
 * @ngdoc function
 * @name authentication.functions:getAccessToken

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
 * {@link http://jsfiddle.net/fqn6j7fs/ Editable Example}
 *
 * @param {String=} authCode auth code from getAuthCode; if not passed in, this function will call getAuthCode
 * @return {Object} a promise of the (string) access token.
 */
FS.prototype.getAccessToken = function(authCode) {
  var self = this,
      settings = self.settings,
      plumbing = self.plumbing;
      
  // Just return the access token if we already have one
  if (settings.accessToken) {
    return Promise.resolve(settings.accessToken);
  }
  
  else {
    
    // get auth code if not passed in
    var authCodePromise;
    if (authCode) {
      authCodePromise = Promise.resolve(authCode);
    }
    else {
      authCodePromise = self.getAuthCode();
    }
    
    return authCodePromise.then(function(authCode) {
      return plumbing.getCollectionUrl('FSFT', 'http://oauth.net/core/2.0/endpoint/token').then(function(url) {
        return plumbing.post(url, {
            'grant_type' : 'authorization_code',
            'code'       : authCode,
            'client_id'  : settings.clientId
          },
          {'Content-Type': 'application/x-www-form-urlencoded'}); // access token endpoint says it accepts json but it doesn't
      }).then(function(response){
        return self.handleAccessTokenResponse(response);
      });
    });
  }
};

/**
 * @ngdoc function
 * @name authentication.functions:getAccessTokenForMobile

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
  var self = this;
  if (self.settings.accessToken) {
    return Promise.resolve(self.settings.accessToken);
  }
  else {
    return self.plumbing.getCollectionUrl('FSFT', 'http://oauth.net/core/2.0/endpoint/token').then(function(url) {
      return self.plumbing.post(url, {
          'grant_type': 'password',
          'client_id' : self.settings.clientId,
          'username'  : userName,
          'password'  : password
        },
        {'Content-Type': 'application/x-www-form-urlencoded'}); // access token endpoint says it accepts json but it doesn't
    }).then(function(response){
      return self.handleAccessTokenResponse(response);
    });
  }
};

/**
 * @ngdoc function
 * @name authentication.functions:getOAuth2AuthorizeURL

 * 
 * @description
 * Get the URL that a user should be redirected to to begin
 * OAuth2 authentication.
 * 
 * @param {String=} Optional state parameter
 * @return {Object} Promise that is resolved with the OAuth2 authorize URL the user should be sent to
 */
FS.prototype.getOAuth2AuthorizeURL = function(state){
  var self = this,
      settings = self.settings;
  return this.plumbing.getCollectionUrl('FSFT', 'http://oauth.net/core/2.0/endpoint/authorize').then(function(url){
    var queryParams = {
      'response_type': 'code',
      'client_id': settings.clientId,
      'redirect_uri': settings.redirectUri
    };
    if(state){
      queryParams.state = state;
    }
    return self.helpers.appendQueryParameters(url, queryParams);
  });
};

/**
 * @ngdoc function
 * @name authentication.functions:hasAccessToken

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

 *
 * @description
 * Invalidate the current access token
 *
 * @return {Object} promise that is resolved once the access token has been invalidated
 */
FS.prototype.invalidateAccessToken = function() {
  var self = this;
  self.helpers.eraseAccessToken(true);
  return self.plumbing.getCollectionUrl('FSFT', 'http://oauth.net/core/2.0/endpoint/token').then(function(url) {
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
