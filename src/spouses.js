define([
  'helpers',
  'person',
  'plumbing'
], function(helpers, person, plumbing) {
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
   * @name spouses.functions:getCouple
   * @function
   *
   * @description
   * Get information about a couple relationship
   * The response includes the following convenience functions
   *
   * - `getRelationship()` - a {@link person.types:constructor.Couple Couple} relationship
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:constructor.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/a2vUg/ editable example}
   *
   * @param {String} crid of the couple relationship to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCouple = function(crid, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(crid), params, {}, opts,
      helpers.compose(
        helpers.constructorSetter(person.Couple, 'relationships'),
        helpers.objectExtender(coupleConvenienceFunctions),
        helpers.constructorSetter(person.Fact, 'facts', function(response) {
          return maybe(response).relationships;
        }),
        person.personMapper()
      ));
  };

  var coupleConvenienceFunctions = {
    getRelationship: function() { return maybe(this.relationships)[0]; },
    getPerson:       function(id) { return helpers.find(this.persons, {id: id}); }
  };

  return exports;
});
