define([
  'changeHistory',
  'globals',
  'helpers',
  'plumbing',
  'notes',
  'sources'
], function(changeHistory, globals, helpers, plumbing, notes, sources) {
  /**
   * @ngdoc overview
   * @name spouses
   * @description
   * Functions related to spouse relationships
   *
   * {@link https://familysearch.org/developers/docs/api/resources#spouses FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple
   * @description
   *
   * Couple relationship
   */
  var Couple = exports.Couple = function() {

  };

  exports.Couple.prototype = {
    constructor: Couple,
    /**
     * @ngdoc property
     * @name spouses.types:constructor.Couple#id
     * @propertyOf spouses.types:constructor.Couple
     * @return {String} Id of the relationship
     */

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getFacts
     * @methodOf spouses.types:constructor.Couple
     * @return {Fact[]} array of {@link person.types:constructor.Fact Facts}; e.g., marriage
     */
    $getFacts: function() { return this.facts || []; },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getMarriageFact
     * @methodOf spouses.types:constructor.Couple
     * @return {Fact} {@link person.types:constructor.Fact Fact} of type http://gedcomx.org/Marriage (first one if multiple)
     */
    $getMarriageFact: function() { return helpers.find(this.facts, {type: 'http://gedcomx.org/Marriage'}); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getHusbandId
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} Id of the husband
     */
    $getHusbandId: function() { return maybe(this.person1).resourceId; },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getHusbandUrl
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} URL of the husband
     */
    $getHusbandUrl: function() { return helpers.removeAccessToken(maybe(this.person1).resource); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getHusband
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
     */
    $getHusband: function() { return globals.getPerson(this.$getHusbandUrl()); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getWifeId
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} Id of the wife
     */
    $getWifeId: function() { return maybe(this.person2).resourceId; },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getWifeUrl
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} URL of the wife
     */
    $getWifeUrl: function() { return helpers.removeAccessToken(maybe(this.person2).resource); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getWife
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
     */
    $getWife: function() { return globals.getPerson(this.$getWifeUrl()); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getNoteRefs
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link notes.functions:getCoupleNoteRefs getCoupleNoteRefs} response
     */
    $getNoteRefs: function() { return notes.getCoupleNoteRefs(helpers.removeAccessToken(this.links.notes.href)); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getSourceRefs
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link sources.functions:getCoupleSourceRefs getCoupleSourceRefs} response
     */
    $getSourceRefs: function() { return sources.getCoupleSourceRefs(helpers.removeAccessToken(this.links['source-references'].href)); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getChanges
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link sources.functions:getCoupleChanges getCoupleChanges} response
     */
    $getChanges: function() { return changeHistory.getCoupleChanges(helpers.removeAccessToken(maybe(this.links['change-history']).href)); }
  };

  /**
   * @ngdoc function
   * @name spouses.functions:getCouple
   * @function
   *
   * @description
   * Get information about a couple relationship
   * The response includes the following convenience functions
   *
   * - `getRelationship()` - a {@link spouses.types:constructor.Couple Couple} relationship
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:constructor.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/a2vUg/ editable example}
   *
   * @param {String} crid id or full URL of the couple relationship
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCouple = function(crid, params, opts) {
    return plumbing.getUrl('couple-relationship-template', crid, {crid: crid}).then(function(url) {
      return plumbing.get(url, params, {}, opts,
        helpers.compose(
          helpers.constructorSetter(Couple, 'relationships'),
          helpers.objectExtender(coupleConvenienceFunctions),
          helpers.constructorSetter(globals.Fact, 'facts', function(response) {
            return maybe(response).relationships;
          }),
          globals.personMapper()
        ));
    });
  };

  var coupleConvenienceFunctions = {
    getRelationship: function() { return maybe(this.relationships)[0]; },
    getPerson:       function(id) { return helpers.find(this.persons, {id: id}); }
  };

  return exports;
});
