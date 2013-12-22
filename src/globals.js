define({
  appKey: null,
  environment: null,
  httpWrapper: null,
  deferredWrapper: null,
  setTimeout: null,
  clearTimeout: null,
  authCallbackUri: null,
  autoSignin: false,
  autoExpire: false,
  accessToken: null,
  saveAccessToken: false,
  logging: false,
  // constants for now, but could become options in the future
  accessTokenCookie: 'FS_ACCESS_TOKEN',
  authCodePollDelay: 50,
  defaultThrottleRetryAfter: 500,
  maxHttpRequestRetries: 5,
  maxAccessTokenInactivityTime: 3540000, // 59 minutes to be safe
  maxAccessTokenCreationTime:  86340000, // 23 hours 59 minutes to be safe
  apiServer: {
    'sandbox'   : 'https://sandbox.familysearch.org',
    'staging'   : 'https://stage.familysearch.org',
    'production': 'https://familysearch.org'
  },
  oauthServer: {
    'sandbox'   : 'https://sandbox.familysearch.org/cis-web/oauth2/v3',
    'staging'   : 'https://identbeta.familysearch.org/cis-web/oauth2/v3',
    'production': 'https://ident.familysearch.org/cis-web/oauth2/v3'
  }
});
