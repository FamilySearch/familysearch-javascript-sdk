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

  /**********************************/
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription
   * @description
   *
   * Description of a source
   *
   * {@link https://familysearch.org/developers/docs/api/sources/Source_Descriptions_resource FamilySearch API Docs}
   *
   * @param {Object=} data an object with optional attributes {about, citation, title, text}.
   * _about_ is a URL
   **********************************/

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

  /**********************************/
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef
   * @description
   *
   * Reference from a person or relationship to a source
   **********************************/

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
     * @ngdoc property
     * @name sources.types:constructor.SourceRef#$personId
     * @propertyOf sources.types:constructor.SourceRef
     * @return {String} Id of the person to which this source is attached if it is attached to a person
     */

    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceRef#$childAndParentsId
     * @propertyOf sources.types:constructor.SourceRef
     * @return {String} Id of the child and parents relationship to which this source is attached if it is attached to child and parents
     */

    /**
     * @ngdoc property
     * @name sources.types:constructor.SourceRef#$coupleId
     * @propertyOf sources.types:constructor.SourceRef
     * @return {String} Id of the couple relationship to which this source is attached if it is attached to a couple
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
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-source-references-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getSourceRefs: function() {
              return maybe(maybe(this.persons)[0]).sources || [];
            }}),
            helpers.constructorSetter(SourceRef, 'sources', function(response) {
              return maybe(maybe(response).persons)[0];
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return maybe(maybe(maybe(response).persons)[0]).sources;
            }),
            helpers.objectExtender(function(response) {
              return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
            }, function(response) {
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
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-source-references-template', crid, {crid: crid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getSourceRefs: function() {
              return maybe(maybe(this.relationships)[0]).sources || [];
            }}),
            helpers.constructorSetter(SourceRef, 'sources', function(response) {
              return maybe(maybe(response).relationships)[0];
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return maybe(maybe(maybe(response).relationships)[0]).sources;
            }),
            helpers.objectExtender(function(response) {
              return { $coupleId: maybe(maybe(maybe(response).relationships)[0]).id };
            }, function(response) {
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
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-source-references-template', caprid, {caprid: caprid}),
      function(url) {
        return plumbing.get(url, params,
          {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getSourceRefs: function() {
              return maybe(maybe(this.childAndParentsRelationships)[0]).sources || [];
            }}),
            helpers.constructorSetter(SourceRef, 'sources', function(response) {
              return maybe(maybe(response).childAndParentsRelationships)[0];
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return maybe(maybe(maybe(response).childAndParentsRelationships)[0]).sources;
            }),
            helpers.objectExtender(function(response) {
              return { $childAndParentsId: maybe(maybe(maybe(response).childAndParentsRelationships)[0]).id };
            }, function(response) {
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
   * @param {String|SourceRef} sdid id or full URL or {@link sources.types:constructor.SourceRef SourceRef} of the source description
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSourceDescription = function(sdid, params, opts) {
    if (sdid instanceof SourceRef) {
      //noinspection JSUnresolvedFunction
      sdid = sdid.$getSourceDescriptionUrl();
    }
    return helpers.chainHttpPromises(
      plumbing.getUrl('source-description-template', sdid, {sdid: sdid}),
      function(url) {
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
   * returning a map of source description id or URL to {@link sources.functions:getSourceDescription getSourceDescription} response
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

  /**
   * @ngdoc function
   * @name sources.functions:getSourceRefsQuery
   * @function
   *
   * @description
   * Get the people, couples, and child-and-parents relationships referencing a source
   * The response includes the following convenience functions
   *
   * - `getPersonSourceRefs()` - get an array of person {@link sources.types:constructor.SourceRef SourceRefs} from the response
   * - `getCoupleSourceRefs()` - get an array of couple relationship {@link sources.types:constructor.SourceRef SourceRefs} from the response
   * - `getChildAndParentsSourceRefs()` - get an array of child and parent relationship {@link sources.types:constructor.SourceRef SourceRefs} from the response
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
    return helpers.chainHttpPromises(
      plumbing.getUrl('source-references-query'),
      function(url) {
        url = helpers.isAbsoluteUrl(sdid) ? sdid : helpers.appendQueryParameters(url, {source: sdid});
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getPersonSourceRefs: function() {
              return helpers.flatMap(maybe(this.persons), function(person) {
                return person.sources;
              });
            }}),
            helpers.objectExtender({getCoupleSourceRefs: function() {
              return helpers.flatMap(maybe(this.relationships), function(couple) {
                return couple.sources;
              });
            }}),
            helpers.objectExtender({getChildAndParentsSourceRefs: function() {
              return helpers.flatMap(maybe(this.childAndParentsRelationships), function(childAndParents) {
                return childAndParents.sources;
              });
            }}),
            helpers.constructorSetter(SourceRef, 'sources', function(response) {
              return helpers.union(maybe(response).persons, maybe(response).relationships, maybe(response).childAndParentsRelationships);
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              var personsRelationships = helpers.union(maybe(response).persons, maybe(response).relationships, maybe(response).childAndParentsRelationships);
              return helpers.flatMap(personsRelationships, function(personRelationship) {
                return personRelationship.sources;
              });
            }),
            helpers.objectExtender(function(response, sourceRef) {
              // get the person that contains this source ref
              var person = helpers.find(maybe(response).persons, function(person) {
                return !!helpers.find(maybe(person).sources, {id: sourceRef.id});
              });
              return { $personId: person.id };
            }, function(response) {
              return helpers.flatMap(maybe(response).persons, function(person) {
                return person.sources;
              });
            }),
            helpers.objectExtender(function(response, sourceRef) {
              // get the couple that contains this source ref
              var couple = helpers.find(maybe(response).relationships, function(couple) {
                return !!helpers.find(maybe(couple).sources, {id: sourceRef.id});
              });
              return { $coupleId: couple.id };
            }, function(response) {
              return helpers.flatMap(maybe(response).relationships, function(couple) {
                return couple.sources;
              });
            }),
            helpers.objectExtender(function(response, sourceRef) {
              // get the child-and-parents that contains this source ref
              var childAndParents = helpers.find(maybe(response).childAndParentsRelationships, function(childAndParents) {
                return !!helpers.find(maybe(childAndParents).sources, {id: sourceRef.id});
              });
              return { $childAndParentsId: childAndParents.id };
            }, function(response) {
              return helpers.flatMap(maybe(response).childAndParentsRelationships, function(childAndParents) {
                return childAndParents.sources;
              });
            })
          ));
      }
    );
  };

  return exports;
});
