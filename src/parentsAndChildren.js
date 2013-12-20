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
   * Get information about a child and parents relationship.
   * The response includes the following convenience functions
   *
   * - `getRelationship()` - a {@link person.types:type.ChildAndParents ChildAndParents} relationship
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:type.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/C437t/ editable example}
   *
   * @param {String} caprid of the relationship to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParents = function(caprid, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(caprid), params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.constructorSetter(person.ChildAndParents, 'childAndParentsRelationships'),
        helpers.objectExtender(childAndParentsConvenienceFunctions),
        helpers.constructorSetter(person.Fact, 'motherFacts', function(response) {
          return maybe(response).childAndParentsRelationships;
        }),
        helpers.constructorSetter(person.Fact, 'fatherFacts', function(response) {
          return maybe(response).childAndParentsRelationships;
        }),
        person.personMapper()
      ));
  };

  var childAndParentsConvenienceFunctions = {
    getRelationship: function() { return maybe(this.childAndParentsRelationships)[0]; },
    getPerson:       function(id) { return helpers.find(this.persons, {id: id}); }
  };

  // TODO getParentChild?

  return exports;
});
