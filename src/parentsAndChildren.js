define([
  'changeHistory',
  'globals',
  'helpers',
  'notes',
  'plumbing',
  'sources'
], function(changeHistory, globals, helpers, notes, plumbing, sources) {
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
   * @name parentsAndChildren.types:constructor.ChildAndParents
   * @description
   *
   * Child and parents relationship
   */
  var ChildAndParents = exports.ChildAndParents = function() {

  };

  exports.ChildAndParents.prototype = {
    constructor: ChildAndParents,
    /**
     * @ngdoc property
     * @name parentsAndChildren.types:constructor.ChildAndParents#id
     * @propertyOf parentsAndChildren.types:constructor.ChildAndParents
     * @return {String} Id of the relationship
     */

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getFatherFacts
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @return {Fact[]} array of {@link person.types:constructor.Fact Facts}; e.g., parent-relationship type
     */
    $getFatherFacts: function() { return this.fatherFacts || []; },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getMotherFacts
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @return {Fact[]} array of {@link person.types:constructor.Fact Facts}; e.g., parent-relationship type
     */
    $getMotherFacts: function() { return this.motherFacts || []; },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getFatherId
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {String} Id of the father
     */
    $getFatherId: function() { return maybe(this.father).resourceId; },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getFatherUrl
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {String} URL of the father
     */
    $getFatherUrl: function() { return helpers.removeAccessToken(maybe(this.father).resource); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getFather
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
     */
    $getFather: function() { return globals.getPerson(this.$getFatherUrl()); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getMotherId
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {String} Id of the mother
     */
    $getMotherId: function() { return maybe(this.mother).resourceId; },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getMotherUrl
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {String} URL of the mother
     */
    $getMotherUrl: function() { return helpers.removeAccessToken(maybe(this.mother).resource); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getMother
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
     */
    $getMother: function() { return globals.getPerson(this.$getMotherUrl()); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getChildId
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {String} Id of the child
     */
    $getChildId: function() { return maybe(this.child).resourceId; },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getChildUrl
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {String} URL of the child
     */
    $getChildUrl: function() { return helpers.removeAccessToken(maybe(this.child).resource); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getChild
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
     */
    $getChild: function() { return globals.getPerson(this.$getChildUrl()); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getNoteRefs
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link notes.functions:getChildAndParentsNoteRefs getChildAndParentsNoteRefs} response
     */
    $getNoteRefs: function() { return notes.getChildAndParentsNoteRefs(helpers.removeAccessToken(this.links.notes.href)); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getSourceRefs
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link sources.functions:getChildAndParentsSourceRefs getChildAndParentsSourceRefs} response
     */
    $getSourceRefs: function() { return sources.getChildAndParentsSourceRefs(helpers.removeAccessToken(maybe(this.links['source-references']).href)); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getChanges
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} __BROKEN__ promise for the {@link sources.functions:getChildAndParentsChanges getChildAndParentsChanges} response
     */
    $getChanges: function() { return changeHistory.getChildAndParentsChanges(helpers.removeAccessToken(maybe(this.links['change-history']).href)); }
  };

  /**
   * @ngdoc function
   * @name parentsAndChildren.functions:getChildAndParents
   * @function
   *
   * @description
   * Get information about a child and parents relationship.
   * The response includes the following convenience functions
   *
   * - `getRelationship()` - a {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:constructor.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/C437t/ editable example}
   *
   * @param {String} caprid id or full URL of the child-and-parents relationship
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParents = function(caprid, params, opts) {
    return plumbing.getUrl('child-and-parents-relationship-template', caprid, {caprid: caprid}).then(function(url) {
      return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        helpers.compose(
          helpers.constructorSetter(ChildAndParents, 'childAndParentsRelationships'),
          helpers.objectExtender(childAndParentsConvenienceFunctions),
          helpers.constructorSetter(globals.Fact, 'motherFacts', function(response) {
            return maybe(response).childAndParentsRelationships;
          }),
          helpers.constructorSetter(globals.Fact, 'fatherFacts', function(response) {
            return maybe(response).childAndParentsRelationships;
          }),
          globals.personMapper()
        ));
    });
  };

  var childAndParentsConvenienceFunctions = {
    getRelationship: function() { return maybe(this.childAndParentsRelationships)[0]; },
    getPerson:       function(id) { return helpers.find(this.persons, {id: id}); }
  };

  return exports;
});
