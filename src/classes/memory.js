var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name memories.types:constructor.Memory
 * @description
 *
 * Memory
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
 *
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {title, description, artifactFilename, data}.
 * data_ is a string for Stories, or a FormData for Images or Documents
 * - if FormData, the field name of the file to upload _must_ be `artifact`.
 * data_ is ignored when updating a memory.
 * _description_ doesn't appear to apply to stories.
 *
 * __NOTE__ it is not currently possible to update memory contents - not even for stories
 */
var Memory = FS.Memory = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name memories.functions:createMemory
 * @param {Object} data Memory data which is a [SourceDescription](https://familysearch.org/developers/docs/api/gx/SourceDescription_json) data
 * @return {Object} {@link memories.types:constructor.Memory Memory}
 * @description Create a {@link memories.types:constructor.Memory Memory} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createMemory = function(data){
  return new Memory(this, data);
};

Memory.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Memory,
  
  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getId
   * @methodOf memories.types:constructor.Memory
   * @return {String} Id of the Memory
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getMediaType
   * @methodOf memories.types:constructor.Memory
   * @return {String} media type; e.g., image/jpeg
   */
  getMediaType: function(){ return this.data.mediaType; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getResourceType
   * @methodOf memories.types:constructor.Memory
   * @return {String} resource type; e.g., http://gedcomx.org/DigitalArtifact
   */
  getResourceType: function(){ return this.data.resourceType; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getAbout
   * @methodOf memories.types:constructor.Memory
   * @return {String} memory artifact URL
   */
  getAbout: function(){ return this.data.about; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getArtifactMetadata
   * @methodOf memories.types:constructor.Memory
   * @return {Object[]} array of { `artifactType`, `filename` }
   */
  getArtifactMetadata: function(){ return maybe(this.data.artifactMetadata); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getAttribution
   * @methodOf memories.types:constructor.Memory
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getTitle
   * @methodOf memories.types:constructor.Memory
   * @return {String} title
   */
  getTitle: function() { return maybe(maybe(this.data.titles)[0]).value; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getDescription
   * @methodOf memories.types:constructor.Memory
   * @return {String} description (may not apply to story memories)
   */
  getDescription: function() { return maybe(maybe(this.data.description)[0]).value; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getIconUrl
   * @methodOf memories.types:constructor.Memory
   * @return {String} URL of the icon with access token
   */
  getIconUrl: function() { return this.helpers.appendAccessToken(maybe(this.getLink('image-icon')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getThumbnailUrl
   * @methodOf memories.types:constructor.Memory
   * @return {String} URL of the thumbnail with access token
   */
  getThumbnailUrl: function() { return this.helpers.appendAccessToken(maybe(this.getLink('image-thumbnail')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getImageUrl
   * @methodOf memories.types:constructor.Memory
   * @return {String} URL of the full image with access token
   */
  getImageUrl: function() { return this.helpers.appendAccessToken(maybe(this.getLink('image')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getMemoryArtifactUrl
   * @methodOf memories.types:constructor.Memory
   * @return {String} URL of the memory artifact (image, story, or document) with access token
   */
  getMemoryArtifactUrl: function() {
    // remove old access token and append a new one in case they are different
    return this.helpers.appendAccessToken(this.helpers.removeAccessToken(this.data.about));
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getMemoryUrl
   * @methodOf memories.types:constructor.Memory
   * @return {String} memory URL (without the access token)
   */
  getMemoryUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('description')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getArtifactFilename
   * @methodOf memories.types:constructor.Memory
   * @return {String} filename (provided by the user or a default name)
   */
  getArtifactFilename: function() { return maybe(maybe(this.data.artifactMetadata)[0]).filename; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getArtifactType
   * @methodOf memories.types:constructor.Memory
   * @return {String} type; e.g., http://familysearch.org/v1/Image
   */
  getArtifactType: function() { return maybe(maybe(this.data.artifactMetadata)[0]).artifactType; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getArtifactHeight
   * @methodOf memories.types:constructor.Memory
   * @return {number} image height
   */
  getArtifactHeight: function() { return maybe(maybe(this.data.artifactMetadata)[0]).height; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getArtifactWidth
   * @methodOf memories.types:constructor.Memory
   * @return {number} image width
   */
  getArtifactWidth: function() { return maybe(maybe(this.data.artifactMetadata)[0]).width; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getCommentsUrl
   * @methodOf memories.types:constructor.Memory
   * @return {String} URL of the comments endpoint
   * - pass into {@link memories.functions:getMemoryComments getMemoryComments} for details
   */
  getCommentsUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('comments')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#getComments
   * @methodOf memories.types:constructor.Memory
   * @return {Object} promise for the {@link memories.functions:getMemoryComments getMemoryComments} response
   */
  getComments: function() { return this.client.getMemoryComments(this.getCommentsUrl()); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#setTitle
   * @methodOf memories.types:constructor.Memory
   * @param {String} title memory title
   * @return {Memory} this memory
   */
  setTitle: function(title) {
    this.data.titles = [ { value: title } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#setDescription
   * @methodOf memories.types:constructor.Memory
   * @param {String} description memory description (may not apply to story memories)
   * @return {Memory} this memory
   */
  setDescription: function(description) {
    this.data.description = [ { value: description } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#setArtifactFilename
   * @methodOf memories.types:constructor.Memory
   * @param {String} filename uploaded file
   * @return {Memory} this memory
   */
  setArtifactFilename: function(filename) {
    if (!utils.isArray(this.data.artifactMetadata) || !this.artifactMetadata.length) {
      this.data.artifactMetadata = [ {} ];
    }
    this.data.artifactMetadata[0].filename = filename;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#save
   * @methodOf memories.types:constructor.Memory
   * @description
   * Create a new memory (if this memory does not have an id) or update the existing memory
   *
   * {@link http://jsfiddle.net/f2wrtgj0/1/ Editable Example}
   *
   * @return {Object} promise for the response
   */
  save: function() {
    var self = this,
        urlPromise = self.getMemoryUrl() ? Promise.resolve(self.getMemoryUrl()) : self.plumbing.getCollectionUrl('FSMEM', 'artifacts');
    return urlPromise.then(function(url) {
      if (self.getId()) {
        // update memory
        return self.plumbing.post(url, { sourceDescriptions: [ self ] });
      }
      else {
        // create memory
        var params = {};
        if (self.getTitle()) {
          params.title = self.getTitle();
        }
        if (self.getDescription()) {
          params.description = self.getDescription();
        }
        if (self.getArtifactFilename()) {
          params.filename = self.getArtifactFilename();
        }
        return self.plumbing.post(self.helpers.appendQueryParameters(url, params),
          self.data.data, { 'Content-Type': utils.isString(self.data.data) ? 'text/plain' : 'multipart/form-data' }).then(function(response){
            self.updateFromResponse(response, 'description');
            return response;
          });
      }
    });
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#delete
   * @methodOf memories.types:constructor.Memory
   * @description delete this memory - see {@link memories.functions:deleteMemory deleteMemory}
   * @return {Object} promise for the response
   */
  delete: function() {
    return this.client.deleteMemory(this.getMemoryUrl());
  }

});