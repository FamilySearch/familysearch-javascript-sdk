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

var nonQueryParams = {start: true, count: true, context: true};

function quote(value) {
  value = value.replace(/[:"]/g, '').trim();
  return value.indexOf(' ') >= 0 ? '"' + value + '"' : value;
}

function getQuery(params) {
  return utils.map(utils.filter(utils.keys(params), function(key) { return !nonQueryParams[key]; }),
    function(key) { return key+':'+quote(params[key]); }).join(' ');
}

var searchMatchResponseConvenienceFunctions = {
  getSearchResults: function() { return this.entries || []; },
  getResultsCount: function() { return this.results || 0; },
  getIndex: function() { return this.index || 0; }
};

FS.prototype._getSearchMatchResponseMapper = function() {
  var self = this;
  return utils.compose(
    utils.objectExtender(searchMatchResponseConvenienceFunctions),
    function(response){
      utils.forEach(response.entries, function(entry, index, obj){
        obj[index] = self.createSearchResult(entry);
      });
      return response;
    }
  );
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:getPersonSearch
 * @function
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
 * {@link http://jsfiddle.net/ghsyjzLb/ editable example}
 *
 * @param {Object} params described above
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonSearch = function(params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-search'),
    function(url) {
      return self.plumbing.get(url, utils.removeEmptyProperties({
          q: getQuery(params),
          start: params.start,
          count: params.count,
          context: params.context
        }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        utils.compose(
          self._getSearchMatchResponseMapper(),
          function(obj, promise) {
            obj.getContext = function() {
              return promise.getResponseHeader('X-FS-Page-Context');
            };
            return obj;
          }
        )
      );
    });
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:getPersonMatches
 * @function
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
 * {@link http://jsfiddle.net/xb0ts69q/ editable example}
 *
 * @param {String} pid id of the person or full URL of the person-matches endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonMatches = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-matches-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self._getSearchMatchResponseMapper());
    });
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:getPersonMatchesQuery
 * @function
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
 * {@link http://jsfiddle.net/fdLrujkb/ editable example}
 *
 * @param {Object} params generally the same parameters as described for
 * {@link searchAndMatch.functions:getPersonSearch getPersonSearch}, with the the following differences:
 * `context` is not a valid parameter for match,
 * `fatherId`, `motherId`, and `spouseId` assist in finding matches for people whose relatives have already been matched, and
 * `candidateId` restricts matches to the person with that Id (what does this mean?)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonMatchesQuery = function(params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-matches-query'),
    function(url) {
      return self.plumbing.get(url, utils.removeEmptyProperties({
          q: getQuery(params),
          start: params.start,
          count: params.count
        }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self._getSearchMatchResponseMapper());
    });
};
