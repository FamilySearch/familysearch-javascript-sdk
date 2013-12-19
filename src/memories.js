define([
  'discussions',
  'helpers',
  'person',
  'plumbing'
], function(discussions, helpers, person, plumbing) {
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
   * @name memories.types:type.MemoryRef
   * @description
   *
   * A {@link memories.types:type.Memory Memory} id and a Memory Persona Id.
   * See {@link memories.functions:getMemoryPersonas getMemoryPersonas} for more information about Memory Personas.
   */
  var MemoryRef = exports.MemoryRef = function() {

  };

  exports.MemoryRef.prototype = {
    constructor: MemoryRef,
    /**
     * @ngdoc property
     * @name memories.types:type.MemoryRef#resourceId
     * @propertyOf memories.types:type.MemoryRef
     * @return {String} Id of the Memory Persona to which this person is connected
     */

    /**
     * @ngdoc function
     * @name memories.types:type.MemoryRef#getMemoryId
     * @methodOf memories.types:type.MemoryRef
     * @function
     * @return {String} Id of the memory; pass into {@link memories.functions:getMemory getMemory} for details
     */
    getMemoryId:  function() { return this.resource ? this.resource.replace(/^.*\/memories\/(\d+)\/.*$/, '$1') : this.resource; }
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
   * - `getMemoryRefs()` - get an array of {@link memories.types:type.MemoryRef MemoryRefs} from the response
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
   * @name memories.types:type.Memory
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
     * @name memories.types:type.Memory#id
     * @propertyOf memories.types:type.Memory
     * @return {String} Id of the Memory
     */

    /**
     * @ngdoc property
     * @name memories.types:type.Memory#mediaType
     * @propertyOf memories.types:type.Memory
     * @return {String} media type; e.g., image/jpeg
     */

    /**
     * @ngdoc property
     * @name memories.types:type.Memory#resourceType
     * @propertyOf memories.types:type.Memory
     * @return {String} resource type; e.g., http://gedcomx.org/DigitalArtifact
     */

    /**
     * @ngdoc property
     * @name memories.types:type.Memory#about
     * @propertyOf memories.types:type.Memory
     * @return {String} URL of the media object
     */

    /**
     * @ngdoc function
     * @name memories.types:type.Memory#getTitle
     * @methodOf memories.types:type.Memory
     * @function
     * @return {String} title
     */
    getTitle: function() { return maybe(maybe(this.titles)[0]).value; },

    /**
     * @ngdoc function
     * @name memories.types:type.Memory#getDescription
     * @methodOf memories.types:type.Memory
     * @function
     * @return {String} description
     */
    getDescription: function() { return maybe(maybe(this.description)[0]).value; },

    /**
     * @ngdoc function
     * @name memories.types:type.Memory#getArtifactFilenames
     * @methodOf memories.types:type.Memory
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
     * @name memories.types:type.Memory#getIconURL
     * @methodOf memories.types:type.Memory
     * @function
     * @return {String} URL of the icon
     */
    getIconURL: function() { return maybe(maybe(this.links)['image-icon']).href; },

    /**
     * @ngdoc function
     * @name memories.types:type.Memory#getThumbnailURL
     * @methodOf memories.types:type.Memory
     * @function
     * @return {String} URL of the thumbnail
     */
    getThumbnailURL: function() { return maybe(maybe(this.links)['image-thumbnail']).href; },

    /**
     * @ngdoc function
     * @name memories.types:type.Memory#getModified
     * @methodOf memories.types:type.Memory
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
   * - `getMemories()` - get the array of {@link memories.types:type.Memory Memories} from the response
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
   * - `getMemories()` - get the array of {@link memories.types:type.Memory Memories} from the response
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
   * - `getMemory()` - get the {@link memories.types:type.Memory Memory} from the response
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
   * - `getComments()` - get the array of {@link discussions.types:type.Comment Comments} from the response
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
   * {@link person.types:type.Person Person} whose id is a *Persona Id* instead of a *Person Id*
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
        helpers.objectExtender({getPersonas: function() { return this.persons || []; }}),
        helpers.constructorSetter(person.Person, 'persons')
      ));
  };

  /**
   * @ngdoc function
   * @name memories.functions:getPersonPortraitURL
   * @function
   *
   * @description
   * Get a URL that will redirect to the portrait of a person
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memories_Portrait_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/f8DU3/ editable example}
   *
   * @param {String} id of the person
   * @return {String} URL that will redirect to the portrait of a person
   */
  // TODO add the default parameter
  exports.getPersonPortraitURL = function(id) {
    return helpers.getServerUrl('/platform/tree/persons/'+encodeURI(id)+'/portrait');
  };

  // TODO think about a way to test whether a person has a portrait: default to / and see if it redirects there

  return exports;
});
