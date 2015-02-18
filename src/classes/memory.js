var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/******************************************/
/**
 * @ngdoc function
 * @name memories.types:constructor.Memory
 * @description
 *
 * Memory
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
 *
 * @param {Object=} data an object with optional attributes {title, description, artifactFilename, $data}.
 * _$data_ is a string for Stories, or a FormData for Images or Documents
 * - if FormData, the field name of the file to upload _must_ be `artifact`.
 * _$data_ is ignored when updating a memory.
 * _description_ doesn't appear to apply to stories.
 *
 * __NOTE__ it is not currently possible to update memory contents - not even for stories
 ******************************************/

var Memory = FS.Memory = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

FS.prototype.createMemory = function(data){
  return new Memory(this, data);
};

Memory.prototype = {
  constructor: Memory,
  /**
   * @ngdoc property
   * @name memories.types:constructor.Memory#id
   * @propertyOf memories.types:constructor.Memory
   * @return {String} Id of the Memory
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.Memory#mediaType
   * @propertyOf memories.types:constructor.Memory
   * @return {String} media type; e.g., image/jpeg
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.Memory#resourceType
   * @propertyOf memories.types:constructor.Memory
   * @return {String} resource type; e.g., http://gedcomx.org/DigitalArtifact
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.Memory#about
   * @propertyOf memories.types:constructor.Memory
   * @return {String} memory artifact URL
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.Memory#artifactMetadata
   * @propertyOf memories.types:constructor.Memory
   * @return {Object[]} array of { `artifactType`, `filename` }
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.Memory#attribution
   * @propertyOf memories.types:constructor.Memory
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getTitle
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} title
   */
  $getTitle: function() { return maybe(maybe(this.titles)[0]).value; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getDescription
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} description (may not apply to story memories)
   */
  $getDescription: function() { return maybe(maybe(this.description)[0]).value; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getIconUrl
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} URL of the icon with access token
   */
  $getIconUrl: function() { return this.$helpers.appendAccessToken(maybe(maybe(this.links)['image-icon']).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getThumbnailUrl
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} URL of the thumbnail with access token
   */
  $getThumbnailUrl: function() { return this.$helpers.appendAccessToken(maybe(maybe(this.links)['image-thumbnail']).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getImageUrl
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} URL of the full image with access token
   */
  $getImageUrl: function() { return this.$helpers.appendAccessToken(maybe(maybe(this.links)['image']).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getMemoryArtifactUrl
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} URL of the memory artifact (image, story, or document) with access token
   */
  $getMemoryArtifactUrl: function() {
    // remove old access token and append a new one in case they are different
    return this.$helpers.appendAccessToken(this.$helpers.removeAccessToken(this.about));
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getMemoryUrl
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} memory URL (without the access token)
   */
  $getMemoryUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links)['description']).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getArtifactFilename
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} filename (provided by the user or a default name)
   */
  $getArtifactFilename: function() { return maybe(maybe(this.artifactMetadata)[0]).filename; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getArtifactType
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} type; e.g., http://familysearch.org/v1/Image
   */
  $getArtifactType: function() { return maybe(maybe(this.artifactMetadata)[0]).artifactType; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getArtifactHeight
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {number} image height
   */
  $getArtifactHeight: function() { return maybe(maybe(this.artifactMetadata)[0]).height; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getArtifactWidth
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {number} image width
   */
  $getArtifactWidth: function() { return maybe(maybe(this.artifactMetadata)[0]).width; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getCommentsUrl
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {String} URL of the comments endpoint
   * - pass into {@link memories.functions:getMemoryComments getMemoryComments} for details
   */
  $getCommentsUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).comments).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$getComments
   * @methodOf memories.types:constructor.Memory
   * @function
   * @return {Object} promise for the {@link memories.functions:getMemoryComments getMemoryComments} response
   */
  $getComments: function() { return this.$client.getMemoryComments(this.$getCommentsUrl() || this.id); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$setTitle
   * @methodOf memories.types:constructor.Memory
   * @function
   * @param {String} title memory title
   * @return {Memory} this memory
   */
  $setTitle: function(title) {
    this.titles = [ { value: title } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$setDescription
   * @methodOf memories.types:constructor.Memory
   * @function
   * @param {String} description memory description (may not apply to story memories)
   * @return {Memory} this memory
   */
  $setDescription: function(description) {
    this.description = [ { value: description } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$setArtifactFilename
   * @methodOf memories.types:constructor.Memory
   * @function
   * @param {String} filename uploaded file
   * @return {Memory} this memory
   */
  $setArtifactFilename: function(filename) {
    if (!helpers.isArray(this.artifactMetadata) || !this.artifactMetadata.length) {
      this.artifactMetadata = [ {} ];
    }
    this.artifactMetadata[0].filename = filename;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$save
   * @methodOf memories.types:constructor.Memory
   * @function
   * @description
   * Create a new memory (if this memory does not have an id) or update the existing memory
   *
   * {@link http://jsfiddle.net/DallanQ/2ghkh/ editable example}
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @param {boolean=} refresh true to read the discussion after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the memory id, which is fulfilled after the memory has been updated,
   * and if refresh is true, after the memory has been read.
   */
  $save: function(changeMessage, refresh, opts) {
    var self = this;
    var promise = self.$helpers.chainHttpPromises(
      self.id ? self.$plumbing.getUrl('memory-template', null, {mid: self.id}) : self.$plumbing.getUrl('memories'),
      function(url) {
        if (self.id) {
          // update memory
          return self.$plumbing.post(url, { sourceDescriptions: [ self ] }, {}, opts, function() {
            return self.id;
          });
        }
        else {
          // create memory
          var params = {};
          if (self.$getTitle()) {
            params.title = self.$getTitle();
          }
          if (self.$getDescription()) {
            params.description = self.$getDescription();
          }
          if (self.$getArtifactFilename()) {
            params.filename = self.$getArtifactFilename();
          }
          return self.$plumbing.post(self.$helpers.appendQueryParameters(url, params),
            self.$data, { 'Content-Type': utils.isString(self.$data) ? 'text/plain' : 'multipart/form-data' }, opts,
            self.$helpers.getResponseEntityId);
        }
      });
    var returnedPromise = promise.then(function(mid) {
      self.$helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
      if (refresh) {
        // re-read the person and set this object's properties from response
        return self.$client.getMemory(mid, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getMemory());
          return mid;
        });
      }
      else {
        return mid;
      }
    });
    return returnedPromise;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory#$delete
   * @methodOf memories.types:constructor.Memory
   * @function
   * @description delete this memory - see {@link memories.functions:deleteMemory deleteMemory}
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the memory URL
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteMemory(this.$getMemoryUrl() || this.id, changeMessage, opts);
  }

};