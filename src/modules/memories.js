var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name memories
 * @description
 * Functions related to memories
 *
 * {@link https://familysearch.org/developers/docs/api/resources#memories FamilySearch API Docs}
 */

// TODO check whether it's possible now to update story contents (and how to do it)
// TODO add functions to attach & detach photos to a story when the API exists

FS.prototype._memoriesResponseMapper = function(response){
  var self = this,
      data = maybe(response.getData());
  utils.forEach(data.sourceDescriptions, function(descr, i){
    data.sourceDescriptions[i] = self.createMemory(descr);
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getPersonMemoriesQuery
 * @description
 * Get a paged list of memories for a person
 * The response includes the following convenience function
 *
 * - `getMemories()` - get the array of {@link memories.types:constructor.Memory Memories} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the person-memories-query endpoint
 * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0,
 * `type` type of artifacts to return - possible values are photo and story - defaults to both
 * @return {Object} promise for the response
 */
FS.prototype.getPersonMemoriesQuery = function(url, params) {
  var self = this;
  return self.plumbing.get(url, params).then(function(response){
    self._memoriesResponseMapper(response);
    return utils.extend(response, {
      getMemories: function() { 
        return maybe(this.getData()).sourceDescriptions || []; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getUserMemoriesQuery
 * @description
 * Get a paged list of memories for a user
 * The response includes the following convenience function
 *
 * - `getMemories()` - get the array of {@link memories.types:constructor.Memory Memories} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/User_Memories_resource FamilySearch API Docs}
 *
 *
 * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0
 * @return {Object} promise for the response
 */
FS.prototype.getUserMemoriesQuery = function(params) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSMEM', 'artifacts').then(function(url){
    return self.plumbing.get(url, null, {'X-Expect-Override':'200-ok'});
  }).then(function(response){
    return response.getHeader('Location');    
  }).then(function(url) {
    return self.plumbing.get(url, params);
  }).then(function(response){
    self._memoriesResponseMapper(response);
    return utils.extend(response, {
      getMemories: function() { 
        return maybe(this.getData()).sourceDescriptions || []; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemory
 * @description
 * Get information about a memory
 * The response includes the following convenience function
 *
 * - `getMemory()` - get the {@link memories.types:constructor.Memory Memory} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the memory
 * @return {Object} promise for the response
 */
FS.prototype.getMemory = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    self._memoriesResponseMapper(response);
    return utils.extend(response, {
      getMemory: function() { 
        return maybe(maybe(this.getData()).sourceDescriptions)[0]; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryComments
 * @description
 * Get comments for a memory
 * The response includes the following convenience function
 *
 * - `getComments()` - get the array of {@link discussions.types:constructor.Comment Comments} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Comments_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the memory-comments endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryComments = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    self._commentsResponseMapper(response);
    return response;
  });
};

FS.prototype._memoryPersonasMapper = function(response){
  var self = this,
      data = maybe(response.getData());
  
  utils.forEach(data.persons, function(person, i){
    utils.forEach(person.media, function(media, j){
      person.media[j] = self.createMemoryArtifactRef(media);
    });
    utils.forEach(person.names, function(name, j){
      person.names[j] = self.createName(name);
    });
    data.persons[i] = self.createMemoryPersona(person);
  }); 
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryPersonas
 * @description
 * Get personas for a memory
 * The response includes the following convenience function
 *
 * - `getMemoryPersonas()` - get the array of {@link memories.types:constructor.MemoryPersona MemoryPersonas} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the memory-personas endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryPersonas = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var data = maybe(response.getData());
    self._memoryPersonasMapper(response);
    return utils.extend(response, {
      getMemoryPersonas: function() {
        return data.persons || [];
      }
    });
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryPersona
 * @description
 * Get a single memory persona
 * The response includes the following convenience function
 *
 * - `getMemoryPersona()` - get the {@link memories.types:constructor.MemoryPersona MemoryPersona} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Persona_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the memory persona
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryPersona = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var data = maybe(response.getData());
    self._memoryPersonasMapper(response);
    return utils.extend(response, {
      getMemoryPersona: function() { 
        return maybe(data.persons)[0]; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryPersonaRefs
 * @deprecated
 * @description
 * 
 * __This method is deprecated as of {@link https://familysearch.org/developers/news/2016-09 December 6, 2016}. Use {@link person.functions:getPerson getPerson()} to retrieve memory references.__
 * 
 * Get references to memories for a person
 * The response includes the following convenience function
 *
 * - `getMemoryPersonaRefs()` - get an array of {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the person-memory-references endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryPersonaRefs = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {
    'X-Expect-Override': '200-ok',
    'X-FS-Feature-Tag': 'consolidate-redundant-resources'
  })
  .then(function(response){
    return self.plumbing.get(response.getHeader('Location'));
  })
  .then(function(response){
    var data = maybe(response.getData());
    utils.forEach(data.persons, function(person){
      utils.forEach(person.evidence, function(evidence, j){
        person.evidence[j] = self.createMemoryPersonaRef(evidence);
      });
    });
    return utils.extend(response, {
      getMemoryPersonaRefs: function() {
        return maybe(maybe(data.persons)[0]).evidence || [];
      }
    });
  });
};

/**
 * @ngdoc function
 * @name memories.functions:getPersonPortraitUrl
 * @description
 * Get the URL of the portrait of a person.
 * The response includes the following convenience function
 * 
 * - `getPortraitUrl()` - get the portrait url from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_Portrait_resource FamilySearch API Docs}
 *
 *
 * @param {String} url of the person portrait endpoint
 * @param {Object=} params `default` URL to redirect to if portrait doesn't exist
 * @return {Object} promise for the response
 */
FS.prototype.getPersonPortraitUrl = function(url, params) {
  var self = this;
  return self.plumbing.get(url, params, { 'X-Expect-Override': '200-ok' }).then(function(response){
    response.getPortraitUrl = function(){
      return response.getStatusCode() === 204 ? '' : self.helpers.appendAccessToken(response.getHeader('Location'));
    };
    return response;
  });
};

// TODO wrap call to read all portrait urls

/**
 * @ngdoc function
 * @name memories.functions:deleteMemory
 * @description
 * Delete the specified memory
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the memory
 * @return {Object} promise for the response
 */
FS.prototype.deleteMemory = function(url) {
  return this.plumbing.del(url);
};

/**
 * @ngdoc function
 * @name memories.functions:deleteMemoryPersona
 * @description
 * Delete the specified memory persona
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Persona_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the memory persona
 * @return {Object} promise for the response
 */
FS.prototype.deleteMemoryPersona = function(url) {
  return this.plumbing.del(url);
};

/**
 * @ngdoc function
 * @name memories.functions:deleteMemoryPersonaRef
 * @description
 * Delete the specified memory persona ref
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_Reference_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the memory persona reference
 * @return {Object} promise for the response
 */
FS.prototype.deleteMemoryPersonaRef = function(url) {
  return this.plumbing.del(url);
};
