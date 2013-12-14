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
   * - `getId()` - id of the relationship
   * - `getHusbandId()`
   * - `getWifeId()`
   * - `getFacts()` - array of facts decorated with *fact convenience functions* as described for {@link person.functions:getPerson getPerson}
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/a2vUg/ editable example}
   *
   * @param {String} id of the relationship to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function. The person object id decorated with convenience functions
   * as described for {@link person.functions:getPerson getPerson} but possibly without facts
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCouple = function(id, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(id), params, {}, opts,
      helpers.compose(
        helpers.objectExtender(coupleConvenienceFunctions),
        helpers.objectExtender(person.factConvenienceFunctions, function(response) {
          return maybe(maybe(response.relationships)[0]).facts;
        }),
        person.personExtender
      ));
  };

  var coupleConvenienceFunctions = {
    getId:        function() { return maybe(maybe(this.relationships)[0]).id; },
    getHusbandId: function() { return maybe(maybe(maybe(this.relationships)[0]).person1).resourceId; },
    getWifeId:    function() { return maybe(maybe(maybe(this.relationships)[0]).person2).resourceId; },
    getFacts:     function() { return maybe(maybe(this.relationships)[0]).facts || []; },
    getPerson:    function(id) { return helpers.find(this.persons, {id: id}); }
  };

  return exports;
});
