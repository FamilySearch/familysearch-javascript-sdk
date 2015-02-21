var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name searchAndMatch.types:constructor.SearchResult
 * @description
 *
 * Reference from a person or relationship to a source
 */
var SearchResult = FS.SearchResult = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  utils.forEach(maybe(maybe(maybe(data).content).gedcomx).persons, function(person, index, obj){
    obj[index] = client.createPerson(person);
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

SearchResult.prototype = {
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
    return utils.find(maybe(maybe(this.content).gedcomx).persons, {id: pid});
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
  $getFullPrimaryPerson: function() { return this.$client.getPerson(this.id); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getFatherIds
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {String[]} array of father Id's for this search result
   */
  $getFatherIds: function() {
    var primaryId = this.id, self = this;
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
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
  $getFathers: function() { return utils.map(this.$getFatherIds(), this.$getPerson, this); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getMotherIds
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {String[]} array of mother Id's for this search result
   */
  $getMotherIds: function() {
    var primaryId = this.id, self = this;
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
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
  $getMothers: function() { return utils.map(this.$getMotherIds(), this.$getPerson, this); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getSpouseIds
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {String[]} array of spouse Id's for this search result
   */
  $getSpouseIds:  function() {
    var primaryId = this.id;
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
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
  $getSpouses: function() { return utils.map(this.$getSpouseIds(), this.$getPerson, this); },

  /**
   * @ngdoc function
   * @name searchAndMatch.types:constructor.SearchResult#$getChildIds
   * @methodOf searchAndMatch.types:constructor.SearchResult
   * @function
   * @return {String[]} array of child Id's for this search result
   */
  $getChildIds:  function() {
    var primaryId = this.id;
    return utils.uniq(utils.map(
      utils.filter(maybe(maybe(this.content).gedcomx).relationships, function(r) {
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
  $getChildren: function() { return utils.map(this.$getChildIds(), this.$getPerson, this); }
};