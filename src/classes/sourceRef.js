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
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var SourceRef = FS.SourceRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if (data.sourceDescription) {
      //noinspection JSUnresolvedFunction
      this.setSourceDescription(data.sourceDescription);
      delete data.sourceDescription;
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
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getId
   * @methodOf sources.types:constructor.SourceRef
   * @return {string} Id of the source reference
   */

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getAttribution
   * @methodOf sources.types:constructor.SourceRef
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */
   
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getDescription
   * @methodOf sources.types:constructor.SourceRef
   * @returns {String} description
   */
  getDescription: function(){ return this.data.description; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getSourceRefUrl
   * @methodOf sources.types:constructor.SourceRef

   * @return {string} URL of this source reference - _NOTE_ however that you cannot read individual source references
   */
  getSourceRefUrl: function() {
    return this.helpers.removeAccessToken(maybe(this.getLink('source-reference')).href);
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getSourceDescriptionUrl
   * @methodOf sources.types:constructor.SourceRef

   * @return {string} URL of the source description - pass into {@link sources.functions:getSourceDescription getSourceDescription} for details
   */
  getSourceDescriptionUrl: function() {
    if(this.getDescription().charAt(0) !== '#'){
      return this.helpers.removeAccessToken(this.getDescription());
    }
  },
  
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getSourceDescriptionId
   * @methodOf sources.types:constructor.SourceRef

   * @return {string} Id of the source description
   */
  getSourceDescriptionId: function() {
    if(this.getDescription().charAt(0) === '#'){
      return this.getDescription().substr(1);
    } else {
      return this.getSourceDescriptionUrl().split('/').pop();
    }
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getSourceDescription
   * @methodOf sources.types:constructor.SourceRef
   * @return {Object} promise for the {@link sources.functions:getSourceDescription getSourceDescription} response
   */
  getSourceDescription: function() {
    return this.client.getSourceDescription(this.getSourceDescriptionUrl());
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#getTags
   * @methodOf sources.types:constructor.SourceRef
   * @return {string[]} an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
   */
  getTags: function() { 
    return utils.map(this.data.tags, function(tag) {
      return tag.resource;
    });
  },
  
  /**
   * @ngdoc function
   * @name sources.type:constructor.SourceRef#getAttachedEntityId
   * @methodOf sources.types:constructor.SourceRef
   * @return {String} ID of the person, couple, or child and parents that this source ref is attached to
   */
  getAttachedEntityId: function() {
    // We store it outside of the data object so that it doesn't get serialized
    return this.attachedEntityId;
  },
  
  /**
   * @ngdoc function
   * @name sources.type:constructor.SourceRef#getAttachedEntityUrl
   * @methodOf sources.types:constructor.SourceRef
   * @return {String} URL of the person, couple, or child and parents that this source ref is attached to
   */
  getAttachedEntityUrl: function() {
    // We store it outside of the data object so that it doesn't get serialized
    return this.attachedEntityUrl;
  },
  
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#setAttachedEntityId
   * @methodOf sources.types:constructor.SourceRef
   * @param {string} entityId ID of the person, couple, or child and parents that this source ref is attached to
   * @return {SourceRef} this source reference
   */
  setAttachedEntityId: function(entityId) {
    this.attachedEntityId = entityId;
    return this;
  },
  
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#setAttachedEntityUrl
   * @methodOf sources.types:constructor.SourceRef
   * @param {string} entityUrl URL of the person, couple, or child and parents that this source ref is attached to
   * @return {SourceRef} this source reference
   */
  setAttachedEntityUrl: function(entityUrl) {
    this.attachedEntityUrl = this.helpers.removeAccessToken(entityUrl);
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#setSourceDescription
   * @methodOf sources.types:constructor.SourceRef
   * @param {SourceDescription|string} srcDesc SourceDescription object or URL of the source description
   * @return {SourceRef} this source reference
   */
  setSourceDescription: function(srcDesc) {
    if (srcDesc instanceof FS.SourceDescription) {
      this.data.description = srcDesc.getSourceDescriptionUrl();
    }
    else {
      this.data.description = this.helpers.removeAccessToken(srcDesc);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#setTags
   * @methodOf sources.types:constructor.SourceRef

   * @param {string[]} tags an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
   * @return {SourceRef} this source reference
   */
  setTags: function(tags) {
    this.data.tags = utils.map(tags, function(tag) {
      return {resource: tag};
    });
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#addTag
   * @methodOf sources.types:constructor.SourceRef

   * @param {string} tag tag to add
   * @return {SourceRef} this source reference
   */
  addTag: function(tag) {
    if (!utils.isArray(this.data.tags)) {
      this.tags = [];
    }
    this.data.tags.push({resource: tag});
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#removeTag
   * @methodOf sources.types:constructor.SourceRef

   * @param {string} tag tag to remove
   * @return {SourceRef} this source reference
   */
  removeTag: function(tag) {
    tag = utils.find(this.data.tags, {resource: tag});
    if (tag) {
      this.data.tags.splice(utils.indexOf(this.data.tags, tag), 1);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#save
   * @methodOf sources.types:constructor.SourceRef

   * @description
   * Create a new source reference (if this source reference does not have an id) or update the existing source reference
   *
   * _NOTE_: there's no _refresh_ parameter because it's not possible to read individual source references;
   * however, the source reference's id and URL are set when creating a new source reference.
   *
   * _NOTE_: the person/couple/childAndParents id and the source description are not updateable.
   * Only the tags are updateable.
   *
   *
   * @param {string} url url for a person, couple, or child and parents source references endpoint
   * @param {string} changeMessage change message
   * @return {Object} promise of the source reference id, which is fulfilled after the source reference has been updated
   */
  save: function(url, changeMessage) {
    var self = this;
    if (changeMessage) {
      self.setAttribution(self.client.createAttribution(changeMessage));
    }
    var entityType = self.helpers.getEntityType(url);
    var headers = {};
    if (entityType === 'childAndParentsRelationships') {
      headers['Content-Type'] = 'application/x-fs-v1+json';
    }

    var payload = {};
    payload[entityType] = [ { sources: [ self ] } ];
    return self.plumbing.post(url, payload, headers).then(function(response){
      self.updateFromResponse(response, 'source-reference');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceRef#delete
   * @methodOf sources.types:constructor.SourceRef

   * @description delete this source reference
   * - see {@link sources.functions:deletePersonSourceRef deletePersonSourceRef},
   * {@link sources.functions:deleteCoupleSourceRef deleteCoupleSourceRef}, or
   * {@link sources.functions:deleteChildAndParentsSourceRef deleteChildAndParentsSourceRef}
   *
   * @param {string} changeMessage reason for the deletion
   * @return {Object} promise for the source reference URL
   */
  delete: function(changeMessage) {
    return this.client.deleteSourceRef(this.getSourceRefUrl(), changeMessage);
  }

});