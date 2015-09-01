var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc overview
 * @name searchAndMatch
 * @description
 * Functions related to search and match
 *
 * {@link https://familysearch.org/developers/docs/api/resources#search-and-match FamilySearch API Docs}
 */

var searchMatchResponseConvenienceFunctions = {
  getSearchResults: function() { return utils.maybe(this.getData()).entries || []; },
  getResultsCount: function() { return utils.maybe(this.getData()).results || 0; },
  getIndex: function() { return utils.maybe(this.getData()).index || 0; }
};

FS.prototype._getSearchMatchResponseMapper = function(response) {
  var self = this;
  utils.forEach(utils.maybe(response.getData()).entries, function(entry, index, obj){
    obj[index] = self.createSearchResult(entry);
  });
  return utils.extend(response, searchMatchResponseConvenienceFunctions);
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:getPersonSearch

 *
 * @description
 * Search people
 * The response includes the following convenience functions
 *
 * - `getContext()` - get the search context to pass into subsequent requests for additional results
 * - `getSearchResults()` - get the array of {@link searchAndMatch.types:constructor.SearchResult SearchResults} from the response
 * - `getResultsCount()` - get the total number of search results
 * - `getIndex()` - get the starting index of the results array
 *
 * ### Search parameters
 * In the list below, {relation} can be father, mother, or spouse.
 * For non-exact matches, append a tilde (~) to the end of the parameter value.
 * (The tilde works for name parameters; does it work for dates and places as well?)
 *
 * - `start` - index of first result
 * - `count` - number of results
 * - `context` - the search context token, which is returned from search requests and allows requests for subsequent pages
 * - `name` - full name
 * - `givenName`
 * - `surname`
 * - `gender` - male or female
 * - `birthDate`
 * - `birthPlace`
 * - `deathDate`
 * - `deathPlace`
 * - `marriageDate`
 * - `marriagePlace`
 * - {relation}`Name`
 * - {relation}`GivenName`
 * - {relation}`Surname`
 * - {relation}`BirthDate`
 * - {relation}`BirthPlace`
 * - {relation}`DeathDate`
 * - {relation}`DeathPlace`
 * - {relation}`MarriageDate`
 * - {relation}`MarriagePlace`
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Search_resource FamilySearch API Docs}
 *
 *
 * @param {Object} params described above
 * @return {Object} promise for the response
 */
FS.prototype.getPersonSearch = function(params) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSFT', 'person-search').then(function(url) {
    return self.plumbing.get(url, utils.removeEmptyProperties({
        q: utils.searchParamsFilter(utils.removeEmptyProperties(utils.extend({}, params))),
        start: params.start,
        count: params.count,
        context: params.context
      }), {'Accept': 'application/x-gedcomx-atom+json'});
  }).then(function(response){
    response.getContext = function() {
      return response.getHeader('X-FS-Page-Context');
    };
    return self._getSearchMatchResponseMapper(response);
  });
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:getPersonMatches

 *
 * @description
 * Get the matches (possible duplicates) for a person
 * The response includes the following convenience function
 *
 * - `getSearchResults()` - get the array of {@link searchAndMatch.types:constructor.SearchResult SearchResults} from the response
 * - `getResultsCount()` - get the total number of search results
 * - `getIndex()` - get the starting index of the results array
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Matches_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the person-matches endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getPersonMatches = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-gedcomx-atom+json'}).then(function(response){
    return self._getSearchMatchResponseMapper(response);
  });
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:getPersonMatchesQuery

 *
 * @description
 * Get matches for someone not in the tree
 * The response includes the following convenience function
 *
 * - `getSearchResults()` - get the array of {@link searchAndMatch.types:constructor.SearchResult SearchResults} from the response
 * - `getResultsCount()` - get the total number of search results
 * - `getIndex()` - get the starting index of the results array
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Search_resource FamilySearch API Docs}
 *
 *
 * @param {Object} params generally the same parameters as described for
 * {@link searchAndMatch.functions:getPersonSearch getPersonSearch}, with the the following differences:
 * `context` is not a valid parameter for match,
 * `fatherId`, `motherId`, and `spouseId` assist in finding matches for people whose relatives have already been matched, and
 * `candidateId` restricts matches to the person with that Id (what does this mean?)
 * @return {Object} promise for the response
 */
FS.prototype.getPersonMatchesQuery = function(params) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSFT', 'person-matches-query').then(function(url) {
    return self.plumbing.get(url, utils.removeEmptyProperties({
      q: utils.searchParamsFilter(utils.removeEmptyProperties(utils.extend({}, params))),
      start: params.start,
      count: params.count
    }), {'Accept': 'application/x-gedcomx-atom+json'});
  }).then(function(response){
    return self._getSearchMatchResponseMapper(response);
  });
};
