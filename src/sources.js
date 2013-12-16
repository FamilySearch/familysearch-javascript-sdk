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
   * @name sources.functions:getPersonSourceRefs
   * @function
   *
   * @description
   * Get references to sources for a person
   * The response includes the following convenience function
   *
   * - `getSourceRefs()` - get the array of source references from the response; each has the following *source reference convenience functions*
   *
   * ###Source Reference Convenience Functions
   *
   * - `getSourceId()` - id of the source;
   * pass into {@link sources.functions:getSourceDescription getSourceDescription} for more information
   * - `getTags()` - array of tags; each tag is an object with a `resource` property identifying an assertion type
   * - `getContributorId()` - id of the contributor;
   * pass into {@link user.functions:getAgent getAgent} for more information
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
  exports.getPersonSourceRefs = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/source-references', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceRefs: function() {
          return maybe(maybe(this.persons)[0]).sources || [];
        }}),
        helpers.objectExtender(sourceReferenceConvenienceFunctions, function(response) {
          return maybe(maybe(response.persons)[0]).sources;
        })
      ));
  };

  var sourceReferenceConvenienceFunctions = {
    getSourceId:          function() { return this.description ? this.description.replace(/.*\//, '').replace(/\?.*$/, '') : this.description; },
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
   * - `getId()` - id of the source
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

  /**
   * @ngdoc function
   * @name sources.functions:getCoupleSourceRefs
   * @function
   *
   * @description
   * Get the source references for a couple relationship
   * The response includes the following convenience function
   *
   * - `getSourceRefs()` - get the array of source references from the response; each has *source reference convenience functions*
   * as described for {@link sources.functions:getPersonSourceRefs getPersonSourceRefs}
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ahu29/ editable example}
   *
   * @param {String} crid of the couple relationship to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleSourceRefs = function(crid, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(crid)+'/source-references', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceRefs: function() {
          return maybe(maybe(this.relationships)[0]).sources || [];
        }}),
        helpers.objectExtender(sourceReferenceConvenienceFunctions, function(response) {
          return maybe(maybe(response.relationships)[0]).sources;
        })
      ));
  };

  /**
   * @ngdoc function
   * @name sources.functions:getChildAndParentsSourceRefs
   * @function
   *
   * @description
   * Get the source references for a child and parents relationship
   * The response includes the following convenience function
   *
   * - `getSourceRefs()` - get the array of source references from the response; each has *source reference convenience functions*
   * as described for {@link sources.functions:getPersonSourceRefs getPersonSourceRefs}
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ZKLVT/ editable example}
   *
   * @param {String} id of the child and parents relationship to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsSourceRefs = function(id, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(id)+'/source-references', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceRefs: function() {
          return maybe(maybe(this.childAndParentsRelationships)[0]).sources || [];
        }}),
        helpers.objectExtender(sourceReferenceConvenienceFunctions, function(response) {
          return maybe(maybe(response.childAndParentsRelationships)[0]).sources;
        })
      ));
  };

  // TODO getSourcesReferencesQuery

  return exports;
});
