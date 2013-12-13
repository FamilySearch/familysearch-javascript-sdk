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
   * - `getFatherType()` - http://gedcomx.org/AdoptiveParent, http://gedcomx.org/BiologicalParent, etc.
   * - `getMotherType()` - http://gedcomx.org/AdoptiveParent, http://gedcomx.org/BiologicalParent, etc.
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
        person.personExtender
      ));
  };

  var childAndParentsConvenienceFunctions = {
    getId:         function() { return maybe(maybe(this.childAndParentsRelationships)[0]).id; },
    getFatherId:   function() { return maybe(maybe(maybe(this.childAndParentsRelationships)[0]).father).resourceId; },
    getMotherId:   function() { return maybe(maybe(maybe(this.childAndParentsRelationships)[0]).mother).resourceId; },
    getChildId:    function() { return maybe(maybe(maybe(this.childAndParentsRelationships)[0]).child).resourceId; },
    getFatherType: function() { return maybe(maybe(maybe(maybe(this.childAndParentsRelationships)[0]).fatherFacts)[0]).type; },
    getMotherType: function() { return maybe(maybe(maybe(maybe(this.childAndParentsRelationships)[0]).motherFacts)[0]).type; },
    getPerson:     function(id) { return helpers.find(this.persons, {id: id}); }
  };

  return exports;
});
