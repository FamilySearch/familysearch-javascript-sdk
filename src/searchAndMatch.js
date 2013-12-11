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
   * @name searchAndMatch.functions:getPersonSearch
   * @function
   *
   * @description
   * Search people
   * The response includes the following convenience functions
   *
   * - `getContext()` - get the search context to pass into subsequent requests for additional results
   * - `getResults()` - get the array of search results from the response; each result has the following convenience functions
   *
   * ###Search result convenience Functions
   *
   * - `getId()` - person id
   * - `getTitle()` - title string
   * - `getScore()` - real number
   * - `getConfidence()` - appears to be an integer
   * - `getPrimaryPerson() - person object decorated with the *person convenience functions* as described in {@link exports.functions:getPerson getPerson}
   * - `getFathers()` - array of person objects similarly decorated
   * - `getMothers()` - array of person objects similarly decorated
   * - `getSpouses()` - array of person objects similarly decorated
   * - `getChildren()` - array of person objects similarly decorated
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
        helpers.objectExtender({getResults: function() {
          return this.entries || [];
        }}),
        helpers.objectExtender(searchResultConvenienceFunctions, function(response) {
          return response.entries;
        }),
        helpers.objectExtender(person.personConvenienceFunctions, function(response) {
          return helpers.flatMap(response.entries, function(entry) {
            return maybe(maybe(entry.content).gedcomx).persons;
          });
        }),
        function(obj, promise) {
          obj.getContext = function() {
            return promise.getResponseHeader('X-fs-page-context');
          };
          return obj;
        }
    ));
  };

  var nonQueryParams = {start: true, count: true, context: true};

  function quote(value) {
    value = value.replace(/[:"]/g, '').trim();
    if (value.indexOf(' ') >= 0) {
      return '"' + value + '"';
    }
    return value;
  }

  function getQuery(params) {
    var queryParams = [];
    helpers.forEach(params, function(value, key) {
      if (!nonQueryParams[key]) {
        queryParams.push(key+':'+quote(value));
      }
    });
    return queryParams.join(' ');
  }

  // TODO refactor this to reuse personWithRelationshipsConvenienceFunctions?
  // The person with relationships json has a childAndParentsRelationships object with .father and .mother,
  // which may be more accurate than our gender checking, which lists parents without a gender as mothers.
  // Another issue is these functions need to start navigating from two levels higher - at content.gedcomx.
  var searchResultConvenienceFunctions = {
    getId:         function() { return this.id; },
    getTitle:      function() { return this.title; },
    getScore:      function() { return this.score; },
    getConfidence: function() { return this.confidence; },
    getPerson:     function(id) { return helpers.findOrEmpty(maybe(maybe(this.content).gedcomx).persons, {id: id}); },
    getPrimaryPerson: function() {
      return this.getPerson(this.getId());
    },
    getFatherIds:  function() {
      var primaryId = this.getId(), self = this;
      return helpers.uniq(helpers.map(helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
               r.person2.resourceId === primaryId &&
               r.person1 &&
               maybe(self.getPerson(r.person1.resourceId).gender).type === 'http://gedcomx.org/Male';
      }),
        function(r) { return r.person1.resourceId; }));
    },
    getFathers:    function() { return helpers.map(this.getFatherIds(), this.getPerson, this); },
    getMotherIds:  function() {
      var primaryId = this.getId(), self = this;
      return helpers.uniq(helpers.map(helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person2.resourceId === primaryId &&
          r.person1 &&
          maybe(self.getPerson(r.person1.resourceId).gender).type !== 'http://gedcomx.org/Male';
      }),
        function(r) { return r.person1.resourceId; }));
    },
    getMothers:    function() { return helpers.map(this.getMotherIds(), this.getPerson, this); },
    getSpouseIds:  function() {
      var primaryId = this.getId();
      return helpers.uniq(helpers.map(helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/Couple' &&
          (r.person1.resourceId === primaryId || r.person2.resourceId === primaryId);
      }),
        function(r) { return r.person1.resourceId === primaryId ? r.person2.resourceId : r.person1.resourceId; }));
    },
    getSpouses:    function() { return helpers.map(this.getSpouseIds(), this.getPerson, this); },
    getChildIds:  function() {
      var primaryId = this.getId();
      return helpers.uniq(helpers.map(helpers.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person1.resourceId === primaryId &&
          r.person2;
      }),
        function(r) { return r.person2.resourceId; }));
    },
    getChildren:   function() { return helpers.map(this.getChildIds(), this.getPerson, this); }
  };

  return exports;
});
