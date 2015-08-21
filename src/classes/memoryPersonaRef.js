var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name memories.types:constructor.MemoryPersonaRef
 * @description
 *
 * Reference from a person to a memory persona
 * To create a new memory persona reference you must set memoryPersona
 *
 * _NOTE_: memory persona references cannot be updated. They can only be created or deleted.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {memoryPersona}.
 * _memoryPersona_ can be a {@link memories.types:constructor.MemoryPersona MemoryPersona} or a memory persona url
 */
var MemoryPersonaRef = FS.MemoryPersonaRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data && data.memoryPersona){
    this.setMemoryPersona(data.memoryPersona);
    delete data.memoryPersona;
  }
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

MemoryPersonaRef.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: MemoryPersonaRef,
  
  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getId
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {String} Id of the Memory Persona Reference
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getResource
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {String} URL of the Memory Persona
   */
  getResource: function(){ return this.data.resource; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getResourceId
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {String} Id of the Memory Persona
   */
  getResourceId: function(){ return this.data.resourceId; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getMemoryPersonaRefUrl
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {String} URL of this memory persona reference; _NOTE_ however, that individual memory persona references cannot be read
   */
  getMemoryPersonaRefUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('evidence-reference')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getMemoryPersonaUrl
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {String} URL of the memory persona (without the access token);
   * pass into {@link memories.functions:getMemoryPersona getMemoryPersona} for details
   */
  getMemoryPersonaUrl: function() { return this.helpers.removeAccessToken(this.data.resource); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getMemoryPersona
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {Object} promise for the {@link memories.functions:getMemoryPersona getMemoryPersona} response
   */
  getMemoryPersona:  function() {
    return this.client.getMemoryPersona(this.getMemoryPersonaUrl());
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getMemoryUrl
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {String} URL of the memory; pass into {@link memories.functions:getMemory getMemory} for details
   */
  getMemoryUrl:  function() {
    return this.helpers.removeAccessToken(maybe(this.getLink('memory')).href);
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#getMemory
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @return {Object} promise for the {@link memories.functions:getMemory getMemory} response
   */
  getMemory:  function() {
    return this.client.getMemory(this.getMemoryUrl());
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#setMemoryPersona
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @param {MemoryPersona|string} memoryPersona MemoryPersona object or memory persona URL
   * @return {MemoryPersonaRef} this memory persona ref
   */
  setMemoryPersona: function(memoryPersona) {
    if (memoryPersona instanceof FS.MemoryPersona) {
      //noinspection JSUnresolvedFunction
      memoryPersona = memoryPersona.getMemoryPersonaUrl();
    }
    // we must remove the access token in order to pass this into addMemoryPersonaRef
    this.data.resource = this.helpers.removeAccessToken(memoryPersona);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#save
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @description
   * Create a new memory persona ref
   *
   * NOTE: there's no _refresh_ parameter because it's not possible to read individual memory persona references;
   * however, the memory persona ref's id and URL is set when creating a new memory persona ref
   *
   * {@link http://jsfiddle.net/r3px0ork/1/ Editable Example}
   *
   * @param {string} url full url for the person memory persona references endpoint
   * @return {Object} promise for the response
   */
  save: function(url) {
    var self = this;
    return self.plumbing.post(url, { persons: [{ evidence: [ self ] }] }).then(function(response){
      self.updateFromResponse(response, 'evidence-reference');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef#delete
   * @methodOf memories.types:constructor.MemoryPersonaRef
   * @description delete this memory persona reference - see {@link memories.functions:deleteMemoryPersonaRef deleteMemoryPersonaRef}
   * @return {Object} promise for the response
   */
  delete: function() {
    return this.client.deleteMemoryPersonaRef(this.getMemoryPersonaRefUrl());
  }

});