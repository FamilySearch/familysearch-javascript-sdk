var FS = require('./../FamilySearch'),
    ursa = require('ursa');

/**
 * Methods that are only supported in node.
 */

/**
 * @ngdoc function
 * @name authentication.functions:getAccessTokenWithClientCredentials
 *
 * @description
 * Get an access token via client credentials.
 * 
 * @param {String} key A PEM-encoded key. Matches the `pem` parameter of [ursa.createPrivateKey()](https://github.com/quartzjer/ursa#ursacreateprivatekeypem-password-encoding).
 * @param {String=} password The password for descrypting the key, if necessary.
 * @param {Integer|String=} time This parameter is only available for the sake of testing. Do not use it in production.
 */
FS.prototype.getAccessTokenWithClientCredentials = function(key, password, time){
  
  var self = this,
  
      // URSA key object
      ukey = ursa.createPrivateKey(key, password),
      
      // Get a timestamp in milliseconds
      timestamp = time || Date.now(),
  
      // Encrypt the timestamp using the private key
      secret = ukey.privateEncrypt(timestamp + '', 'utf8', 'base64');
      
  // Make the request
  return self.plumbing.post(self.settings.oauthServer[self.settings.environment] + '/token', {
      'grant_type': 'client_credentials',
      'client_id': self.settings.clientId,
      'client_secret': secret
    },
    // access token endpoint says it accepts json but it doesn't
    {'Content-Type': 'application/x-www-form-urlencoded'}).then(function(response){
      return self.handleAccessTokenResponse(response);
    });
};