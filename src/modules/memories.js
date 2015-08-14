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

FS.prototype._memoriesResponseMapper = function(){
  var self = this;
  return function(response){
    if(response && utils.isArray(response.sourceDescriptions)){
      for(var i = 0; i < response.sourceDescriptions.length; i++){
        if(response.sourceDescriptions[i].attribution){
          response.sourceDescriptions[i].attribution = self.createAttribution(response.sourceDescriptions[i].attribution);
        }
        response.sourceDescriptions[i] = self.createMemory(response.sourceDescriptions[i]);
      }
    }
    return response;
  };
};

/**
 * @ngdoc function
 * @name memories.functions:getPersonMemoriesQuery
 * @function
 *
 * @description
 * Get a paged list of memories for a person
 * The response includes the following convenience function
 *
 * - `getMemories()` - get the array of {@link memories.types:constructor.Memory Memories} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_Query_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/48hw65vz/1/ Editable Example}
 *
 * @param {string} url full URL of the person-memories-query endpoint
 * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0,
 * `type` type of artifacts to return - possible values are photo and story - defaults to both
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonMemoriesQuery = function(url, params, opts) {
  var self = this;
  return self.plumbing.get(url, params, {}, opts, 
    utils.compose(
      // TODO when the response contains personas, add a function to return them (last checked 14 July 14)
      utils.objectExtender({getMemories: function() { return this.sourceDescriptions || []; }}),
      self._memoriesResponseMapper()
    ));
};

/**
 * @ngdoc function
 * @name memories.functions:getUserMemoriesQuery
 * @function
 *
 * @description
 * Get a paged list of memories for a user
 * The response includes the following convenience function
 *
 * - `getMemories()` - get the array of {@link memories.types:constructor.Memory Memories} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/User_Memories_Query_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/ywg2um4q/1/ Editable Example}
 *
 * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getUserMemoriesQuery = function(params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getCollectionUrl('FSMEM', 'artifacts'),
    function(url){
      var promise = self.plumbing.get(url, null, {'X-Expect-Override':'200-ok'}, null, function(){
        return promise.getResponseHeader('Location');
      });
      return promise;
    },
    function(url) {
      return self.plumbing.get(url, params, {}, opts, 
        utils.compose(
          // TODO when the response contains personas, add a function to return them (last checked 14 July 14)
          utils.objectExtender({getMemories: function() { return this.sourceDescriptions || []; }}),
          self._memoriesResponseMapper()
        ));
    });
};

/**
 * @ngdoc function
 * @name memories.functions:getMemory
 * @function
 *
 * @description
 * Get information about a memory
 * The response includes the following convenience function
 *
 * - `getMemory()` - get the {@link memories.types:constructor.Memory Memory} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/k064qtLt/1/ Editable Example}
 *
 * @param {String} url full URL of the memory
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getMemory = function(url, params, opts) {
  var self = this;
  return self.plumbing.get(url, params, {}, opts, 
    utils.compose(
      // TODO when the response contains personas, add a function to return them (last checked 14 July 14)
      utils.objectExtender({getMemory: function() { return maybe(this.sourceDescriptions)[0]; }}),
      self._memoriesResponseMapper()
    ));
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryComments
 * @function
 *
 * @description
 * Get comments for a memory
 * The response includes the following convenience function
 *
 * - `getComments()` - get the array of {@link discussions.types:constructor.Comment Comments} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Comments_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/n4rtc6mo/1/ Editable Example}
 *
 * @param {String} url full URL of the memory-comments endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryComments = function(url, params, opts) {
  var self = this;
  return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
    utils.compose(
      self._commentsResponseMapper(),
      utils.objectExtender(function(response) {
        return { $memoryId: maybe(maybe(maybe(response).sourceDescriptions)[0]).id };
      }, function(response) {
        return maybe(maybe(maybe(response).discussions)[0])['comments'];
      })
    ));
};

FS.prototype._memoryPersonasMapper = function(){
  var self = this;
  return utils.compose(
    function(response){
      if(response && utils.isArray(response.persons)){
        for(var i = 0; i < response.persons.length; i++){
          response.persons[i] = self.createMemoryPersona(response.persons[i]);
        }
      }
      return response;
    },
    function(response){
      if(response && utils.isArray(response.persons)){
        for(var i = 0; i < response.persons.length; i++){
          if(utils.isArray(response.persons[i].names)){
            for(var j = 0; j < response.persons[i].names.length; j++){
              response.persons[i].names[j] = self.createName(response.persons[i].names[j]);
            }
          }
        }
      }
      return response;
    },
    function(response){
      if(response && utils.isArray(response.persons)){
        for(var i = 0; i < response.persons.length; i++){
          if(response.persons[i].media){
            response.persons[i].media = self.createMemoryArtifactRef(response.persons[i].media);
          }
        }
      }
      return response;
    },
    utils.objectExtender(function(response) {
      return { $memoryId: maybe(maybe(response.sourceDescriptions)[0]).id };
    }, function(response) {
      return maybe(response).persons;
    })
  );
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryPersonas
 * @function
 *
 * @description
 * Get personas for a memory
 * The response includes the following convenience function
 *
 * - `getMemoryPersonas()` - get the array of {@link memories.types:constructor.MemoryPersona MemoryPersonas} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/ozybtk5v/1/ Editable Example}
 *
 * @param {string} url full URL of the memory-personas endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryPersonas = function(url, params, opts) {
  var self = this;
  return self.plumbing.get(url, params, {}, opts,
    utils.compose(
      utils.objectExtender({getMemoryPersonas: function() {
        return this && this.persons ? this.persons : [];
      }}),
      self._memoryPersonasMapper()
    ));
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryPersona
 * @function
 *
 * @description
 * Get a single memory persona
 * The response includes the following convenience function
 *
 * - `getMemoryPersona()` - get the {@link memories.types:constructor.MemoryPersona MemoryPersona} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Persona_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/180vfb1w/1/ Editable Example}
 *
 * @param {String} url full URL of the memory persona
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryPersona = function(url, params, opts) {
  var self = this;
  return self.plumbing.get(url, params, {}, opts,
    utils.compose(
      utils.objectExtender({getMemoryPersona: function() { return maybe(this.persons)[0]; }}),
      self._memoryPersonasMapper()
    ));
};

/**
 * @ngdoc function
 * @name memories.functions:getMemoryPersonaRefs
 * @function
 *
 * @description
 * Get references to memories for a person
 * The response includes the following convenience function
 *
 * - `getMemoryPersonaRefs()` - get an array of {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/Ldveszee/1/ Editable Example}
 *
 * @param {String} url full URL of the person-memory-references endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getMemoryPersonaRefs = function(url, params, opts) {
  var self = this;
  return self.plumbing.get(url, params, {}, opts,
    utils.compose(
      utils.objectExtender({getMemoryPersonaRefs: function() {
        return maybe(maybe(this.persons)[0]).evidence || [];
      }}),
      function(response){
        try {
        if(response && utils.isArray(response.persons) && response.persons[0]){
          var person = response.persons[0];
          if(person.evidence && utils.isArray(person.evidence)){
            for(var i = 0; i < person.evidence.length; i++){
              person.evidence[i] = self.createMemoryPersonaRef(person.evidence[i]);
            }
          }
        }
        } catch(e) { console.error(e.stack); }
        return response;
      },
      utils.objectExtender(function(response) {
        return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
      }, function(response) {
        return maybe(maybe(maybe(response).persons)[0]).evidence;
      })
    ));
};

/**
 * @ngdoc function
 * @name memories.functions:getPersonPortraitUrl
 * @function
 *
 * @description
 * Get the URL of the portrait of a person
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_Portrait_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/oc4g7334/2/ Editable Example}
 *
 * @param {String} url of the person portrait endpoint
 * @param {Object=} params `default` URL to redirect to if portrait doesn't exist;
 * `followRedirect` if true, follow the redirect and return the final URL
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the URL
 */
