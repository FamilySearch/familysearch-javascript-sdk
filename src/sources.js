define([
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name sources
   * @description
   * Functions related to sources
   *
   * {@link https://familysearch.org/developers/docs/api/resources#sources FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name sources.functions:getPersonSourceReferences
   * @function
   *
   * @description
   * Get references to sources for a person
   * The response includes the following convenience function
   *
   * - `getReferences()` - get the array of source references from the response; each reference has the following convenience functions
   *
   * ###Source reference convenience Functions
   *
   * - `getSourceId()` - id of the source ( use `getSourceDescription` to find out more)
   * - `getTags()` - array of tags; each tag is an object with a `resource` property identifying an assertion type
   * - `getContributorId()` - id of the contributor (use `getAgent` to find out more)
   * - `getModifiedTimestamp()`
   * - `getChangeMessage()`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/BkydV/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonSourceReferences = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/source-references', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getReferences: function() {
          return maybe(maybe(this.persons)[0]).sources || [];
        }}),
        helpers.objectExtender(sourceReferenceConvenienceFunctions, function(response) {
          return maybe(maybe(response.persons)[0]).sources;
        })
      ));
  };

  var sourceReferenceConvenienceFunctions = {
    getSourceId:          function() { return this.description ? this.description.replace(/.*\//, '') : this.description; },
    getTags:              function() { return this.tags || []; },
    getContributorId:     function() { return maybe(maybe(this.attribution).contributor).resourceId; },
    getModifiedTimestamp: function() { return maybe(this.attribution).modified; },
    getChangeMessage:     function() { return maybe(this.attribution).changeMessage; }
  };

  // TODO getSourceDescription
  // TODO getCoupleRelationshipSourceReferences
  // TODO getChildAndParentsRelationshipSourceReferences
  // TODO getSourcesReferencesQuery

  return exports;
});
