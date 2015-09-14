var FS = require('./../FamilySearch');

/**
 * @ngdoc overview
 * @name utilities
 * @description
 * Utility functions
 *
 * {@link https://familysearch.org/developers/docs/api/resources#utilities FamilySearch API Docs}
 */

/**
 * @ngdoc function
 * @name utilities.functions:getRedirectUrl
 *
 * @description
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Redirect_resource FamilySearch API Docs}
 *
 * @param {Object=} params context (details, memories, ordinances, or changes), or person (id), or uri (takes precedence)
 * @return {string} URL with access token that will redirect the user to the specified location
 */
FS.prototype.getRedirectUrl = function(params) {
  return this.helpers.appendAccessToken(this.helpers.appendQueryParameters(this.helpers.getAPIServerUrl('/platform/redirect'), params));
};

/**
 * @ngdoc function
 * @name utilities.functions:getPendingModifications
 *
 * @description Get a list of the pending modifications for the API.
 * The response includes the following convenience function
 *
 * - `getPendingModifications()` - get an array of the pending modifications from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Pending_Modifications_resource FamilySearch API Docs}
 *
 * @return {Object} Promise for the response
 */
FS.prototype.getPendingModifications = function() {
  return this.plumbing.get('/platform/pending-modifications').then(function(response){
    response.getPendingModifications = function(){
      return response.getData().features;
    };
    return response;
  });
};