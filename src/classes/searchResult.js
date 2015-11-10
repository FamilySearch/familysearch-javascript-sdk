var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name searchAndMatch.types:constructor.SearchResult
 * @description
 *
 * A person search result entry.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var SearchResult = FS.SearchResult = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  utils.forEach(maybe(maybe(maybe(data).content).gedcomx).persons, function(person, index, obj){
    if(!(person instanceof FS.Person)){
      obj[index] = client.createPerson(person);
    }
  });
};

/**
 * @ngdoc function
 * @name searchAndMatch.functions:createSearchResult
 * @param {Object} data [Entry](https://familysearch.org/developers/docs/api/atom/Entry_json) data
 * @return {Object} {@link searchAndMatch.types:constructor.SearchResult SearchResult}
 * @description Create a {@link searchAndMatch.types:constructor.SearchResult SearchResult} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createSearchResult = function(data){
  return new SearchResult(this, data);
};

SearchResult.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: SearchResult,
  
  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getId
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @return {String} Id of the person for this search result
   */

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getTitle
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @return {String} Id and name
   */
  getTitle: function(){ return this.data.title; },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getScore
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @return {Number} higher is better
   */
  getScore: function(){ return this.data.score; },
  
  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getConfidence
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @return {Number} between 1 and 5; higher is better
   */
  getConfidence: function(){ return this.data.confidence; },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getPerson
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @description
   *
   * **Note: Be aware that the `Person` objects returned from SearchResults do not have as much information
   * as `Person` objects returned from the various person and pedigree functions.**
   *
   * @param {string} pid id of the person
   * @return {Person} the {@link person.types:constructor.Person Person} for this Id in this search result
   */
  getPerson: function(pid) {
    return utils.find(maybe(maybe(this.data.content).gedcomx).persons, function(person){
      return person.getId() === pid;
    });
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getPrimaryPerson
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {Person} the primary {@link person.types:constructor.Person Person} for this search result
   */
  getPrimaryPerson: function() {
    return this.getPerson(this.getId());
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getFullPrimaryPerson
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  getFullPrimaryPerson: function() { return this.client.getPerson(this.getId()); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getFatherIds
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {String[]} array of father Id's for this search result
   */
  getFatherIds: function() {
    var primaryId = this.getId(), self = this;
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.data.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person2.resourceId === primaryId &&
          r.person1 &&
          self.getPerson(r.person1.resourceId).getGender().getType() === 'http://gedcomx.org/Male';
      }),
      function(r) { return r.person1.resourceId; }
    ));
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getFathers
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {Person[]} array of father {@link person.types:constructor.Person Persons} for this search result
   */
  getFathers: function() { return utils.map(this.getFatherIds(), this.getPerson, this); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getMotherIds
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {String[]} array of mother Id's for this search result
   */
  getMotherIds: function() {
    var primaryId = this.getId(), self = this;
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.data.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person2.resourceId === primaryId &&
          r.person1 &&
          self.getPerson(r.person1.resourceId).getGender().getType() !== 'http://gedcomx.org/Male';
      }),
      function(r) { return r.person1.resourceId; }
    ));
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getMothers
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {Person[]} array of mother {@link person.types:constructor.Person Persons} for this search result
   */
  getMothers: function() { return utils.map(this.getMotherIds(), this.getPerson, this); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getSpouseIds
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {String[]} array of spouse Id's for this search result
   */
  getSpouseIds:  function() {
    var primaryId = this.getId();
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.data.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/Couple' &&
          (r.person1.resourceId === primaryId || r.person2.resourceId === primaryId);
      }),
      function(r) { return r.person1.resourceId === primaryId ? r.person2.resourceId : r.person1.resourceId; }
    ));
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getSpouses
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {Person[]} array of spouse {@link person.types:constructor.Person Persons} for this search result
   */
  getSpouses: function() { return utils.map(this.getSpouseIds(), this.getPerson, this); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getChildIds
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {String[]} array of child Id's for this search result
   */
  getChildIds:  function() {
    var primaryId = this.getId();
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.data.content).gedcomx).relationships, function(r) {
        return r.type === 'http://gedcomx.org/ParentChild' &&
          r.person1.resourceId === primaryId &&
          r.person2;
      }),
      function(r) { return r.person2.resourceId; }
    ));
  },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#getChildren
   * @methodOf searchAndMatch.types:constructor.SearchResult

   * @return {Person[]} array of spouse {@link person.types:constructor.Person Persons} for this search result
   */
  getChildren: function() { return utils.map(this.getChildIds(), this.getPerson, this); }
});