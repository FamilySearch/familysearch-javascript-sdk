define([
  'discussions',
  'globals',
  'helpers',
  'person',
  'plumbing'
], function(discussions, globals, helpers, person, plumbing) {
  /**
   * @ngdoc overview
   * @name memories
   * @description
   * Functions related to memories
   *
   * {@link https://familysearch.org/developers/docs/api/resources#memories FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryRef
   * @description
   *
   * A {@link memories.types:constructor.Memory Memory} id and a Memory Persona Id.
   * See {@link memories.functions:getMemoryPersonas getMemoryPersonas} for more information about Memory Personas.
   */
  var MemoryRef = exports.MemoryRef = function(location, personaId) {
    if (personaId) {
      // MemoryRef(memoryId, personaId)
      this.resource = helpers.getAPIServerUrl('/platform/memories/memories/' + location + '/personas/' + personaId);
      this.resourceId = personaId;
    }
    else {
      // MemoryRef(location)
      // we must remove the access token in order to pass this into addPersonMemoryRef
      this.resource = location.replace(/\?.*$/, '');
      this.resourceId = helpers.getLastUrlSegment(location);
    }
  };

  exports.MemoryRef.prototype = {
    constructor: MemoryRef,
    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryRef#resourceId
     * @propertyOf memories.types:constructor.MemoryRef
     * @return {String} Id of the Memory Persona to which this person is connected
     */

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryRef#getMemoryId
     * @methodOf memories.types:constructor.MemoryRef
     * @function
     * @return {String} Id of the memory; pass into {@link memories.functions:getMemory getMemory} for details
     */
    getMemoryId:  function() {
      return this.resource ? this.resource.replace(/^.*\/memories\/([^\/]*)\/personas\/.*$/, '$1') : this.resource; }
  };

  /**
   * @ngdoc function
   * @name memories.functions:getPersonMemoryRefs
   * @function
   *
   * @description
   * Get references to memories for a person
   * The response includes the following convenience function
   *
   * - `getMemoryRefs()` - get an array of {@link memories.types:constructor.MemoryRef MemoryRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/vt79D/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMemoryRefs = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/memory-references', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemoryRefs: function() { return maybe(maybe(this.persons)[0]).evidence || []; }}),
        helpers.constructorSetter(MemoryRef, 'evidence', function(response) {
          return maybe(maybe(response).persons)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory
   * @description
   *
   * Memory
   */
  var Memory = exports.Memory = function() {

  };

  exports.Memory.prototype = {
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
     * @return {String} URL of the media object
     */

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#getTitle
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} title
     */
    getTitle: function() { return maybe(maybe(this.titles)[0]).value; },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#getDescription
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} description
     */
    getDescription: function() { return maybe(maybe(this.description)[0]).value; },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#getArtifactFilenames
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String[]} array of filenames
     */
    getArtifactFilenames: function() {
      return helpers.map(this.artifactMetadata, function(am) {
        return am.filename;
      });
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#getIconUrl
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} URL of the icon with access token
     */
    getIconUrl: function() { return helpers.appendAccessToken(maybe(maybe(this.links)['image-icon']).href); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#getThumbnailUrl
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} URL of the thumbnail with access token
     */
    getThumbnailUrl: function() { return helpers.appendAccessToken(maybe(maybe(this.links)['image-thumbnail']).href); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#getImageUrl
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} URL of the full image with access token
     */
    getImageUrl: function() { return helpers.appendAccessToken(maybe(maybe(this.links)['image']).href); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#getModified
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {Number} timestamp
     */
    getModified: function() { return maybe(this.attribution).modified; }
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
   * {@link http://jsfiddle.net/DallanQ/XaD23/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0, `type` type of artifacts to return - possible values are photo and story - defaults to both
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMemoriesQuery = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/memories', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemories: function() { return this.sourceDescriptions || []; }}),
        helpers.constructorSetter(Memory, 'sourceDescriptions')
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
   * {@link http://jsfiddle.net/DallanQ/V8pfd/ editable example}
   *
   * @param {String} id of the user
   * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getUserMemoriesQuery = function(id, params, opts) {
    return plumbing.get('/platform/memories/users/'+encodeURI(id)+'/memories', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemories: function() { return this.sourceDescriptions || []; }}),
        helpers.constructorSetter(Memory, 'sourceDescriptions')
      ));
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
   * {@link http://jsfiddle.net/DallanQ/9J4zn/ editable example}
   *
   * @param {String} id of the memory to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemory = function(id, params, opts) {
    return plumbing.get('/platform/memories/memories/'+encodeURI(id), params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemory: function() { return maybe(this.sourceDescriptions)[0]; }}),
        helpers.constructorSetter(Memory, 'sourceDescriptions')
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
   * {@link http://jsfiddle.net/DallanQ/aJ77f/ editable example}
   *
   * @param {String} mid of the memory to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryComments = function(mid, params, opts) {
    return plumbing.get('/platform/memories/memories/'+encodeURI(mid)+'/comments', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getComments: function() { return maybe(maybe(this.discussions)[0]).comments || []; }}),
        helpers.constructorSetter(discussions.Comment, 'comments', function(response) {
          return maybe(maybe(response).discussions)[0];
        })
      ));
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
   * - `getPersonas()` - get the array of *Personas* from the response; a *Persona* appears to be a scaled-down
   * {@link person.types:constructor.Person Person} whose id is a *Persona Id* instead of a *Person Id*
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/zD5V7/ editable example}
   *
   * @param {String} mid of the memory to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryPersonas = function(mid, params, opts) {
    return plumbing.get('/platform/memories/memories/'+encodeURI(mid)+'/personas', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getPersonas: function() { return this && this.persons ? this.persons : []; }}),
        helpers.constructorSetter(person.Person, 'persons')
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
   * {@link http://jsfiddle.net/DallanQ/f8DU3/ editable example}
   *
   * @param {String} pid of the person
   * @param {Object=} params `default` URL to redirect to if portrait doesn't exist;
   * `followRedirect` if true, follow the redirect and return the final URL
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the URL
   */
  exports.getPersonPortraitUrl = function(pid, params, opts) {
    var result;
    var path = '/platform/tree/persons/'+encodeURI(pid)+'/portrait';
    if (params && params.followRedirect) {
      params = helpers.extend({}, params);
      delete params.followRedirect;
      var d = globals.deferredWrapper();
      var promise = plumbing.get(path, params, {}, opts);
      result = helpers.extendHttpPromise(d.promise, promise);
      var handler = function() {
        // We don't expect the image content-type. We try to parse it as json and fail, so rely upon the status code
        d.resolve(promise.getStatusCode() === 200 ? helpers.appendAccessToken(promise.getResponseHeader('Content-Location')) : '');
      };
      promise.then(handler, handler);
    }
    else {
      result = helpers.appendAccessToken(helpers.getAPIServerUrl(path));
    }
    return helpers.refPromise(result);
  };

  /**
   * @ngdoc function
   * @name memories.functions:createMemory
   * @function
   *
   * @description
   * Create a memory (story or photo)
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memories_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/2ghkh/ editable example}
   *
   * @param {String|FormData} data string or a FormData object
   * @param {Object=} params `description`, `title`, `filename`, and `type` - artifact type
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the memory id
   */
  exports.createMemory = function(data, params, opts) {
    return plumbing.post(helpers.appendQueryParameters('/platform/memories/memories', params),
      data, { 'Content-Type': helpers.isString(data) ? 'text/plain' : 'multipart/form-data' }, opts,
      helpers.getLastResponseLocationSegment);
  };

  /**
   * @ngdoc function
   * @name memories.functions:createMemoryPersona
   * @function
   *
   * @description
   * Create a memory (story or photo)
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/dLfA8/ editable example}
   *
   * @param {String} mid memory id
   * @param {Person} persona persona is a mini-Person object attached to the memory; people are attached to specific personas
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the MemoryRef (memory id and persona id)
   */
  exports.createMemoryPersona = function(mid, persona, params, opts) {
    var data = {
      persons: [ persona ]
    };
    return plumbing.post('/platform/memories/memories/'+mid+'/personas', data, {}, opts,
      function(data, promise) {
        var location = promise.getResponseHeader('Location');
        return location ? new MemoryRef(location) : location;
      });
  };

  /**
   * @ngdoc function
   * @name memories.functions:addPersonMemoryRef
   * @function
   *
   * @description
   * Create a memory (story or photo)
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/wrNj2/ editable example}
   *
   * @param {String} pid person id
   * @param {MemoryRef} memoryRef reference to the memory and persona
   * @param {Object=} params `changeMessage` change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the persona id
   */
  exports.addPersonMemoryRef = function(pid, memoryRef, params, opts) {
    var data = {
      persons: [{
        evidence: [ memoryRef ]
      }]
    };
    if (params && params.changeMessage) {
      data.persons[0].attribution = {
        changeMessage: params.changeMessage
      };
    }
    return plumbing.post('/platform/tree/persons/'+pid+'/memory-references', data, {}, opts,
      helpers.getLastResponseLocationSegment);
  };

  return exports;
});
