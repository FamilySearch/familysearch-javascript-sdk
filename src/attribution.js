define([
  'helpers',
  'plumbing',
  'user'
], function(helpers, plumbing, user) {
  /**
   * @ngdoc overview
   * @name attribution
   * @description
   * Functions related to an attribution object
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name attribution.types:constructor.Attribution
   * @description
   *
   * Attribution
   * @param {String=} changeMessage change message
   */
  var Attribution = exports.Attribution = function(changeMessage) {
    if (changeMessage) {
      this.changeMessage = changeMessage;
    }
  };

  exports.Attribution.prototype = {
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
    $getAgentUrl: function() { return helpers.removeAccessToken(maybe(this.contributor).resource); },

    /**
     * @ngdoc function
     * @name attribution.types:constructor.Attribution#$getAgent
     * @methodOf attribution.types:constructor.Attribution
     * @function
     * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
     */
    $getAgent: function() { return user.getAgent(this.$getAgentUrl()); }
  };

  return exports;
});
