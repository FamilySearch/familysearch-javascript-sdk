define([
  'attribution',
  'discussions',
  'globals',
  'helpers',
  'name',
  'plumbing'
], function(attribution, discussions, globals, helpers, name, plumbing) {
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

  /******************************************/
  /**
   * @ngdoc function
   * @name memories.types:constructor.Memory
   * @description
   *
   * Memory
   ******************************************/

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
     * @return {String} description
     */
    $getDescription: function() { return maybe(maybe(this.description)[0]).value; },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$getIconUrl
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} URL of the icon with access token
     */
    $getIconUrl: function() { return helpers.appendAccessToken(maybe(maybe(this.links)['image-icon']).href); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$getThumbnailUrl
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} URL of the thumbnail with access token
     */
    $getThumbnailUrl: function() { return helpers.appendAccessToken(maybe(maybe(this.links)['image-thumbnail']).href); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$getImageUrl
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} URL of the full image with access token
     */
    $getImageUrl: function() { return helpers.appendAccessToken(maybe(maybe(this.links)['image']).href); },

    // TODO add a link to read comments when memories read from any endpoint include comments links

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$addMemoryPersona
     * @methodOf memories.types:constructor.Memory
     * @function
     * @param {MemoryPersona} memoryPersona people are attached to {@link memories.types:constructor.MemoryPersona MemoryPersonas}
     * @param {Object=} params currently unused
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRef}
     */
    $addMemoryPersona: function(memoryPersona, params, opts) {
      return exports.addMemoryPersona(this.id, memoryPersona, params, opts);
    }
};

  /**********************************/
  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersona
   * @description
   *
   * Memory Persona (not a true persona; can only contain a name and a media artifact reference)
   *
   * @param {Name|string=} name name to add
   * @param {string|MemoryArtifactRef=} mar URL of the memory artifact or the memory artifact ref to add
   *********************************/

  var MemoryPersona = exports.MemoryPersona = function(name, mar) {
    this.names = [];
    this.media = [];
    if (name) {
      //noinspection JSUnresolvedFunction
      this.$addName(name);
    }
    if (mar) {
      //noinspection JSUnresolvedFunction
      this.$addMemoryArtifactRef(mar);
    }
  };

  exports.MemoryPersona.prototype = {
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
     * @name memories.types:constructor.MemoryPersona#$getMemoryArtifactRef
     * @methodOf memories.types:constructor.MemoryPersona
     * @return {MemoryArtifactRef} {@link memories.types:constructor.MemoryArtifactRef MemoryArtifactRef}
     */
    $getMemoryArtifactRef: function() { return maybe(this.media)[0]; },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$getNames
     * @methodOf memories.types:constructor.MemoryPersona
     * @return {Name[]} an array of {@link name.types:constructor.Name Names}
     */
    $getNames: function() { return this.names || []; },

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
     * @name memories.types:constructor.MemoryPersona#$getPreferredName
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @return {string} preferred {@link name.types:constructor.Name Name}
     */
    $getPreferredName: function() { return helpers.findOrFirst(this.names, {preferred: true}); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$getGivenName
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @return {String} preferred given name
     */
    $getGivenName: function() {
      var name = this.$getPreferredName();
      if (name) {
        name = name.$getGivenName();
      }
      return name;
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$getSurname
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @return {String} preferred surname
     */
    $getSurname: function() {
      var name = this.$getPreferredName();
      if (name) {
        name = name.$getSurname();
      }
      return name;
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$addName
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @param {Name|string} value name to add
     */
    $addName: function(value) {
      if (!(value instanceof name.Name)) {
        //noinspection JSValidateTypes
        value = new name.Name(value);
      }
      this.names.push(value);
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$addMemoryArtifactRef
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @param {string|MemoryArtifactRef} mar URL of the memory artifact or the memory artifact ref to add
     */
    $addMemoryArtifactRef: function(mar) {
      if (!(mar instanceof MemoryArtifactRef)) {
        mar = new MemoryArtifactRef(mar);
      }
      this.media.push(mar);
    }
  };

  /**********************************/
  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryPersonaRef
   * @description
   *
   * A reference to a {@link memories.types:constructor.MemoryPersona MemoryPersona} and a
   * {@link memories.types:constructor.Memory Memory}
   *
   * @param {string=} url URL of the Memory Persona
   *********************************/

  var MemoryPersonaRef = exports.MemoryPersonaRef = function(url) {
    // we must remove the access token in order to pass this into addMemoryPersonaRef
    this.resource = helpers.removeAccessToken(url);
    this.resourceId = helpers.getLastUrlSegment(this.resource);
  };

  exports.MemoryPersonaRef.prototype = {
    constructor: MemoryPersonaRef,
    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryPersonaRef#resourceId
     * @propertyOf memories.types:constructor.MemoryPersonaRef
     * @return {String} Id of the Memory Persona
     */

    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryPersonaRef#resource
     * @propertyOf memories.types:constructor.MemoryPersonaRef
     * @return {String} URL of the Memory Persona
     */

    // TODO when we can read a memory persona, add a function to read it

    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryPersonaRef#$personId
     * @propertyOf memories.types:constructor.MemoryPersonaRef
     * @return {String} Id of the person to which this persona is attached
     */

    // TODO stop hacking into the resource when we have a separate link to the memory
    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersonaRef#$getMemoryId
     * @methodOf memories.types:constructor.MemoryPersonaRef
     * @function
     * @return {String} Id of the memory; pass into {@link memories.functions:getMemory getMemory} for details
     */
    $getMemoryId:  function() {
      return this.resource ? this.resource.replace(/^.*\/memories\/([^\/]*)\/personas\/.*$/, '$1') : this.resource;
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersonaRef#$getMemoryUrl
     * @methodOf memories.types:constructor.MemoryPersonaRef
     * @function
     * @return {String} URL of the memory; pass into {@link memories.functions:getMemory getMemory} for details
     */
    $getMemoryUrl:  function() {
      return this.resource ? helpers.removeAccessToken(this.resource.replace(/(^.*\/memories\/[^\/]*)\/personas\/.*$/, '$1')) : this.resource;
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersonaRef#$getMemory
     * @methodOf memories.types:constructor.MemoryPersonaRef
     * @function
     * @return {Object} promise for the {@link memories.functions:getMemory getMemory} response
     */
    $getMemory:  function() {
      return exports.getMemory(this.$getMemoryUrl());
    }
  };

  /**********************************/
  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef
   * @description
   *
   * Memory Artifact Reference
   * @param {string=} url memory artifact url
   *********************************/

  var MemoryArtifactRef = exports.MemoryArtifactRef = function(url) {
    this.description = url;
  };

  exports.MemoryArtifactRef.prototype = {
    constructor: MemoryArtifactRef,
    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryArtifactRef#id
     * @propertyOf memories.types:constructor.MemoryArtifactRef
     * @return {String} Id of the Memory Artifact
     */

    /**
     * @ngdoc property
     * @name memories.types:constructor.MemoryArtifactRef#qualifiers
     * @propertyOf memories.types:constructor.MemoryArtifactRef
     * @return {Object[]} array of objects with `value` attributes that are comma-separated lists of four numbers, possibly identifying a rectangle in the image?
     */

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryArtifactRef#$getMemoryArtifactUrl
     * @methodOf memories.types:constructor.MemoryArtifactRef
     * @function
     * @return {String} URL of the memory artifact with access token
     */
    $getMemoryArtifactUrl: function() { return helpers.appendAccessToken(this.description); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryArtifactRef#$setMemoryArtifactUrl
     * @methodOf memories.types:constructor.MemoryArtifactRef
     * @function
     * @param {string} url URL of the memory artifact
     */
    $setMemoryArtifactUrl: function(url) { this.description = url; }
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
   * @param {string} pid id of the person or full URL of the person-memories-query endpoint
   * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0, `type` type of artifacts to return - possible values are photo and story - defaults to both
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMemoriesQuery = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-memories-query', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getMemories: function() { return this.sourceDescriptions || []; }}),
            helpers.constructorSetter(Memory, 'sourceDescriptions'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.sourceDescriptions;
            })
          ));
      });
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
   * @param {string} uid id or full URL of the user - note this is a _user_, not an _agent_
   * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getUserMemoriesQuery = function(uid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('user-memories-query', uid, {cisUserId: uid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getMemories: function() { return this.sourceDescriptions || []; }}),
            helpers.constructorSetter(Memory, 'sourceDescriptions'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.sourceDescriptions;
            })
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
   * {@link http://jsfiddle.net/DallanQ/9J4zn/ editable example}
   *
   * @param {String} mid id or full URL of the memory
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemory = function(mid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('memory-template', mid, {mid: mid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getMemory: function() { return maybe(this.sourceDescriptions)[0]; }}),
            helpers.constructorSetter(Memory, 'sourceDescriptions'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.sourceDescriptions;
            })
          ));
      });
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
   * @param {String} mid of the memory or full URL of the memory-comments endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryComments = function(mid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('memory-comments-template', mid, {mid: mid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getComments: function() {
              return maybe(maybe(this.discussions)[0]).comments || [];
            }}),
            helpers.constructorSetter(discussions.Comment, 'comments', function(response) {
              return maybe(maybe(response).discussions)[0];
            }),
            helpers.objectExtender(function(response, comment) {
              var href = maybe(maybe(maybe(comment).links).comment).href;
              return { $memoryId: href ? helpers.removeAccessToken(href.replace(/^.*\/memories\/([^\/]*)\/comments\/.*$/, '$1')) : href };
            }, function(response) {
              return maybe(maybe(maybe(response).discussions)[0])['comments'];
            })
          ));
      });
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
   * {@link http://jsfiddle.net/DallanQ/zD5V7/ editable example}
   *
   * @param {string} mid of the memory or full URL of the memory-personas endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryPersonas = function(mid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('memory-personas-template', mid, {mid: mid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getMemoryPersonas: function() {
              return this && this.persons ? this.persons : [];
            }}),
            helpers.constructorSetter(MemoryPersona, 'persons'),
            helpers.constructorSetter(name.Name, 'names', function(response) {
              return maybe(response).persons;
            }),
            helpers.constructorSetter(MemoryArtifactRef, 'media', function(response) {
              return maybe(response).persons;
            }),
            helpers.objectExtender(function(response, persona) {
              var href = maybe(maybe(maybe(persona).links).persona).href;
              return { $memoryId: href ? helpers.removeAccessToken(href.replace(/^.*\/memories\/([^\/]*)\/personas\/.*$/, '$1')) : href };
            }, function(response) {
              return maybe(response).persons;
            })
          ));
      });
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
   * {@link http://jsfiddle.net/DallanQ/vt79D/ editable example}
   *
   * @param {String} pid id of the person or full URL of the person-memory-references endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryPersonaRefs = function(pid, params, opts) {
    // TODO check if memory-references endpoint template has been added to the discovery resource
    var url = helpers.isAbsoluteUrl(pid) ? pid : '/platform/tree/persons/'+encodeURI(pid)+'/memory-references';
    return plumbing.get(url, params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemoryPersonaRefs: function() {
          return maybe(maybe(this.persons)[0]).evidence || [];
        }}),
        helpers.constructorSetter(MemoryPersonaRef, 'evidence', function(response) {
          return maybe(maybe(response).persons)[0];
        }),
        helpers.objectExtender(function(response) {
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
   * {@link http://jsfiddle.net/DallanQ/f8DU3/ editable example}
   *
   * @param {String} pid of the person
   * @param {Object=} params `default` URL to redirect to if portrait doesn't exist;
   * `followRedirect` if true, follow the redirect and return the final URL
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the URL
   */
  exports.getPersonPortraitUrl = function(pid, params, opts) {
    return plumbing.getUrl('person-portrait-template', pid, {pid: pid}).then(function(url) {
      if (params && params.followRedirect) {
        params = helpers.extend({}, params);
        delete params.followRedirect;
        var promise = plumbing.get(url, params, {}, opts);
        return helpers.handleRedirect(promise, function(promise) {
          return helpers.appendAccessToken(promise.getResponseHeader('Content-Location'));
        });
      }
      else {
        return helpers.appendAccessToken(url);
      }
    });
  };

  // TODO wrap call to read all portrait urls

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
   * @param {String|FormData} data string or a FormData object - if FormData, the field name of the file _must_ be `artifact`
   * @param {Object=} params `description`, `title`, `filename`, and `type` (default artifact type: Image, Document, Story, etc.)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the memory URL
   */
  exports.createMemory = function(data, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('memories'),
      function(url) {
        return plumbing.post(helpers.appendQueryParameters(url, params),
          data, { 'Content-Type': helpers.isString(data) ? 'text/plain' : 'multipart/form-data' }, opts,
          helpers.getResponseLocation);
      });
  };

  /**
   * @ngdoc function
   * @name memories.functions:addMemoryPersona
   * @function
   *
   * @description
   * Create a memory (story or photo)
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/dLfA8/ editable example}
   *
   * @param {string|Memory} mid id or full URL of a memory
   * @param {MemoryPersona} memoryPersona people are attached to {@link memories.types:constructor.MemoryPersona MemoryPersonas}
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRef}
   */
  exports.addMemoryPersona = function(mid, memoryPersona, params, opts) {
    var data = {
      persons: [ memoryPersona ]
    };
    return helpers.chainHttpPromises(
      plumbing.getUrl('memory-personas-template', mid, {mid: mid}),
      function(url) {
        return plumbing.post(url, data, {}, opts, function(data, promise) {
          var location = promise.getResponseHeader('Location');
          return location ? new MemoryPersonaRef(location) : location;
        });
      });
  };

  /**
   * @ngdoc function
   * @name memories.functions:addMemoryPersonaRef
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
   * @param {MemoryPersonaRef} memoryPersonaRef {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRef}
   * @param {Object=} params `changeMessage` change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the persona URL
   */
  exports.addMemoryPersonaRef = function(pid, memoryPersonaRef, params, opts) {
    var attrib = new attribution.Attribution();
    if (params && params.changeMessage) {
      attrib.changeMessage = params.changeMessage;
    }
    var data = {
      persons: [{
        evidence: [ memoryPersonaRef ],
        attribution: attrib
      }]
    };
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-memory-persona-references-template', pid, {pid: pid}),
      function(url) {
        return plumbing.post(url, data, {}, opts,
          helpers.getResponseLocation);
      });
  };

  // TODO write a short deleteMemoryComment function

  return exports;
});
