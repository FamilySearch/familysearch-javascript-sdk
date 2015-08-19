var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name memories.types:constructor.MemoryPersona
 * @description
 *
 * Memory Persona (not a true persona; can only contain a name and a media artifact reference)
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {name, memoryArtifactRef}.
 * To create a new memory persona, you must set memoryArtifactRef and name.
 * _name_ can be a {@link name.types:constructor.Name Name} object or a fullText string.
 * _NOTE_ memory persona names don't have given or surname parts, only fullText
 */
var MemoryPersona = FS.MemoryPersona = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data){
    
    if(data.name){
      this.setName(data.name);
    }
    
    if(data.memoryArtifactRef){
      this.setMemoryArtifactRef(data.memoryArtifactRef);
    }
    
  }
};

/**
 * @ngdoc function
 * @name memories.functions:createMemoryPersona
 * @param {Object} data MemoryPerson data which is a [Person](https://familysearch.org/developers/docs/api/gx/Person_json) with additional memory data.
 * @return {Object} {@link memories.types:constructor.MemoryPersona MemoryPersona}
 * @description Create a {@link memories.types:constructor.MemoryPersona MemoryPersona} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createMemoryPersona = function(data){
  return new MemoryPersona(this, data);
};

MemoryPersona.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: MemoryPersona,
  
  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getId
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {String} Id of the Memory Persona
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#isExtracted
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {Boolean} should always be true; probably useless
   */
  isExtracted: function(){ return this.data.extracted; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getMemoryPersonaUrl
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @return {String} memory persona URL
   */
  getMemoryPersonaUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('persona')).href); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getMemoryArtifactRef
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {MemoryArtifactRef} {@link memories.types:constructor.MemoryArtifactRef MemoryArtifactRef}
   */
  getMemoryArtifactRef: function() { return maybe(this.data.media)[0]; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getNames
   * @methodOf memories.types:constructor.MemoryPersona
   * @return {Name} a {@link name.types:constructor.Name Name}
   */
  getName: function() { return maybe(this.data.names)[0]; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getDisplayName
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @return {string} display name
   */
  getDisplayName: function() { return maybe(this.data.display).name; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getMemoryUrl
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @return {string} url of the memory
   */
  getMemoryUrl: function() { return this.helpers.removeAccessToken(maybe(this.getMemoryArtifactRef()).description); },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#getMemory
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @return {Object} promise for the {@link memories.functions:getMemory getMemory} response
   */
  getMemory:  function() {
    return this.client.getMemory(this.getMemoryUrl());
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#setName
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @param {Name|string} value name
   * @return {MemoryPersona} this memory persona
   */
  setName: function(value) {
    if (!(value instanceof FS.Name)) {
      value = this.client.createName(value);
    }
    this.data.names = [ value ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#setMemoryArtifactRef
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @param {MemoryArtifactRef} value memory artifact ref
   * @return {MemoryPersona} this memory persona
   */
  setMemoryArtifactRef: function(value) {
    this.data.media = [ value ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#save
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @description
   * Create a new memory persona (if this memory persona does not have an id) or update the existing memory persona.
   * Only the name can be updated, not the memory id or the memory artifact reference.
   *
   * {@link http://jsfiddle.net/eeozaLkL/1/ Editable Example}
   *
   * @param {string} url full url of the memory personas endpoint
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the memory persona URL, which is fulfilled after the memory persona has been updated,
   * and if refresh is true, after the memory persona has been read.
   */
  save: function(url, changeMessage, opts) {
    var self = this;
    return self.helpers.chainHttpPromises(
      self.helpers.refPromise(url ? url : self.getMemoryPersonaUrl()),
      function(url){
        return self.plumbing.post(url, { persons: [ self ] }, {}, opts, function(data, promise) {
          return self.getMemoryPersonaUrl() || self.helpers.removeAccessToken(promise.getResponseHeader('Location'));
        });
      }
    );
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona#delete
   * @methodOf memories.types:constructor.MemoryPersona
   * @function
   * @description delete this memory persona - see {@link memories.functions:deleteMemoryPersona deleteMemoryPersona}
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the memory persona URL
   */
  delete: function(changeMessage, opts) {
    return this.client.deleteMemoryPersona(this.getMemoryPersonaUrl(), changeMessage, opts);
  }

});