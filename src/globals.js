/**
 * TODO: Add interface for modifying these so that you
 * don't have to pass the same config options
 * to each new instance
 */

module.exports = {
  clientId: null,
  environment: null,
  redirectUri: null,
  autoSignin: false,
  autoExpire: false,
  accessToken: null,
  saveAccessToken: false,
  logging: false,
  // constants for now, but could become options in the future
  accessTokenCookie: 'FS_ACCESS_TOKEN',
  authCodePollDelay: 50,
  defaultThrottleRetryAfter: 1000,
  maxHttpRequestRetries: 4,
  maxAccessTokenInactivityTime: 3540000, // 59 minutes to be safe
  maxAccessTokenCreationTime:  86340000, // 23 hours 59 minutes to be safe
  apiServer: {
    'sandbox'   : 'https://sandbox.familysearch.org',
    'staging'   : 'https://stage.familysearch.org',
    'beta'      : 'https://beta.familysearch.org',
    'production': 'https://familysearch.org'
  },
  oauthServer: {
    'sandbox'   : 'https://identint.familysearch.org/cis-web/oauth2/v3',
    'staging'   : 'https://identbeta.familysearch.org/cis-web/oauth2/v3',
    'beta'      : 'https://identbeta.familysearch.org/cis-web/oauth2/v3',
    'production': 'https://ident.familysearch.org/cis-web/oauth2/v3'
  },
  collectionsUrl: '/platform/collections'
};
