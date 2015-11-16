var FS = require('./../FamilySearch'),
    crypto = require('crypto');

/**
 * Methods that are only supported in node.
 */

/**
 * @ngdoc function
 * @name authentication.functions:getAccessTokenWithClientCredentials
 *
 * @description
 * Get an access token via client credentials. This is only supported in node
 * versions >= 0.12. This will throw an exception when using in the browser or
 * node versions that do not have the `crypto.privateEncrypt()` function.
 * 
 * @param {String} key The `private_key` value of [crypto.privateEncrypt()](https://nodejs.org/api/crypto.html#crypto_crypto_privateencrypt_private_key_buffer)
 * @param {Integer|String} time This parameter is only available for the sake of testing.
 */
FS.prototype.getAccessTokenWithClientCredentials = function(key, time){
  
  if(!crypto.privateEncrypt){
    throw new Error('Authentication via client credentials is not supported in the browser and requires node version 0.12 or greater.');
  }
  
  var self = this,
      
      // Get a timestamp in milliseconds
      timestamp = time || Date.now(),
  
      // Encrypt the timestamp using the private key
      secret = crypto.privateEncrypt(key, new Buffer(timestamp + '')),
      
      // Encode the secret into base64
      encodedSecret = new Buffer(secret).toString('base64');
      
  // Make the request
  return self.plumbing.post(self.settings.oauthServer[self.settings.environment] + '/token', {
      'grant_type': 'client_credentials',
      'client_id': self.settings.clientId,
      'client_secret': encodedSecret
    },
    // access token endpoint says it accepts json but it doesn't
    {'Content-Type': 'application/x-www-form-urlencoded'}).then(function(response){
      return self.handleAccessTokenResponse(response);
    });
};