FS.prototype.getPersonPortraitUrl = function(url, params, opts) {
  var self = this;
  if (params && params.followRedirect) {
    params = utils.extend({}, params);
    delete params.followRedirect;
    var promise = self.plumbing.get(url, params, { 'X-Expect-Override': '200-ok' }, opts);
    // we don't use chaining directly between the .get() and the .then() because .then()
    // returns a new promise representing the return value of the resolve/reject functions
    return promise.then(function(){
      return promise.getStatusCode() === 204 ? '' : self.helpers.appendAccessToken(promise.getResponseHeader('Location'));
    });
  }
  else {
    return self.helpers.refPromise(self.helpers.appendAccessToken(url));
  }
};

// TODO wrap call to read all portrait urls

/**
 * @ngdoc function
 * @name memories.functions:deleteMemory
 * @function
 *
 * @description
 * Delete the specified memory
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/r3bb6e0u/1/ Editable Example}
 *
 * @param {string} url full URL of the memory
 * @param {string=} changeMessage change message (currently ignored)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the memory id/URL
 */
FS.prototype.deleteMemory = function(url, changeMessage, opts) {
  return this.plumbing.del(url, {}, opts, function() {
    return url;
  });
};

/**
 * @ngdoc function
 * @name memories.functions:deleteMemoryPersona
 * @function
 *
 * @description
 * Delete the specified memory persona
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Persona_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/77ba424q/1/ Editable Example}
 *
 * @param {string} url full URL of the memory persona
 * @param {string=} changeMessage change message (currently ignored)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the mid
 */
FS.prototype.deleteMemoryPersona = function(url, changeMessage, opts) {
  return this.plumbing.del(url, {}, opts, function() {
    return url;
  });
};

/**
 * @ngdoc function
 * @name memories.functions:deleteMemoryPersonaRef
 * @function
 *
 * @description
 * Delete the specified memory persona ref
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_Reference_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/cbcs86s5/1/ Editable Example}
 *
 * @param {string} url full URL of the memory persona reference
 * @param {string=} changeMessage change message (currently ignored)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the pid
 */
FS.prototype.deleteMemoryPersonaRef = function(url, changeMessage, opts) {
  return this.plumbing.del(url, {}, opts, function() {
    return url;
  });
};
