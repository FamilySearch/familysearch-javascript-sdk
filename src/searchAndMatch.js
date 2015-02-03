if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
  './globals',
  './helpers',
  './plumbing'
], function(globals, helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name searchAndMatch
   * @description
   * Functions related to search and match
   *
   * {@link https://familysearch.org/developers/docs/api/resources#search-and-match FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult
   * @description
   *
   * Reference from a person or relationship to a source
   */
  var SearchResult = exports.SearchResult = function() {

  };

  exports.SearchResult.prototype = {
    constructor: SearchResult,
    /**
     * @ngdoc property
     * @name searchAndMatch.types:constructor.SearchResult#id
     * @propertyOf searchAndMatch.types:constructor.SearchResult
     * @return {String} Id of the person for this search result
     */

    /**
     * @ngdoc property
     * @name searchAndMatch.types:constructor.SearchResult#title
     * @propertyOf searchAndMatch.types:constructor.SearchResult
     * @return {String} Id and name
     */

    /**
     * @ngdoc property
     * @name searchAndMatch.types:constructor.SearchResult#score
     * @propertyOf searchAndMatch.types:constructor.SearchResult
     * @return {Number} higher is better
     */

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getPerson
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @description
     *
     * **Note: Be aware that the `Person` objects returned from SearchResults do not have as much information
     * as `Person` objects returned from the various person and pedigree functions.**
     *
     * @param {string} pid id of the person
     * @return {Person} the {@link person.types:constructor.Person Person} for this Id in this search result
     */
    $getPerson: function(pid) {
      return helpers.find(maybe(maybe(this.content).gedcomx).persons, {id: pid});
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getPrimaryPerson
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {Person} the primary {@link person.types:constructor.Person Person} for this search result
     */
    $getPrimaryPerson: function() {
      return this.$getPerson(this.id);
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getFullPrimaryPerson
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
     */
    $getFullPrimaryPerson: function() { return globals.getPerson(this.id); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getFatherIds
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {String[]} array of father Id's for this search result
     */
    $getFatherIds: function() {
      var primaryId = this.id, self = this;
      return helpers.uniq(helpers.map(
        helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
          return r.type === 'http://gedcomx.org/ParentChild' &&
            r.person2.resourceId === primaryId &&
            r.person1 &&
            maybe(self.$getPerson(r.person1.resourceId).gender).type === 'http://gedcomx.org/Male';
        }),
        function(r) { return r.person1.resourceId; }
      ));
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getFathers
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {Person[]} array of father {@link person.types:constructor.Person Persons} for this search result
     */
    $getFathers: function() { return helpers.map(this.$getFatherIds(), this.$getPerson, this); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getMotherIds
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {String[]} array of mother Id's for this search result
     */
    $getMotherIds: function() {
      var primaryId = this.id, self = this;
      return helpers.uniq(helpers.map(
        helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
          return r.type === 'http://gedcomx.org/ParentChild' &&
            r.person2.resourceId === primaryId &&
            r.person1 &&
            maybe(self.$getPerson(r.person1.resourceId).gender).type !== 'http://gedcomx.org/Male';
        }),
        function(r) { return r.person1.resourceId; }
      ));
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getMothers
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {Person[]} array of mother {@link person.types:constructor.Person Persons} for this search result
     */
    $getMothers: function() { return helpers.map(this.$getMotherIds(), this.$getPerson, this); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getSpouseIds
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {String[]} array of spouse Id's for this search result
     */
    $getSpouseIds:  function() {
      var primaryId = this.id;
      return helpers.uniq(helpers.map(
        helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
          return r.type === 'http://gedcomx.org/Couple' &&
            (r.person1.resourceId === primaryId || r.person2.resourceId === primaryId);
        }),
        function(r) { return r.person1.resourceId === primaryId ? r.person2.resourceId : r.person1.resourceId; }
      ));
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getSpouses
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {Person[]} array of spouse {@link person.types:constructor.Person Persons} for this search result
     */
    $getSpouses: function() { return helpers.map(this.$getSpouseIds(), this.$getPerson, this); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getChildIds
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {String[]} array of child Id's for this search result
     */
    $getChildIds:  function() {
      var primaryId = this.id;
      return helpers.uniq(helpers.map(
        helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
          return r.type === 'http://gedcomx.org/ParentChild' &&
            r.person1.resourceId === primaryId &&
            r.person2;
        }),
        function(r) { return r.person2.resourceId; }
      ));
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:constructor.SearchResult#$getChildren
     * @methodOf searchAndMatch.types:constructor.SearchResult
     * @function
     * @return {Person[]} array of spouse {@link person.types:constructor.Person Persons} for this search result
     */
    $getChildren: function() { return helpers.map(this.$getChildIds(), this.$getPerson, this); }
  };

  var nonQueryParams = {start: true, count: true, context: true};

  function quote(value) {
    value = value.replace(/[:"]/g, '').trim();
    return value.indexOf(' ') >= 0 ? '"' + value + '"' : value;
  }

  function getQuery(params) {
    return helpers.map(helpers.filter(helpers.keys(params), function(key) { return !nonQueryParams[key]; }),
      function(key) { return key+':'+quote(params[key]); }).join(' ');
  }

  var searchMatchResponseConvenienceFunctions = {
    getSearchResults: function() { return this.entries || []; },
    getResultsCount: function() { return this.results || 0; },
    getIndex: function() { return this.index || 0; }
  };

  function getSearchMatchResponseMapper() {
    return helpers.compose(
      helpers.objectExtender(searchMatchResponseConvenienceFunctions),
      helpers.constructorSetter(SearchResult, 'entries'),
      globals.personMapper(function(response) {
        return helpers.map(maybe(response).entries, function(entry) {
          return maybe(entry.content).gedcomx;
        });
      }));
  }

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
   * {@link http://jsfiddle.net/DallanQ/2abrY/ editable example}
   *
   * @param {Object} params described above
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonSearch = function(params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-search'),
      function(url) {
        return plumbing.get(url, helpers.removeEmptyProperties({
            q: getQuery(params),
            start: params.start,
            count: params.count,
            context: params.context
          }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
          helpers.compose(
            getSearchMatchResponseMapper(),
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
   * {@link http://jsfiddle.net/DallanQ/5uwyf/ editable example}
   *
   * @param {String} pid id of the person or full URL of the person-matches endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMatches = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-matches-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
          getSearchMatchResponseMapper());
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
   * {@link http://jsfiddle.net/DallanQ/hhcLP/ editable example}
   *
   * @param {Object} params generally the same parameters as described for
   * {@link searchAndMatch.functions:getPersonSearch getPersonSearch}, with the the following differences:
   * `context` is not a valid parameter for match,
   * `fatherId`, `motherId`, and `spouseId` assist in finding matches for people whose relatives have already been matched, and
   * `candidateId` restricts matches to the person with that Id (what does this mean?)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMatchesQuery = function(params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-matches-query'),
      function(url) {
        return plumbing.get(url, helpers.removeEmptyProperties({
            q: getQuery(params),
            start: params.start,
            count: params.count
          }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
          getSearchMatchResponseMapper());
      });
  };

  return exports;
});
