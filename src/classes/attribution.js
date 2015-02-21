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
 * @param {String=} changeMessage change message
 */
var Attribution = FS.Attribution = function(client, data) {
  FS.BaseClass.call(this, client, data);
  if(utils.isString(data)){
    this.changeMessage = data;
  }
};

/**
 * @ngdoc function
 * @name attribution.functions:createAttribution
 * @param {Object} data [Attribution](https://familysearch.org/developers/docs/api/gx/Attribution_json) data
 * @return {Object} {@link attribution.types:constructor.Attribution Attribution}
 * @description Create an {@link attribution.types:constructor.Attribution Attribution} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createAttribution = function(message){
  return new Attribution(this, message);
};

Attribution.prototype = {
  constructor: Attribution,
  /**
   * @ngdoc property
   * @name attribution.types:constructor.Attribution#modified
   * @propertyOf attribution.types:constructor.Attribution
   * @return {number} timestamp
   */

  /**
   * @ngdoc property
   * @name attribution.types:constructor.Attribution#changeMessage
   * @propertyOf attribution.types:constructor.Attribution
   * @return {string} change message
   */

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#$getAgentId
   * @methodOf attribution.types:constructor.Attribution
   * @function
   * @return {String} id of the agent (contributor) - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentId: function() { return maybe(this.contributor).resourceId; },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#$getAgentUrl
   * @methodOf attribution.types:constructor.Attribution
   * @function
   * @return {String} URL of the agent (contributor) - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentUrl: function() { return this.$client.helpers.removeAccessToken(maybe(this.contributor).resource); },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#$getAgent
   * @methodOf attribution.types:constructor.Attribution
   * @function
   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  $getAgent: function() { return this.$client.getAgent(this.$getAgentUrl() || this.$getAgentId()); }
};
