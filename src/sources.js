if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
  './attribution',
  './globals',
  './helpers',
  './plumbing'
], function(attribution, globals, helpers, plumbing) {
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
   * _about_ is a URL (link to the record) it can be a memory URL.
   **********************************/

  var SourceDescription = exports.SourceDescription = function(data) {
    if (data) {
      this.about = data.about;
      if (data.citation) {
        //noinspection JSUnresolvedFunction
        this.$setCitation(data.citation);
      }
      if (data.title) {
        //noinspection JSUnresolvedFunction
        this.$setTitle(data.title);
      }
      if (data.text) {
        //noinspection JSUnresolvedFunction
        this.$setText(data.text);
      }
    }
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
     * @name sources.types:constructor.SourceDescription#$getSourceDescriptionUrl
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {String} Url of the of this source description
     */
    $getSourceDescriptionUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).description).href); },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$getSourceRefsQuery
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @return {Object} promise for the {@link sources.functions:getSourceRefsQuery getSourceRefsQuery} response
     */
    $getSourceRefsQuery: function() {
      return exports.getSourceRefsQuery(this.id);
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$setCitation
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @param {String} citation source description citation
     * @return {SourceDescription} this source description
     */
    $setCitation: function(citation) {
      this.citations = [ { value: citation } ];
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$setTitle
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @param {String} title source description title
     * @return {SourceDescription} this source description
     */
    $setTitle: function(title) {
      this.titles = [ { value: title } ];
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$setText
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @param {String} text source description text
     * @return {SourceDescription} this source description
     */
    $setText: function(text) {
      this.notes = [ { text: text } ];
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$save
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @description
     * Create a new source description (if this source description does not have an id) or update the existing source description
     *
     * {@link http://jsfiddle.net/DallanQ/b95Hs/ editable example}
     *
     * @param {string=} changeMessage change message
     * @param {boolean=} refresh true to read the source description after updating
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the source description id, which is fulfilled after the source description has been updated,
     * and if refresh is true, after the source description has been read.
     */
    $save: function(changeMessage, refresh, opts) {
      var self = this;
      if (changeMessage) {
        self.attribution = new attribution.Attribution(changeMessage);
      }
      var promise = helpers.chainHttpPromises(
        self.id ? plumbing.getUrl('source-description-template', null, {sdid: self.id}) : plumbing.getUrl('source-descriptions'),
        function(url) {
          return plumbing.post(url, { sourceDescriptions: [ self ] }, {}, opts, function(data, promise) {
            // x-entity-id and location headers are not set on update, only on create
            return self.id || promise.getResponseHeader('X-ENTITY-ID');
          });
        });
      var returnedPromise = promise.then(function(sdid) {
        helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
        if (refresh) {
          // re-read the SourceDescription and set this object's properties from response
          return exports.getSourceDescription(sdid, {}, opts).then(function(response) {
            helpers.deletePropertiesPartial(self, helpers.appFieldRejector);
            helpers.extend(self, response.getSourceDescription());
            return sdid;
          });
        }
        else {
          return sdid;
        }
      });
      return returnedPromise;
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceDescription#$delete
     * @methodOf sources.types:constructor.SourceDescription
     * @function
     * @description delete this source description as well as all source references that refer to this source description
     * - see {@link sources.functions:deleteSourceDescription deleteSourceDescription}
     *
     * @param {string} changeMessage reason for the deletion
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the source description id
     */
    $delete: function(changeMessage, opts) {
      // must use the id, not the full url, here
      return exports.deleteSourceDescription(this.id, changeMessage, opts);
    }

  };

  /**********************************/
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef
   * @description
   * Reference from a person or relationship to a source.
   * To create a new SourceRef you must set sourceDescription and either $personId, $coupleId, or $childAndParentsId
   *
   * FamilySearch API Docs:
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource Person SourceRef},
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_References_resource Couple SourceRef}, and
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource ChildAndParents SourceRef}
   *
   * @param {Object=} data an object with optional attributes {$personId, $coupleId, $childAndParentsId, sourceDescription, tags}.
   * _sourceDescription_ can be a {@link sources.types:constructor.SourceDescription SourceDescription},
   * a source description id, or a source description URL.
   * _tags_ is an array (string[]) of tag names
   **********************************/

  var SourceRef = exports.SourceRef = function(data) {
    if (data) {
      this.$personId = data.$personId;
      this.$coupleId = data.$coupleId;
      this.$childAndParentsId = data.$childAndParentsId;
      if (data.sourceDescription) {
        //noinspection JSUnresolvedFunction
        this.$setSourceDescription(data.sourceDescription);
      }
      if (data.tags) {
        //noinspection JSUnresolvedFunction
        this.$setTags(data.tags);
      }
    }
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
     * @ngdoc property
     * @name sources.types:constructor.SourceRef#$sourceDescriptionId
     * @propertyOf sources.types:constructor.SourceRef
     * @return {string} Id of the source description
     */

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$getSourceRefUrl
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {string} URL of this source reference - _NOTE_ however that you cannot read individual source references
     */
    $getSourceRefUrl: function() {
      return helpers.removeAccessToken(maybe(maybe(this.links)['source-reference']).href);
    },

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
     * @name sources.types:constructor.SourceRef#$getTags
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @return {string[]} an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
     */
    $getTags: function() { return helpers.map(this.tags, function(tag) {
        return tag.resource;
      });
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$setSourceDescription
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @param {SourceDescription|string} srcDesc SourceDescription object, or id or URL of the source description
     * @return {SourceRef} this source reference
     */
    $setSourceDescription: function(srcDesc) {
      if (srcDesc instanceof SourceDescription) {
        this.$sourceDescriptionId = srcDesc.id;
        this.description = srcDesc.$getSourceDescriptionUrl();
      }
      else if (helpers.isAbsoluteUrl(srcDesc)) {
        delete this.$sourceDescriptionId;
        this.description = this.$sourceDescriptionUrl;
      }
      else {
        this.$sourceDescriptionId = srcDesc;
        delete this.description;
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$setTags
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @param {string[]} tags an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
     * @return {SourceRef} this source reference
     */
    $setTags: function(tags) {
      this.tags = helpers.map(tags, function(tag) {
        return {resource: tag};
      });
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$addTag
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @param {string} tag tag to add
     * @return {SourceRef} this source reference
     */
    $addTag: function(tag) {
      if (!helpers.isArray(this.tags)) {
        this.tags = [];
      }
      this.tags.push({resource: tag});
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$removeTag
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @param {string} tag tag to remove
     * @return {SourceRef} this source reference
     */
    $removeTag: function(tag) {
      tag = helpers.find(this.tags, {resource: tag});
      if (tag) {
        this.tags.splice(helpers.indexOf(this.tags, tag), 1);
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$save
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @description
     * Create a new source reference (if this source reference does not have an id) or update the existing source reference
     *
     * _NOTE_: there's no _refresh_ parameter because it's not possible to read individual source references;
     * however, the source reference's id and URL are set when creating a new source reference.
     *
     * _NOTE_: the person/couple/childAndParents id and the source description are not updateable.
     * Only the tags are updateable.
     *
     * {@link http://jsfiddle.net/DallanQ/v8cvd/ editable example}
     *
     * @param {string} changeMessage change message
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the source reference id, which is fulfilled after the source reference has been updated
     */
    $save: function(changeMessage, opts) {
      var self = this;
      if (changeMessage) {
        self.attribution = new attribution.Attribution(changeMessage);
      }
      var template, label;
      var headers = {};
      if (self.$personId) {
        template = 'person-source-references-template';
        label = 'persons';
      }
      else if (self.$coupleId) {
        template = 'couple-relationship-source-references-template';
        label = 'relationships';
      }
      else if (self.$childAndParentsId) {
        template = 'child-and-parents-relationship-source-references-template';
        template = 'child-and-parents-relationship-source-references-template';
        label = 'childAndParentsRelationships';
        headers['Content-Type'] = 'application/x-fs-v1+json';
      }
      return helpers.chainHttpPromises(
        plumbing.getUrl(template, null, {pid: self.$personId, crid: self.$coupleId, caprid: self.$childAndParentsId, srid: self.id}),
        function(url) {
          if (!self.description && !!self.$sourceDescriptionId) {
            // the discovery resource is guaranteed to be set due to the getUrl statement
            self.description = helpers.getUrlFromDiscoveryResource(globals.discoveryResource, 'source-description-template',
                                                                   {sdid: self.$sourceDescriptionId});
          }
          self.description = helpers.removeAccessToken(self.description);
          var payload = {};
          payload[label] = [ { sources: [ self ] } ];
          return plumbing.post(url, payload, headers, opts, function(data, promise) {
            // x-entity-id and location headers are not set on update, only on create
            if (!self.id) {
              self.id = promise.getResponseHeader('X-ENTITY-ID');
            }
            if (!self.$getSourceRefUrl()) {
              self.links = { 'source-reference' : { href: helpers.removeAccessToken(promise.getResponseHeader('Location')) } };
            }
            return self.id;
          });
        });
    },

    /**
     * @ngdoc function
     * @name sources.types:constructor.SourceRef#$delete
     * @methodOf sources.types:constructor.SourceRef
     * @function
     * @description delete this source reference
     * - see {@link sources.functions:deletePersonSourceRef deletePersonSourceRef},
     * {@link sources.functions:deleteCoupleSourceRef deleteCoupleSourceRef}, or
     * {@link sources.functions:deleteChildAndParentsSourceRef deleteChildAndParentsSourceRef}
     *
     * @param {string} changeMessage reason for the deletion
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the source reference URL
     */
    $delete: function(changeMessage, opts) {
      if (this.$personId) {
        return exports.deletePersonSourceRef(this.$getSourceRefUrl() || this.$personID, this.id, changeMessage, opts);
      }
      else if (this.$coupleId) {
        return exports.deleteCoupleSourceRef(this.$getSourceRefUrl() || this.$coupleId, this.id, changeMessage, opts);
      }
      else {
        return exports.deleteChildAndParentsSourceRef(this.$getSourceRefUrl() || this.$childAndParentsId, this.id, changeMessage, opts);
      }
    }

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
      sdid = sdid.$getSourceDescriptionUrl() || sdid.$sourceDescriptionId;
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
        id = sdid.$sourceDescriptionId || sdid.$getSourceDescriptionUrl();
        url = sdid.$getSourceDescriptionUrl() || sdid.$sourceDescriptionId;
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
   * @param {String} sdid id of the source description (cannot be the URL)
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSourceRefsQuery = function(sdid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('source-references-query'),
      function(url) {
        url = helpers.appendQueryParameters(url, {source: sdid});
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
              return {
                $personId: person.id,
                $sourceDescriptionId: sdid
              };
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
              return {
                $coupleId: couple.id,
                $sourceDescriptionId: sdid
              };
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
              return {
                $childAndParentsId: childAndParents.id,
                $sourceDescriptionId: sdid
              };
            }, function(response) {
              return helpers.flatMap(maybe(response).childAndParentsRelationships, function(childAndParents) {
                return childAndParents.sources;
              });
            })
          ));
      }
    );
  };

  function getSourcesResponseMapper(root, label, includeDescriptions) {
    return helpers.compose(
      helpers.objectExtender(helpers.removeEmptyProperties({
        getSourceRefs: function() {
          return maybe(maybe(this[root])[0]).sources || [];
        },
        getSourceDescriptions: includeDescriptions ? function() {
          return this.sourceDescriptions || [];
        } : null,
        getSourceDescription: includeDescriptions ? function(id) {
          return helpers.find(this.sourceDescriptions, {id: id});
        } : null
      })),
      helpers.constructorSetter(SourceRef, 'sources', function(response) {
        return maybe(maybe(response)[root])[0];
      }),
      helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
        return maybe(maybe(maybe(response)[root])[0]).sources;
      }),
      helpers.objectExtender(function(response, srcRef) {
        var result;
        if (helpers.isAbsoluteUrl(srcRef.description)) {
          // TODO check whether source description id is in source references as resourceId (last checked 14 July 14)
          result = {
            $sourceDescriptionId: helpers.getLastUrlSegment(srcRef.description)
          };
        }
        else { // '#id' format (or maybe just 'id', though 'id' may be deprecated now)
          var sdid = srcRef.description.charAt(0) === '#' ? srcRef.description.substr(1) : srcRef.description;
          result = {
            $sourceDescriptionId: sdid,
            description: helpers.getUrlFromDiscoveryResource(globals.discoveryResource, 'source-description-template',
              {sdid: sdid})
          };
        }
        result[label] = maybe(maybe(maybe(response)[root])[0]).id;
        return result;
      }, function(response) {
        return maybe(maybe(maybe(response)[root])[0]).sources;
      }),
      includeDescriptions ? helpers.constructorSetter(SourceDescription, 'sourceDescriptions') : null,
      includeDescriptions ? helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
        return response.sourceDescriptions;
      }) : null
    );
  }

  /**
   * @ngdoc function
   * @name sources.functions:getPersonSourceRefs
   * @function
   *
   * @description
   * Get the source references for a person
   * The response includes the following convenience function
   *
   * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/BkydV/ editable example}
   *
   * @param {String} pid person id or full URL of the source-references endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonSourceRefs = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-source-references-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts, getSourcesResponseMapper('persons', '$personId', false));
      });
  };
  
  /**
   * @ngdoc function
   * @name sources.functions:getPersonSourcesQuery
   * @function
   *
   * @description
   * Get source references and descriptions for a person
   * The response includes the following convenience functions
   *
   * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
   * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
   * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
   * with the specified source description id from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Sources_Query_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/8Dy8n/ editable example}
   *
   * @param {String} pid person id or full URL of the person-sources-query endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonSourcesQuery = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-sources-query-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts, getSourcesResponseMapper('persons','$personId', true));
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
   * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
   * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
   * with the specified source description id from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ahu29/ editable example}
   *
   * @param {String} crid couple relationship id or full URL of the couple-relationship-source-references endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleSourceRefs = function(crid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-source-references-template', crid, {crid: crid}),
      function(url) {
        return plumbing.get(url, params, {}, opts, getSourcesResponseMapper('relationships', '$coupleId', false));
      });
  };
  
  /**
   * @ngdoc function
   * @name sources.functions:getCoupleSourcesQuery
   * @function
   *
   * @description
   * Get the source references and descriptions for a couple relationship
   * The response includes the following convenience function
   *
   * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
   * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
   * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
   * with the specified source description id from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Sources_Query_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/Hd34g/ editable example}
   *
   * @param {String} crid couple relationship id or full URL of the couple-relationship-sources-query endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleSourcesQuery = function(crid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-sources-query-template', crid, {crid: crid}),
      function(url) {
        return plumbing.get(url, params, {}, opts, getSourcesResponseMapper('relationships', '$coupleId', true));
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
   * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
   * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
   * with the specified source description id from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ZKLVT/ editable example}
   *
   * @param {String} caprid child-and-parents relationship id or full URL of the child-and-parents-relationship-sources-query endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsSourceRefs = function(caprid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-source-references-template', caprid, {caprid: caprid}),
      function(url) {
        return plumbing.get(url, params,
          {'Accept': 'application/x-fs-v1+json'}, opts, getSourcesResponseMapper('childAndParentsRelationships', '$childAndParentsId', false));
      });
  };

  /**
   * @ngdoc function
   * @name sources.functions:getChildAndParentsSourcesQuery
   * @function
   *
   * @description
   * Get the source references and descriptions for a child and parents relationship
   * The response includes the following convenience function
   *
   * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
   * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
   * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
   * with the specified source description id from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/SDVz2/ editable example}
   *
   * @param {String} caprid child-and-parents relationship id or full URL of the child-and-parents-relationship-sources-query endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsSourcesQuery = function(caprid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-sources-template', caprid, {caprid: caprid}),
      function(url) {
        return plumbing.get(url, params,
          {'Accept': 'application/x-fs-v1+json'}, opts, getSourcesResponseMapper('childAndParentsRelationships', '$childAndParentsId', true));
      });
  };

  /**
   * @ngdoc function
   * @name sources.functions:deleteSourceDescription
   * @function
   *
   * @description
   * Delete the specified source description as well as all source references that refer to it
   *
   * __NOTE__ if you delete a source description, FamilySearch does not automatically delete references to it.
   * Therefore, this function reads and deletes source references before deleting the source description.
   * FamilySearch is aware of this issue but hasn't committed to a fix.
   *
   * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/UNK8W/ editable example}
   *
   * @param {string} sdid id of the source description (cannot be the URL)
   * @param {string} changeMessage reason for the deletion
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the sdid
   */
  exports.deleteSourceDescription = function(sdid, changeMessage, opts) {
    // read the source references
    var returnedPromise = exports.getSourceRefsQuery(sdid, {}, opts).then(function(response) {
      // delete source references
      var promises = helpers.union(
        helpers.map(response.getPersonSourceRefs(), function(srcRef) {
          return exports.deletePersonSourceRef(srcRef.$getSourceRefUrl(), null, changeMessage, opts);
        }),
        helpers.map(response.getCoupleSourceRefs(), function(srcRef) {
          return exports.deleteCoupleSourceRef(srcRef.$getSourceRefUrl(), null, changeMessage, opts);
        }),
        helpers.map(response.getChildAndParentsSourceRefs(), function(srcRef) {
          return exports.deleteChildAndParentsSourceRef(srcRef.$getSourceRefUrl(), null, changeMessage, opts);
        }));
      // once the source references are deleted, delete the source description
      return helpers.promiseAll(promises).then(function() {
        var promise = helpers.chainHttpPromises(
          plumbing.getUrl('source-description-template', null, {sdid: sdid}),
          function(url) {
            return plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
              return sdid;
            });
          });
        helpers.extendHttpPromise(returnedPromise, promise); // extend this promise into the returned promise
        return promise;
      });
    });
    return returnedPromise;
  };

  /**
   * @ngdoc function
   * @name sources.functions:deletePersonSourceRef
   * @function
   *
   * @description
   * Delete the specified person source reference
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_Reference_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/eSbWF/ editable example}
   *
   * @param {string} changeMessage reason for the deletion
   * @param {string} pid person id or full url of the source reference
   * @param {string=} srid id of the source reference (must be set if pid is a person id and not the full URL)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the pid
   */
  exports.deletePersonSourceRef = function(pid, srid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-source-reference-template', pid, {pid: pid, srid: srid}),
      function(url) {
        return plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
          return pid;
        });
      }
    );
  };

  /**
   * @ngdoc function
   * @name sources.functions:deleteCoupleSourceRef
   * @function
   *
   * @description
   * Delete the specified couple source reference
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_Reference_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/2tau4/ editable example}
   *
   * @param {string} changeMessage reason for the deletion
   * @param {string} crid couple relationship id or full url of the source reference
   * @param {string=} srid id of the source reference (must be set if crid is a couple relationship id and not the full URL)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the crid
   */
  exports.deleteCoupleSourceRef = function(crid, srid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-source-reference-template', crid, {crid: crid, srid: srid}),
      function(url) {
        return plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
          return crid;
        });
      }
    );
  };

  /**
   * @ngdoc function
   * @name sources.functions:deleteChildAndParentsSourceRef
   * @function
   *
   * @description
   * Delete the specified child-and-parents source reference
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_Reference_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/awM4R/ editable example}
   *
   * @param {string} changeMessage reason for the deletion
   * @param {string} caprid child-and-parents relationship id or full url of the source reference
   * @param {string=} srid id of the source reference (must be set if caprid is a child-and-parents relationship id and not the full URL)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the caprid
   */
  exports.deleteChildAndParentsSourceRef = function(caprid, srid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-source-reference-template', caprid, {caprid: caprid, srid: srid}),
      function(url) {
        var headers = {'Content-Type' : 'application/x-fs-v1+json'};
        if (changeMessage) {
          headers['X-Reason'] = changeMessage;
        }
        return plumbing.del(url, headers, opts, function() {
          return caprid;
        });
      }
    );
  };

  return exports;
});
