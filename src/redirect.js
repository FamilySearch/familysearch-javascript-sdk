var FS = require('./FamilySearch');

/**
 * @ngdoc overview
 * @name redirect
 * @description
 * Utility functions
 *
 * {@link https://familysearch.org/developers/docs/api/resources#redirect FamilySearch API Docs}
 */

/**
 * @ngdoc function
 * @name redirect.functions:getRedirectUrl
 * @function
 *
 * @description
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Redirect_resource FamilySearch API Docs}
 *
 * @param {Object=} params context (details, memories, ordinances, or changes), or person (id), or uri (takes precedence)
 * @return {string} URL with access token that will redirect the user to the specified location
 */
FS.getRedirectUrl = function(params) {
  return helpers.appendAccessToken(helpers.appendQueryParameters(helpers.getAPIServerUrl('/platform/redirect'), params));
};