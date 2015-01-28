if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
  './globals',
  './helpers'
], function(globals, helpers) {
  /**
   * @ngdoc overview
   * @name utilities
   * @description
   * Utility functions
   *
   * {@link https://familysearch.org/developers/docs/api/resources#utilities FamilySearch API Docs}
   */

  var exports = {};

  /**
   * @ngdoc function
   * @name utilities.functions:getRedirectUrl
   * @function
   *
   * @description
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Redirect_resource FamilySearch API Docs}
   *
   * @param {Object=} params context (details, memories, ordinances, or changes), or person (id), or uri (takes precedence)
   * @return {string} URL with access token that will redirect the user to the specified location
   */
  exports.getRedirectUrl = function(params) {
    return helpers.appendAccessToken(helpers.appendQueryParameters(helpers.getAPIServerUrl('/platform/redirect'), params));
  };

  return exports;
});
