define([
  'helpers',
  'person',
  'plumbing'
], function(helpers, person, plumbing) {
  /**
   * @ngdoc overview
   * @name parentsAndChildren
   * @description
   * Functions related to parents and children relationships
   *
   * {@link https://familysearch.org/developers/docs/api/resources#parents-and-children FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name parentsAndChildren.functions:getChildAndParents
   * @function
   *
   * @description
   * Get information about a child and parents relationship; to get more
   * The response includes the following convenience functions
   *
   * - `getId()` - id of the relationship
   * - `getFatherId()` - person id
   * - `getMotherId()` - mother id
   * - `getChildId()` - child id
   * - `getFatherFacts()` - an array of facts decorated with *fact convenience functions* as described for {@link person.functions:getPerson getPerson}
   * - `getMotherFacts()` - similar to father facts
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/C437t/ editable example}
   *
   * @param {String} id of the relationship to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function. The person object id decorated with convenience functions
   * as described for {@link person.functions:getPerson getPerson} but possibly without facts
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParents = function(id, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(id), params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender(childAndParentsConvenienceFunctions),
        helpers.objectExtender(person.factConvenienceFunctions, function(response) {
          return helpers.union(
            maybe(maybe(response.childAndParentsRelationships)[0]).fatherFacts,
            maybe(maybe(response.childAndParentsRelationships)[0]).motherFacts
          );
        }),
        person.personExtender
      ));
  };

  var childAndParentsConvenienceFunctions = {
    getId:          function() { return maybe(maybe(this.childAndParentsRelationships)[0]).id; },
    getFatherId:    function() { return maybe(maybe(maybe(this.childAndParentsRelationships)[0]).father).resourceId; },
    getMotherId:    function() { return maybe(maybe(maybe(this.childAndParentsRelationships)[0]).mother).resourceId; },
    getChildId:     function() { return maybe(maybe(maybe(this.childAndParentsRelationships)[0]).child).resourceId; },
    getFatherFacts: function() { return maybe(maybe(this.childAndParentsRelationships)[0]).fatherFacts; },
    getMotherFacts: function() { return maybe(maybe(this.childAndParentsRelationships)[0]).motherFacts; },
    getPerson:      function(id) { return helpers.find(this.persons, {id: id}); }
  };

  return exports;
});
