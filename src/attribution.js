var FS = require('./FamilySearch'),
    utils = require('./utils'),
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
var Attribution = FS.Attribution = function(client, changeMessage) {
  this.$client = client;
  if (changeMessage) {
    this.changeMessage = changeMessage;
  }
};

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
  $getAgentUrl: function() { return utils.removeAccessToken(maybe(this.contributor).resource); },

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution#$getAgent
   * @methodOf attribution.types:constructor.Attribution
   * @function
   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  $getAgent: function() { return this.$client.getAgent(this.$getAgentUrl() || this.$getAgentId()); }
};
