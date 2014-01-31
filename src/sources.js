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
     * @return {string} Id of the source reference
     */

    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceRef#attribution
     * @propertyOf sources.types:constructor.SourceRef
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$getSourceDescriptionUrl
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {string} URL of the source description - pass into {@link sources.functions:getSourceDescription getSourceDescription} for details
     */
    $getSourceDescriptionUrl: function() {
      return helpers.removeAccessToken(this.description);
    },

    // TODO check for source description id

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$getSourceDescription
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {Object} promise for the {@link sources.functions:getSourceDescription getSourceDescription} response
     */
    $getSourceDescription: function() {
      return exports.getSourceDescription(this.$getSourceDescriptionUrl());
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$getTagNames
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {string[]} an array of tag names; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
     */
    $getTagNames: function() { return helpers.map(this.tags, function(tag) {
      return tag.resource;
    }); }
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

    // TODO check for collection id and url

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$getCitation
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {String} source citation
     */
    $getCitation: function() { return maybe(maybe(this.citations)[0]).value; },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$getTitle
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {String} title of the source description
     */
    $getTitle: function() { return maybe(maybe(this.titles)[0]).value; },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$getText
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {String} Text / Description of the source
     */
    $getText: function() { return maybe(maybe(this.notes)[0]).text; },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$getSourceRefsQuery
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {Object} promise for the {@link sources.functions:getSourceRefsQuery getSourceRefsQuery} response
     */
    // TODO verify this is available also from getCollectionSourceDescriptions(forUser)
    $getSourceRefsQuery: function() {
      return exports.getSourceRefsQuery(helpers.removeAccessToken(this.links['source-references-query'].href));
    }
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
   * @param {String} pid of the person or full URL of the person-source-references endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonSourceRefs = function(pid, params, opts) {
    return plumbing.getUrl('person-source-references-template', pid, {pid: pid}).then(function(url) {
      return plumbing.get(url, params, {}, opts,
        helpers.compose(
          helpers.objectExtender({getSourceRefs: function() { return maybe(maybe(this.persons)[0]).sources || []; }}),
          helpers.constructorSetter(SourceRef, 'sources', function(response) {
            return maybe(maybe(response).persons)[0];
          }),
          helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
            return maybe(maybe(maybe(response).persons)[0]).sources;
          })
        ));
    });
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
   * @param {String} crid or full URL of the couple relationship
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleSourceRefs = function(crid, params, opts) {
    return plumbing.getUrl('couple-relationship-source-references-template', crid, {crid: crid}).then(function(url) {
      return plumbing.get(url, params, {}, opts,
        helpers.compose(
          helpers.objectExtender({getSourceRefs: function() { return maybe(maybe(this.relationships)[0]).sources || []; }}),
          helpers.constructorSetter(SourceRef, 'sources', function(response) {
            return maybe(maybe(response).relationships)[0];
          }),
          helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
            return maybe(maybe(maybe(response).relationships)[0]).sources;
          })
        ));
    });
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
   * @param {String} caprid id or full URL of the child and parents relationship
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsSourceRefs = function(caprid, params, opts) {
    return plumbing.getUrl('child-and-parents-relationship-source-references-template', caprid, {caprid: caprid}).then(function(url) {
      return plumbing.get(url, params,
        {'Accept': 'application/x-fs-v1+json'}, opts,
        helpers.compose(
          helpers.objectExtender({getSourceRefs: function() { return maybe(maybe(this.childAndParentsRelationships)[0]).sources || []; }}),
          helpers.constructorSetter(SourceRef, 'sources', function(response) {
            return maybe(maybe(response).childAndParentsRelationships)[0];
          }),
          helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
            return maybe(maybe(maybe(response).childAndParentsRelationships)[0]).sources;
          })
        ));
    });
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
   * @param {String} sdid of the source description or full URL of the source-description endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSourceDescription = function(sdid, params, opts) {
    return plumbing.getUrl('source-description-template', sdid, {sdid: sdid}).then(function(url) {
      return plumbing.get(url, params, {}, opts,
        helpers.compose(
          helpers.objectExtender({getSourceDescription: function() { return maybe(this.sourceDescriptions)[0]; }}),
          helpers.constructorSetter(SourceDescription, 'sourceDescriptions'),
          helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
            return response.sourceDescriptions;
          })
        ));
    });
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
   * @param {string[]|SourceRef[]} sdids ids or full URLs or {@link sources.types:constructor.SourceRef SourceRefs} of the source descriptions
   * @param {Object=} params pass to getSourceDescription currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the source descriptions have been read,
   * returning a map of source description id or URL to promise response
   */
  exports.getMultiSourceDescription = function(sdids, params, opts) {
    var promises = {};
    helpers.forEach(sdids, function(sdid) {
      var id, url;
      if (sdid instanceof SourceRef) {
        // TODO use source description id here when it is available
        id = sdid.$getSourceDescriptionUrl();
        url = sdid.$getSourceDescriptionUrl();
      }
      else {
        id = sdid;
        url = sdid;
      }
      promises[id] = exports.getSourceDescription(url, params, opts);
    });
    return helpers.promiseAll(promises);
  };

  function createSourceRefMap(objects) {
    var result = {};
    if (helpers.isArray(objects)) {
      helpers.forEach(objects, function(obj) {
        if (helpers.isArray(obj.sources)) {
          result[obj.id] = obj.sources[0];
        }
      });
    }
    return result;
  }

  /**
   * @ngdoc function
   * @name sources.functions:getSourceRefsQuery
   * @function
   *
   * @description
   * Get the people, couples, and child-and-parents relationships referencing a source
   * The response includes the following convenience functions
   *
   * - `getPersonSourceRefMap()` - get a map of person id to {@link sources.types:constructor.SourceRef SourceRefs} from the response
   * - `getCoupleSourceRefMap()` - get a map of couple relationship id to {@link sources.types:constructor.SourceRef SourceRefs} from the response
   * - `getChildAndParentsSourceRefMap()` - get a map of child and parent relationship ids to {@link sources.types:constructor.SourceRef SourceRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Source_References_Query_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/E866s/ editable example}
   *
   * @param {String} sdid of the source description or full URL of the source-references-query endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSourceRefsQuery = function(sdid, params, opts) {
    // TODO add discovery resource lookup when it's working - and be careful how to substitute sdid in the query parameters part
    var url = helpers.isAbsoluteUrl(sdid) ? sdid : helpers.appendQueryParameters('/platform/tree/source-references', {source: sdid});
    return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getPersonSourceRefMap: function() { return createSourceRefMap(this.persons); }}),
        helpers.objectExtender({getCoupleSourceRefMap: function() { return createSourceRefMap(this.relationships); }}),
        helpers.objectExtender({getChildAndParentsSourceRefMap: function() { return createSourceRefMap(this.childAndParentsRelationships); }}),
        helpers.constructorSetter(SourceRef, 'sources', function(response) {
          return helpers.union(maybe(response).persons, maybe(response).relationships, maybe(response).childAndParentsRelationships);
        })
      ));
  };

  return exports;
});
