define([
  'helpers',
  'person',
  'plumbing'
], function(helpers, person, plumbing) {
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
   * @name searchAndMatch.types:type.SearchResult
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
     * @name searchAndMatch.types:type.SearchResult#id
     * @propertyOf searchAndMatch.types:type.SearchResult
     * @return {String} Id of the person for this search result
     */

    /**
     * @ngdoc property
     * @name searchAndMatch.types:type.SearchResult#title
     * @propertyOf searchAndMatch.types:type.SearchResult
     * @return {String} Id and Name
     */

    /**
     * @ngdoc property
     * @name searchAndMatch.types:type.SearchResult#score
     * @propertyOf searchAndMatch.types:type.SearchResult
     * @return {Number} higher is better
     */

    /**
     * @ngdoc property
     * @name searchAndMatch.types:type.SearchResult#confidence
     * @propertyOf searchAndMatch.types:type.SearchResult
     * @return {Number} unsure how this relates to score
     */

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getPerson
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @description
     *
     * **Note: Be aware that the `Person` objects returned from SearchResults do not have as much information
     * as `Person` objects returned from the various person and pedigree functions.**
     *
     * @return {Person} the {@link person.types:type.Person Person} for this Id in this search result
     */
    getPerson: function(id) {
      return helpers.find(maybe(maybe(this.content).gedcomx).persons, {id: id});
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getPrimaryPerson
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {Person} the primary {@link person.types:type.Person Person} for this search result
     */
    getPrimaryPerson: function() {
      return this.getPerson(this.id);
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getFatherIds
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {String[]} array of father Id's for this search result
     */
    getFatherIds: function() {
      var primaryId = this.id, self = this;
      return helpers.uniq(helpers.map(
        helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
          return r.type === 'http://gedcomx.org/ParentChild' &&
            r.person2.resourceId === primaryId &&
            r.person1 &&
            maybe(self.getPerson(r.person1.resourceId).gender).type === 'http://gedcomx.org/Male';
        }),
        function(r) { return r.person1.resourceId; }
      ));
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getFathers
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {Person[]} array of father {@link person.types:type.Person Persons} for this search result
     */
    getFathers: function() { return helpers.map(this.getFatherIds(), this.getPerson, this); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getMotherIds
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {String[]} array of mother Id's for this search result
     */
    getMotherIds: function() {
      var primaryId = this.id, self = this;
      return helpers.uniq(helpers.map(
        helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
          return r.type === 'http://gedcomx.org/ParentChild' &&
            r.person2.resourceId === primaryId &&
            r.person1 &&
            maybe(self.getPerson(r.person1.resourceId).gender).type !== 'http://gedcomx.org/Male';
        }),
        function(r) { return r.person1.resourceId; }
      ));
    },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getMothers
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {Person[]} array of mother {@link person.types:type.Person Persons} for this search result
     */
    getMothers: function() { return helpers.map(this.getMotherIds(), this.getPerson, this); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getSpouseIds
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {String[]} array of spouse Id's for this search result
     */
    getSpouseIds:  function() {
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
     * @name searchAndMatch.types:type.SearchResult#getSpouses
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {Person[]} array of spouse {@link person.types:type.Person Persons} for this search result
     */
    getSpouses: function() { return helpers.map(this.getSpouseIds(), this.getPerson, this); },

    /**
     * @ngdoc function
     * @name searchAndMatch.types:type.SearchResult#getChildIds
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {String[]} array of child Id's for this search result
     */
    getChildIds:  function() {
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
     * @name searchAndMatch.types:type.SearchResult#getChildren
     * @methodOf searchAndMatch.types:type.SearchResult
     * @function
     * @return {Person[]} array of spouse {@link person.types:type.Person Persons} for this search result
     */
    getChildren: function() { return helpers.map(this.getChildIds(), this.getPerson, this); }
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
   * - `getSearchResults()` - get the array of {@link searchAndMatch.types:type.SearchResult SearchResults} from the response
   * - `getResultsCount()` - get the total number of search results
   * - `getIndex()` - get the starting index of the results array
   *
   * ###Search parameters
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
    return plumbing.get('/platform/tree/search', helpers.removeEmptyProperties({
      q: getQuery(params),
      start: params.start,
      count: params.count,
      context: params.context
    }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      helpers.compose(
        searchMatchResponseMapper,
        function(obj, promise) {
          obj.getContext = function() {
            return promise.getResponseHeader('X-fs-page-context');
          };
          return obj;
        }
      )
    );
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
    getResultsCount: function() { return this.results; },
    getIndex: function() { return this.index; }
  };

  var searchMatchResponseMapper = helpers.compose(
    helpers.objectExtender(searchMatchResponseConvenienceFunctions),
    helpers.constructorSetter(SearchResult, 'entries'),
    person.personMapper(function(response) {
      return helpers.map(response.entries, function(entry) {
        return maybe(entry.content).gedcomx;
      });
    })
  );

  /**
   * @ngdoc function
   * @name searchAndMatch.functions:getPersonMatches
   * @function
   *
   * @description
   * Get the matches (possible duplicates) for a person
   * The response includes the following convenience function
   *
   * - `getSearchResults()` - get the array of {@link searchAndMatch.types:type.SearchResult SearchResults} from the response
   * - `getResultsCount()` - get the total number of search results
   * - `getIndex()` - get the starting index of the results array
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Matches_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/5uwyf/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMatches = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/matches', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      searchMatchResponseMapper);
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
   * - `getSearchResults()` - get the array of {@link searchAndMatch.types:type.SearchResult SearchResults} from the response
   * - `getResultsCount()` - get the total number of search results
   * - `getIndex()` - get the starting index of the results array
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Search_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/hhcLP/ editable example}
   *
   * @param {Object} params same parameters as described for {@link searchAndMatch.functions:getPersonSearch getPersonSearch},
   * with the exception that `context` is not a valid parameter for match, and `candidateId` restricts matches to the person with that Id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMatchesQuery = function(params, opts) {
    return plumbing.get('/platform/tree/matches', helpers.removeEmptyProperties({
      q: getQuery(params),
      start: params.start,
      count: params.count
    }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      searchMatchResponseMapper);
  };

  return exports;
});
