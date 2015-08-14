var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name sources.types:constructor.SourceRef
 * @description Reference from a person or relationship to a source.
 *
 * FamilySearch API Docs:
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource Person SourceRef},
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_References_resource Couple SourceRef}, and
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource ChildAndParents SourceRef}
 *
 * @param {Object=} data an object with optional attributes {$tags. $sourceDescription}.
 * _$tags_ is an array (string[]) of tag names
 */
var SourceRef = FS.SourceRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.$sourceDescription) {
      //noinspection JSUnresolvedFunction
      this.$setSourceDescription(data.$sourceDescription);
    }
    if (data.$tags) {
      //noinspection JSUnresolvedFunction
      this.$setTags(data.$tags);
    }
    if (data.attribution && !(data.attribution instanceof FS.Attribution)) {
      this.attribution = client.createAttribution(data.attribution);
    }
  }
};

/**
 * @ngdoc function
 * @name sources.functions:createSourceRef
 * @param {Object} data [SourceReference](https://familysearch.org/developers/docs/api/gx/SourceReference_json) data
 * @return {Object} {@link sources.types:constructor.SourceRef SourceRef}
 * @description Create a {@link sources.types:constructor.SourceRef SourceRef} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createSourceRef = function(data){
  return new SourceRef(this, data);
};

SourceRef.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
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
   * @name sources.types:constructor.SourceRef#$getSourceRefUrl
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @return {string} URL of this source reference - _NOTE_ however that you cannot read individual source references
   */
  $getSourceRefUrl: function() {
    return this.$helpers.removeAccessToken(maybe(maybe(this.links)['source-reference']).href);
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$getSourceDescriptionUrl
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @return {string} URL of the source description - pass into {@link sources.functions:getSourceDescription getSourceDescription} for details
   */
  $getSourceDescriptionUrl: function() {
    return this.$helpers.removeAccessToken(this.description);
  },
  
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$getSourceDescriptionId
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @return {string} Id of the source description
   */
  $getSourceDescriptionId: function() {
    return this.$getSourceDescriptionUrl().split('/').pop();
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$getSourceDescription
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @return {Object} promise for the {@link sources.functions:getSourceDescription getSourceDescription} response
   */
  $getSourceDescription: function() {
    return this.$client.getSourceDescription(this.$getSourceDescriptionUrl());
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$getTags
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @return {string[]} an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
   */
  $getTags: function() { 
    return utils.map(this.tags, function(tag) {
      return tag.resource;
    });
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#$setSourceDescription
   * @methodOf sources.types:constructor.SourceRef
   * @function
   * @param {SourceDescription|string} srcDesc SourceDescription object or URL of the source description
   * @return {SourceRef} this source reference
   */
  $setSourceDescription: function(srcDesc) {
    if (srcDesc instanceof FS.SourceDescription) {
      this.description = srcDesc.$getSourceDescriptionUrl();
    }
    else {
      this.description = srcDesc;
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
    this.tags = utils.map(tags, function(tag) {
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
    if (!utils.isArray(this.tags)) {
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
    tag = utils.find(this.tags, {resource: tag});
    if (tag) {
      this.tags.splice(utils.indexOf(this.tags, tag), 1);
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
   * {@link http://jsfiddle.net/sqsejsjq/1/ Editable Example}
   *
   * @param {string} url url for a person, couple, or child and parents source references endpoint
   * @param {string} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the source reference id, which is fulfilled after the source reference has been updated
   */
  $save: function(url, changeMessage, opts) {
    var self = this;
    if (changeMessage) {
      self.attribution = self.$client.createAttribution(changeMessage);
    }
    var entityType = self.$helpers.getEntityType(url);
    var headers = {};
    if (entityType === 'childAndParentsRelationships') {
      headers['Content-Type'] = 'application/x-fs-v1+json';
    }
    self.description = self.$helpers.removeAccessToken(self.description);
    var payload = {};
    payload[entityType] = [ { sources: [ self ] } ];
    return self.$plumbing.post(url, payload, headers, opts, function(data, promise) {
      // x-entity-id and location headers are not set on update, only on create
      if (!self.id) {
        self.id = promise.getResponseHeader('X-ENTITY-ID');
      }
      if (!self.$getSourceRefUrl()) {
        self.links = { 'source-reference' : { href: self.$helpers.removeAccessToken(promise.getResponseHeader('Location')) } };
      }
      return self.$getSourceRefUrl();
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
    return this.$client.deleteSourceRef(this.$getSourceRefUrl(), changeMessage, opts);
  }

});