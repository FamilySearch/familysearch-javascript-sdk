var FS = require('./../FamilySearch');

/**
 * @ngdoc overview
 * @name ordinances
 * @description
 * Functions for interacting with the FamilySearch Ordinance API
 *
 * {@link https://familysearch.org/developers/docs/api/resources#ordinances FamilySearch API Docs}
 */
 
/**
 * @ngdoc function
 * @name ordinances.functions:hasOrdinancesAccess
 *
 * @description
 * Determine whether the current user has access to LDS ordinances. The returned
 * promise will be resolved if the user has access to LDS ordinances; it will be
 * rejected if the user does not have access.
 *
 * {@link https://familysearch.org/developers/docs/api/ordinances/Ordinances_resource API Docs}
 *
 * @return {Object} promise for the response
 */
FS.prototype.hasOrdinancesAccess = function(){
  return this.plumbing.get('/platform/ordinances/ordinances');
};

/**
 * @ngdoc function
 * @name ordinances.functions:getOrdinancesPolicy
 *
 * @description
 * Get the policy that must be agreed to by the user in order to reserve an LDS ordinance.
 * The policy text is retrieved from the response by calling `response.getData()`.
 *
 * {@link https://familysearch.org/developers/docs/api/ordinances/Ordinance_Policy_resource API Docs}
 *
 * @param {String=} format Response format: `text` or `html` (defaults to `text`)
 * @param {String=} language Value of the `Accept-Language` header that determines the language of the policy
 * @return {Object} promise for the response
 */
FS.prototype.getOrdinancesPolicy = function(format, language){
  var headers = {
    'Accept': 'text/plain'
  };
  if(format === 'html'){
    headers.Accept = 'text/html';
  }
  
  if(language){
    headers['Accept-Language'] = language;
  }
  
  // TODO: get url from the collection
  // It's not availabe in the collection as of 10/10/2015
  return this.plumbing.get('/platform/ordinances/policy', null, headers);
};