define([
  'attribution',
  'helpers',
  'plumbing'
], function(attribution, helpers, plumbing) {
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
   * @name sources.types:constructor.SourceRef
   * @description
   *
   * Reference from a person or relationship to a source
   */
  var SourceRef = exports.SourceRef = function() {

  };

  exports.SourceRef.prototype = {
    constructor: SourceRef,
    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceRef#id
     * @propertyOf sources.types:constructor.SourceRef
     * @return {String} Id of the source reference
     */

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#getSourceDescriptionId
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {String} Id of the source description - pass into {@link sources.functions:getSourceDescription getSourceDescription} for details
     */
    getSourceDescriptionId: function() {
      return helpers.getLastUrlSegment(this.description);
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#getTagNames
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {String[]} an array of tag names; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
     */
    getTagNames: function() { return helpers.map(this.tags, function(tag) {
      return tag.resource;
    }); },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#getContributorId
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(maybe(this.attribution).contributor).resourceId; },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#getModified
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {Number} last modified timestamp
     */
    getModified: function() { return maybe(this.attribution).modified; },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#getChangeMessage
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {String} Reason for the change
     */
    getChangeMessage: function() { return maybe(this.attribution).changeMessage; }
  };

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription
   * @description
   *
   * Description of a source
   */
  var SourceDescription = exports.SourceDescription = function() {

  };

  exports.SourceDescription.prototype = {
    constructor: SourceDescription,
    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceDescription#id
     * @propertyOf sources.types:constructor.SourceDescription
     * @return {String} Id of the source description
     */

    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceDescription#about
     * @propertyOf sources.types:constructor.SourceDescription
     * @return {String} URL (link to the record)
     */

    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceDescription#attribution
     * @propertyOf sources.types:constructor.SourceDescription
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#getCitation
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {String} source citation
     */
    getCitation: function() { return maybe(maybe(this.citations)[0]).value; },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#getTitle
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {String} title of the source description
     */
    getTitle: function() { return maybe(maybe(this.titles)[0]).value; },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#getText
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {String} Text / Description of the source
     */
    getText: function() { return maybe(maybe(this.notes)[0]).text; }
  };

  /**
   * @ngdoc function
   * @name sources.functions:getPersonSourceRefs
   * @function
   *
   * @description
   * Get references to sources for a person
   * The response includes the following convenience function
   *
   * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/BkydV/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonSourceRefs = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/source-references', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceRefs: function() { return maybe(maybe(this.persons)[0]).sources || []; }}),
        helpers.constructorSetter(SourceRef, 'sources', function(response) {
          return maybe(maybe(response).persons)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name sources.functions:getSourceDescription
   * @function
   *
   * @description
   * Get information about a source
   * The response includes the following convenience function
   *
   * - `getSourceDescription()` - get the {@link sources.types:constructor.SourceDescription SourceDescription} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/eECJx/ editable example}
   *
   * @param {String} sdid of the source description to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSourceDescription = function(sdid, params, opts) {
    return plumbing.get('/platform/sources/descriptions/'+encodeURI(sdid), params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceDescription: function() { return maybe(this.sourceDescriptions)[0]; }}),
        helpers.constructorSetter(SourceDescription, 'sourceDescriptions'),
        helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
          return response.sourceDescriptions;
        })
      ));
  };

  /**
   * @ngdoc function
   * @name sources.functions:getMultiSourceDescription
   * @function
   *
   * @description
   * Get multiple source descriptions at once by requesting them in parallel
   *
   * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/chQ64/ editable example}
   *
   * @param {Array} sdids Ids or {@link sources.types:constructor.SourceRef SourceRefs} of the source descriptions to read
   * @param {Object=} params pass to getSourceDescription currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the source descriptions have been read,
   * returning a map of source description id to response
   */
  exports.getMultiSourceDescription = function(sdids, params, opts) {
    var promises = {};
    helpers.forEach(sdids, function(sdid) {
      var id = (sdid instanceof SourceRef) ? sdid.getSourceDescriptionId() : sdid;
      promises[id] = exports.getSourceDescription(id, params, opts);
    });
    return helpers.promiseAll(promises);
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
   * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
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
        helpers.objectExtender({getSourceRefs: function() { return maybe(maybe(this.relationships)[0]).sources || []; }}),
        helpers.constructorSetter(SourceRef, 'sources', function(response) {
          return maybe(maybe(response).relationships)[0];
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
   * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
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
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(id)+'/source-references', params,
      {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getSourceRefs: function() { return maybe(maybe(this.childAndParentsRelationships)[0]).sources || []; }}),
        helpers.constructorSetter(SourceRef, 'sources', function(response) {
          return maybe(maybe(response).childAndParentsRelationships)[0];
        })
      ));
  };

  // TODO replace IdSourceRef with a map from Id to SourceRef
  /**
   * @ngdoc function
   * @name sources.types:constructor.IdSourceRef
   * @description
   *
   * A person or relationship id and a {@link sources.types:constructor.SourceRef SourceRef}
   */
  var IdSourceRef = exports.IdSourceRef = function() {

  };

  exports.IdSourceRef.prototype = {
    constructor: IdSourceRef,
    /**
     * @ngdoc property
     * @name sources.types:constructor.IdSourceRef#id
     * @propertyOf sources.types:constructor.IdSourceRef
     * @return {String} Id of the person or relationship
     */

    /**
     * @ngdoc function
     * @name sources.types:constructor.IdSourceRef#getSourceRef
     * @methodOf sources.types:constructor.IdSourceRef
     * @function
     * @return {SourceRef} {@link sources.types:constructor.SourceRef SourceRef}
     */
    getSourceRef: function() { return maybe(this.sources)[0]; }
  };

  /**
   * @ngdoc function
   * @name sources.functions:getSourceRefsQuery
   * @function
   *
   * @description
   * Get the people, couples, and child-and-parents relationships referencing a source
   * The response includes the following convenience functions
   *
   * - `getPersonIdSourceRefs()` - get an array of {@link sources.types:constructor.IdSourceRef IdSourceRefs} from the response
   * - `getCoupleIdSourceRefs()` - get an array of {@link sources.types:constructor.IdSourceRef IdSourceRefs} from the response
   * - `getChildAndParentsIdSourceRefs()` - get an array of {@link sources.types:constructor.IdSourceRef IdSourceRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Source_References_Query_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/E866s/ editable example}
   *
   * @param {String} sdid of the source description
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSourceRefsQuery = function(sdid, params, opts) {
    return plumbing.get('/platform/tree/source-references', helpers.extend({'source': sdid}, params), {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getPersonIdSourceRefs: function() { return this.persons || []; }}),
        helpers.constructorSetter(IdSourceRef, 'persons'),
        helpers.objectExtender({getCoupleIdSourceRefs: function() { return this.relationships || []; }}),
        helpers.constructorSetter(IdSourceRef, 'relationships'),
        helpers.objectExtender({getChildAndParentsIdSourceRefs: function() { return this.childAndParentsRelationships || []; }}),
        helpers.constructorSetter(IdSourceRef, 'childAndParentsRelationships'),
        helpers.constructorSetter(SourceRef, 'sources', function(response) {
          return helpers.union(maybe(response).persons, maybe(response).relationships, maybe(response).childAndParentsRelationships);
        })
      ));
  };

  return exports;
});
