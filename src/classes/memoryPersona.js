var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**********************************/
/**
 * @ngdoc function
 * @name memories.types:constructor.MemoryPersona
 * @description
 *
 * Memory Persona (not a true persona; can only contain a name and a media artifact reference)
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
 *
 * @param {Object=} data an object with optional attributes {$memoryId, name, memoryArtifactRef}.
 * To create a new memory persona, you must set $memoryId and name.
 * _name_ can be a {@link name.types:constructor.Name Name} object or a fullText string.
 * _NOTE_ memory persona names don't have given or surname parts, only fullText
 *********************************/

var MemoryPersona = FS.MemoryPersona = function(client, data) {
  this.$client = client;
  this.$helpers = client.helpers;
  this.$plumbing = client.plumbing;
  utils.extend(this, data);
};

FS.prototype.createMemoryPersona = function(data){
  return new MemoryPersona(this, data);
};

MemoryPersona.prototype = {
  constructor: MemoryPersona,
  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersona#id
   * @propertyOf memories.types:constructor.MemoryPersona
   * @return {String} Id of the Memory Persona
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersona#extracted
   * @propertyOf memories.types:constructor.MemoryPersona
   * @return {String} not sure what this means
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersona#$memoryId
   * @propertyOf memories.types:constructor.MemoryPersona
   * @return {String} Id of the memory to which this persona is attached
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$getMemoryPersonaUrl
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @return {String} memory persona URL
   */
  $getMemoryPersonaUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).persona).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$getMemoryArtifactRef
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {MemoryArtifactRef} {@link memories.types:constructor.MemoryArtifactRef MemoryArtifactRef}
   */
  $getMemoryArtifactRef: function() { return maybe(this.media)[0]; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$getNames
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {Name} a {@link name.types:constructor.Name Name}
   */
  $getName: function() { return maybe(this.names)[0]; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$getDisplayName
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @return {string} display name
   */
  $getDisplayName: function() { return maybe(this.display).name; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$getMemoryUrl
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @return {string} url of the memory
   */
  $getMemoryUrl: function() { return this.$helpers.removeAccessToken(maybe(this.$getMemoryArtifactRef()).description); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$getMemory
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @return {Object} promise for the {@link memories.functions:getMemory getMemory} response
   */
  $getMemory:  function() {
    return this.$client.getMemory(this.$getMemoryUrl() || this.$memoryId);
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$setName
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @param {Name|string} value name
   * @return {MemoryPersona} this memory persona
   */
  $setName: function(value) {
    if (!(value instanceof FS.Name)) {
      value = this.$client.createName(value);
    }
    this.names = [ value ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$setMemoryArtifactRef
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @param {MemoryArtifactRef} value memory artifact ref
   * @return {MemoryPersona} this memory persona
   */
  $setMemoryArtifactRef: function(value) {
    this.media = [ value ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$save
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @description
   * Create a new memory persona (if this memory persona does not have an id) or update the existing memory persona.
   * Only the name can be updated, not the memory id or the memory artifact reference.
   *
   * {@link http://jsfiddle.net/DallanQ/dLfA8/ editable example}
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @param {boolean=} refresh true to read the memory persona after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the memory persona URL, which is fulfilled after the memory persona has been updated,
   * and if refresh is true, after the memory persona has been read.
   */
  $save: function(changeMessage, refresh, opts) {
    var self = this;
    var promise = self.$helpers.chainHttpPromises(
      self.$plumbing.getUrl((self.id ? 'memory-persona-template' : 'memory-personas-template'), null, {mid: self.$memoryId, pid: self.id}),
      function(url) {
        if (!self.$getMemoryArtifactRef()) {
          // default the media artifact reference to point to the memory
          // the discovery resource is guaranteed to be set due to the getUrl statement
          var memoryUrl = self.$helpers.getUrlFromDiscoveryResource(self.$client.settings.discoveryResource, 'memory-template', {mid: self.$memoryId});
          self.$setMemoryArtifactRef(self.$client.createMemoryArtifactRef({description: memoryUrl}));
        }
        return self.$plumbing.post(url, { persons: [ self ] }, {}, opts, function(data, promise) {
          return self.$getMemoryPersonaUrl() || self.$helpers.removeAccessToken(promise.getResponseHeader('Location'));
        });
      });
    var returnedPromise = promise.then(function(url) {
      self.$helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
      if (refresh) {
        // re-read the person and set this object's properties from response
        return self.$client.getMemoryPersona(url, null, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getMemoryPersona());
          return url;
        });
      }
      else {
        return url;
      }
    });
    return returnedPromise;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#$delete
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @description delete this memory persona - see {@link memories.functions:deleteMemoryPersona deleteMemoryPersona}
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the memory persona URL
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteMemoryPersona(this.$getMemoryPersonaUrl() || this.$memoryId, this.id, changeMessage, opts);
  }

};