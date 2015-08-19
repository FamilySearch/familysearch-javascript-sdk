var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name attribution
 * @description
 * Functions related to an attribution object
 */

/**
 * @ngdoc function
 * @name attribution.types:constructor.Attribution
 * @description
 *
 * Attribution
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object|string} data raw object data or change message
 */
var Attribution = FS.Attribution = function(client, data) {
  
  // Allow an attribution to be created by just passing in
  // a string that represents the change message. This is particularly
  // useful when saving changes that accept a change message because
  // all other parts of the attribution are ignored by the server therefore
  // there's no reason to try and set them.
  if(utils.isString(data)){
    data = {
      changeMessage: data
    };
  }
  
  FS.BaseClass.call(this, client, data);
  
};

/**
 * @ngdoc function
 * @name attribution.functions:createAttribution
 * @param {Object} data [Attribution](https://familysearch.org/developers/docs/api/gx/Attribution_json) data
 * @return {Object} {@link attribution.types:constructor.Attribution Attribution}
 * @description Create an {@link attribution.types:constructor.Attribution Attribution} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createAttribution = function(data){
  return new Attribution(this, data);
};

Attribution.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Attribution,
  
  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#getModifiedTimestamp
   * @methodOf attribution.types:constructor.Attribution
   * @return {number} timestamp
   */
  getModifiedTimestamp: function() { return this.data.modified; },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#getChangeMessage
   * @methodOf attribution.types:constructor.Attribution
   * @return {string} change message
   */
  getChangeMessage: function() { return this.data.changeMessage; },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#getAgentId
   * @methodOf attribution.types:constructor.Attribution
   * @function
   * @return {String} id of the agent (contributor) - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentId: function() { return maybe(this.data.contributor).resourceId; },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#getAgentUrl
   * @methodOf attribution.types:constructor.Attribution
   * @function
   * @return {String} URL of the agent (contributor) - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentUrl: function() { return this.client.helpers.removeAccessToken(maybe(this.data.contributor).resource); },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#getAgent
   * @methodOf attribution.types:constructor.Attribution
   * @function
   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  getAgent: function() { return this.client.getAgent(this.getAgentUrl()); }
});
