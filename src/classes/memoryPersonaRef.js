var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name memories.types:constructor.MemoryPersonaRef
 * @description
 *
 * Reference from a person to a memory persona
 * To create a new memory persona reference, you must set both $personId and memoryPersona
 *
 * _NOTE_: memory persona references cannot be updated. They can only be created or deleted.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
 *
 * @param {Object=} data an object with optional attributes {$personId, memoryPersona}.
 * _memoryPersona_ can be a {@link memories.types:constructor.MemoryPersona MemoryPersona} or a memory persona url
 */
var MemoryPersonaRef = FS.MemoryPersonaRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name memories.functions:createMemoryPersonaRef
 * @param {Object} data [EvidenceReference](https://familysearch.org/developers/docs/api/gx/EvidenceReference_json) data
 * @return {Object} {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRef}
 * @description Create a {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRef} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createMemoryPersonaRef = function(data){
  return new MemoryPersonaRef(this, data);
};

MemoryPersonaRef.prototype = {
  constructor: MemoryPersonaRef,
  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersonaRef#id
   * @propertyOf memories.types:constructor.MemoryPersonaRef
   * @return {String} Id of the Memory Persona Reference
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersonaRef#resource
   * @propertyOf memories.types:constructor.MemoryPersonaRef
   * @return {String} URL of the Memory Persona
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersonaRef#resourceId
   * @propertyOf memories.types:constructor.MemoryPersonaRef
   * @return {String} Id of the Memory Persona
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryPersonaRef#$personId
   * @propertyOf memories.types:constructor.MemoryPersonaRef
   * @return {String} Id of the person to which this persona is attached
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$getMemoryPersonaRefUrl
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @return {String} URL of this memory persona reference; _NOTE_ however, that individual memory persona references cannot be read
   */
  $getMemoryPersonaRefUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links)['evidence-reference']).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$getMemoryPersonaUrl
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @return {String} URL of the memory persona (without the access token);
   * pass into {@link memories.functions:getMemoryPersona getMemoryPersona} for details
   */
  $getMemoryPersonaUrl: function() { return this.$helpers.removeAccessToken(this.resource); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$getMemoryPersona
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @return {Object} promise for the {@link memories.functions:getMemoryPersona getMemoryPersona} response
   */
  $getMemoryPersona:  function() {
    return this.$client.getMemoryPersona(this.$getMemoryPersonaUrl());
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$getMemoryUrl
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @return {String} URL of the memory; pass into {@link memories.functions:getMemory getMemory} for details
   */
  $getMemoryUrl:  function() {
    return this.$helpers.removeAccessToken(maybe(maybe(this.links).memory).href);
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$getMemory
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @return {Object} promise for the {@link memories.functions:getMemory getMemory} response
   */
  $getMemory:  function() {
    return this.$client.getMemory(this.$getMemoryUrl());
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$setMemoryPersona
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @function
   * @param {MemoryPersona|string} memoryPersona MemoryPersona object or memory persona URL
   * @return {MemoryPersonaRef} this memory persona ref
   */
  $setMemoryPersona: function(memoryPersona) {
    if (memoryPersona instanceof FS.MemoryPersona) {
      //noinspection JSUnresolvedFunction
      memoryPersona = memoryPersona.$getMemoryPersonaUrl();
    }
    // we must remove the access token in order to pass this into addMemoryPersonaRef
    this.resource = this.$helpers.removeAccessToken(memoryPersona);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$save
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @description
   * Create a new memory persona ref
   *
   * NOTE: there's no _refresh_ parameter because it's not possible to read individual memory persona references;
   * however, the memory persona ref's id and URL is set when creating a new memory persona ref
   *
   * {@link http://jsfiddle.net/DallanQ/wrNj2/ editable example}
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the memory persona ref URL, which is fulfilled after the memory persona ref has been created
   * (note however that individual memory persona references cannot be read).
   */
  $save: function(changeMessage, opts) {
    var self = this;
    return self.$helpers.chainHttpPromises(
      self.$plumbing.getUrl('person-memory-persona-references-template', null, {pid: self.$personId}),
      function(url) {
        return self.$plumbing.post(url, { persons: [{ evidence: [ self ] }] }, {}, opts, function(data, promise) {
          if (!self.id) {
            self.id = promise.getResponseHeader('X-ENTITY-ID');
          }
          if (!self.$getMemoryPersonaRefUrl()) {
            self.links = { 'evidence-reference' : { href: promise.getResponseHeader('Location') } };
          }
          return self.$getMemoryPersonaRefUrl();
        });
      });
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#$delete
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @function
   * @description delete this memory persona reference - see {@link memories.functions:deleteMemoryPersonaRef deleteMemoryPersonaRef}
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the memory persona ref URL
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteMemoryPersonaRef(this.$getMemoryPersonaRefUrl() || this.$personId, this.id, changeMessage, opts);
  }

};