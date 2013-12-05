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

  /**
   * @ngdoc function
   * @name sources.functions:getSourceDescription
   * @function
   *
   * @description
   * Get information about a source
   * The response includes the following convenience functions
   *
   * - `getId()` - id of the source description
   * - `getTitles()` - array of title strings
   * - `getTitle()` - the first title string
   * - `getCitations()` - array of citation strings
   * - `getNotes()` - array of note strings
   * - `getAbout()` - URI to the resource being described
   *
   * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/eECJx/ editable example}
   *
   * @param {String} id of the source description to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSourceDescription = function(id, params, opts) {
    return plumbing.get('/platform/sources/descriptions/'+encodeURI(id), params, {}, opts,
      helpers.objectExtender(sourceDescriptionConvenienceFunctions));
  };

  var sourceDescriptionConvenienceFunctions = {
    getId: function() { return maybe(maybe(this.sourceDescriptions)[0]).id; },
    getTitle: function() { return maybe(maybe(maybe(maybe(this.sourceDescriptions)[0]).titles)[0]).value; },
    getTitles: function() { return helpers.map(maybe(maybe(this.sourceDescriptions)[0]).titles, function(title) {
        return title.value;
      }); },
    getCitations: function() { return helpers.map(maybe(maybe(this.sourceDescriptions)[0]).citations, function(citation) {
        return citation.value;
      }); },
    getNotes: function() { return helpers.map(maybe(maybe(this.sourceDescriptions)[0]).notes, function(note) {
        return note.text;
      }); },
    getAbout: function() { return maybe(maybe(this.sourceDescriptions)[0]).about; }
  };

  // TODO getCoupleRelationshipSourceReferences
  // TODO getChildAndParentsRelationshipSourceReferences
  // TODO getSourcesReferencesQuery

  return exports;
});
