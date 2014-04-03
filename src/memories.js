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

  // TODO check whether it's possible now to update story contents (and how to do it)
  // TODO add functions to attach & detach photos to a story when the API exists

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

  var Memory = exports.Memory = function(data) {
    if (data) {
      if (data.title) {
        //noinspection JSUnresolvedFunction
        this.$setTitle(data.title);
      }
      if (data.description) {
        //noinspection JSUnresolvedFunction
        this.$setDescription(data.description);
      }
      if (data.filename) {
        //noinspection JSUnresolvedFunction
        this.$setArtifactFilename(data.filename);
      }
      if (data.$data) {
        this.$data = data.$data;
      }
    }
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

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$getMemoryArtifactUrl
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} URL of the memory artifact (image, story, or document) with access token
     */
    $getMemoryArtifactUrl: function() {
      // remove old access token and append a new one in case they are different
      return helpers.appendAccessToken(helpers.removeAccessToken(this.about));
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$getMemoryUrl
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {String} memory URL (without the access token)
     */
    $getMemoryUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links)['description']).href); },

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
    $getCommentsUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).comments).href); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.Memory#$getComments
     * @methodOf memories.types:constructor.Memory
     * @function
     * @return {Object} promise for the {@link memories.functions:getMemoryComments getMemoryComments} response
     */
    $getComments: function() { return exports.getMemoryComments(this.$getCommentsUrl() || this.id); },

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
     * @param {boolean=} refresh true to read the discussion after updating
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the memory id, which is fulfilled after the memory has been updated,
     * and if refresh is true, after the memory has been read.
     */
    $save: function(refresh, opts) {
      var self = this;
      var promise = helpers.chainHttpPromises(
        self.id ? plumbing.getUrl('memory-template', null, {mid: self.id}) : plumbing.getUrl('memories'),
        function(url) {
          if (self.id) {
            // update memory
            return plumbing.post(url, { sourceDescriptions: [ self ] }, {}, opts, function() {
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
            return plumbing.post(helpers.appendQueryParameters(url, params),
              self.$data, { 'Content-Type': helpers.isString(self.$data) ? 'text/plain' : 'multipart/form-data' }, opts,
              helpers.getResponseEntityId);
          }
        });
      var returnedPromise = promise.then(function(mid) {
        helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
        if (refresh) {
          // re-read the person and set this object's properties from response
          return exports.getMemory(mid, {}, opts).then(function(response) {
            helpers.deleteProperties(self);
            helpers.extend(self, response.getMemory());
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
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the memory URL
     */
    $delete: function(opts) {
      return exports.deleteMemory(this.$getMemoryUrl() || this.id, opts);
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
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Personas_resource FamilySearch API Docs}
   *
   * @param {Object=} data an object with optional attributes {$memoryId, name, memoryArtifactRef}.
   * To create a new memory persona, you must set $memoryId and name.
   * _name_ can be a {@link name.types:constructor.Name Name} object or a fullText string.
   * _NOTE_ memory persona names don't have given or surname parts, only fullText
   *********************************/

  var MemoryPersona = exports.MemoryPersona = function(data) {
    if (data) {
      this.$memoryId = data.$memoryId;
      if (data.name) {
        //noinspection JSUnresolvedFunction
        this.$setName(data.name);
      }
      if (data.memoryArtifactRef) {
        //noinspection JSUnresolvedFunction
        this.$setMemoryArtifactRef(data.memoryArtifactRef);
      }
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
     * @name memories.types:constructor.MemoryPersona#$getMemoryPersonaUrl
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @return {String} memory persona URL
     */
    $getMemoryPersonaUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).persona).href); },

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
    $getMemoryUrl: function() { return helpers.removeAccessToken(maybe(this.$getMemoryArtifactRef()).description); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersona#$getMemory
     * @methodOf memories.types:constructor.MemoryPersona
     * @function
     * @return {Object} promise for the {@link memories.functions:getMemory getMemory} response
     */
    $getMemory:  function() {
      return exports.getMemory(this.$getMemoryUrl() || this.$memoryId);
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
      if (!(value instanceof name.Name)) {
        value = new name.Name(value);
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
     * @param {boolean=} refresh true to read the memory persona after updating
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the memory persona URL, which is fulfilled after the memory persona has been updated,
     * and if refresh is true, after the memory persona has been read.
     */
    $save: function(refresh, opts) {
      var self = this;
      var promise = helpers.chainHttpPromises(
        plumbing.getUrl((self.id ? 'memory-persona-template' : 'memory-personas-template'), null, {mid: self.$memoryId, pid: self.id}),
        function(url) {
          if (!self.$getMemoryArtifactRef()) {
            // default the media artifact reference to point to the memory
            // the discovery resource is guaranteed to be set due to the getUrl statement
            var memoryUrl = helpers.getUrlFromDiscoveryResource(globals.discoveryResource, 'memory-template', {mid: self.$memoryId});
            self.$setMemoryArtifactRef(new MemoryArtifactRef({description: memoryUrl}));
          }
          return plumbing.post(url, { persons: [ self ] }, {}, opts, function(data, promise) {
            return self.$getMemoryPersonaUrl() || helpers.removeAccessToken(promise.getResponseHeader('Location'));
          });
        });
      var returnedPromise = promise.then(function(url) {
        helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
        if (refresh) {
          // re-read the person and set this object's properties from response
          return exports.getMemoryPersona(url, null, {}, opts).then(function(response) {
            helpers.deleteProperties(self);
            helpers.extend(self, response.getMemoryPersona());
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
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the memory persona URL
     */
    $delete: function(opts) {
      return exports.deleteMemoryPersona(this.$getMemoryPersonaUrl() || this.$memoryId, this.id, opts);
    }

  };

  // TODO check whether person memory references can be updated

  /**********************************/
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
   *********************************/

  var MemoryPersonaRef = exports.MemoryPersonaRef = function(data) {
    if (data) {
      this.$personId = data.$personId;
      if (data.memoryPersona) {
        //noinspection JSUnresolvedFunction
        this.$setMemoryPersona(data.memoryPersona);
      }
    }
  };

  exports.MemoryPersonaRef.prototype = {
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
    $getMemoryPersonaRefUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links)['evidence-reference']).href); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersonaRef#$getMemoryPersonaUrl
     * @methodOf memories.types:constructor.MemoryPersonaRef
     * @function
     * @return {String} URL of the memory persona (without the access token);
     * pass into {@link memories.functions:getMemoryPersona getMemoryPersona} for details
     */
    $getMemoryPersonaUrl: function() { return helpers.removeAccessToken(this.resource); },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryPersonaRef#$getMemoryPersona
     * @methodOf memories.types:constructor.MemoryPersonaRef
     * @function
     * @return {Object} promise for the {@link memories.functions:getMemoryPersona getMemoryPersona} response
     */
    $getMemoryPersona:  function() {
      // TODO add alternative (mid, mpid) if we get mid
      return exports.getMemoryPersona(this.$getMemoryPersonaUrl());
    },

    // TODO stop hacking into the resource when links.memory.href works (last checked 4/2/14)
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
      // TODO add alternative mid if we get mid
      return exports.getMemory(this.$getMemoryUrl());
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
      if (memoryPersona instanceof MemoryPersona) {
        //noinspection JSUnresolvedFunction
        memoryPersona = memoryPersona.$getMemoryPersonaUrl();
      }
      // we must remove the access token in order to pass this into addMemoryPersonaRef
      this.resource = helpers.removeAccessToken(memoryPersona);
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
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the memory persona ref URL, which is fulfilled after the memory persona ref has been created
     * (note however that individual memory persona references cannot be read).
     */
    $save: function(opts) {
      var self = this;
      return helpers.chainHttpPromises(
        plumbing.getUrl('person-memory-persona-references-template', null, {pid: self.$personId}),
        function(url) {
          return plumbing.post(url, { persons: [{ evidence: [ self ] }] }, {}, opts, function(data, promise) {
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
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the memory persona ref URL
     */
    $delete: function(opts) {
      return exports.deleteMemoryPersonaRef(this.$getMemoryPersonaRefUrl() || this.$personId, this.id, opts);
    }

  };

  /**********************************/
  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef
   * @description
   *
   * Memory Artifact Reference
   *
   * @param {Object=} data an object with optional attributes {description, qualifierValue, qualifierName}.
   * _description_ is required; it should be the memory URL
   * _qualifierValue_ is a comma-separated string of 4 numbers: "x-start,y-start,x-end,y-end".
   * Each number ranges from 0 to 1, with 0 corresponding to top-left and 1 corresponding to bottom-right.
   * _qualifierName_ is required if _qualifierValue_ is set; it should be http://gedcomx.org/RectangleRegion
   *********************************/

  var MemoryArtifactRef = exports.MemoryArtifactRef = function(data) {
    if (data) {
      this.description = data.description;
      if (data.qualifierName) {
        //noinspection JSUnresolvedFunction
        this.$setQualifierName(data.qualifierName);
      }
      if (data.qualifierValue) {
        //noinspection JSUnresolvedFunction
        this.$setQualifierValue(data.qualifierValue);
      }
    }
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
     * @name memories.types:constructor.MemoryArtifactRef#description
     * @propertyOf memories.types:constructor.MemoryArtifactRef
     * @return {String} URL of the memory
     */

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryArtifactRef#$getQualifierName
     * @methodOf memories.types:constructor.MemoryArtifactRef
     * @function
     * @return {String} qualifier name (http://gedcomx.org/RectangleRegion)
     */
    $getQualifierName: function() { return maybe(maybe(this.qualifiers)[0]).name; },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryArtifactRef#$getQualifierValue
     * @methodOf memories.types:constructor.MemoryArtifactRef
     * @function
     * @return {String} qualifier value (e.g., 0.0,.25,.5,.75)
     */
    $getQualifierValue: function() { return maybe(maybe(this.qualifiers)[0]).value; },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryArtifactRef#$setQualifierName
     * @methodOf memories.types:constructor.MemoryArtifactRef
     * @function
     * @param {string} qualifierName qualifier name
     * @return {MemoryArtifactRef} this memory artifact ref
     */
    $setQualifierName: function(qualifierName) {
      if (!helpers.isArray(this.qualifiers) || !this.qualifiers.length) {
        this.qualifiers = [{}];
      }
      this.qualifiers[0].name = qualifierName;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name memories.types:constructor.MemoryArtifactRef#$setQualifierValue
     * @methodOf memories.types:constructor.MemoryArtifactRef
     * @function
     * @param {string} qualifierValue qualifier value
     * @return {MemoryArtifactRef} this memory artifact ref
     */
    $setQualifierValue: function(qualifierValue) {
      if (!helpers.isArray(this.qualifiers) || !this.qualifiers.length) {
        this.qualifiers = [{}];
      }
      this.qualifiers[0].value = qualifierValue;
      //noinspection JSValidateTypes
      return this;
    }

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
   * @param {Object=} params `count` maximum number to return - defaults to 25, `start` defaults to 0,
   * `type` type of artifacts to return - possible values are photo and story - defaults to both
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMemoriesQuery = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-memories-query', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            // TODO when the response contains personas, add a function to return them (last checked 4/2/14)
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
   * @param {string} uid user id or full URL of the user-memories-query endpoint - note this is a _user_ id, not an _agent_ id
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
            discussions.commentsResponseMapper,
            helpers.objectExtender(function(response) {
              return { $memoryId: maybe(maybe(maybe(response).sourceDescriptions)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).discussions)[0])['comments'];
            })
          ));
      });
  };

  var memoryPersonasMapper = helpers.compose(
    helpers.constructorSetter(MemoryPersona, 'persons'),
    helpers.constructorSetter(name.Name, 'names', function(response) {
      return maybe(response).persons;
    }),
    helpers.constructorSetter(MemoryArtifactRef, 'media', function(response) {
      return maybe(response).persons;
    }),
    helpers.objectExtender(function(response) {
      return { $memoryId: maybe(maybe(response.sourceDescriptions)[0]).id };
    }, function(response) {
      return maybe(response).persons;
    })
  );

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
            memoryPersonasMapper
          ));
      });
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
   * {@link http://jsfiddle.net/DallanQ/xXaZ2/ editable example}
   *
   * @param {String} mid memory id or full URL of the memory persona
   * @param {string=} mpid id of the memory persona (must be set if mid is a memory id and not the full URL)
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryPersona = function(mid, mpid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('memory-persona-template', mid, {mid: mid, pid: mpid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getMemoryPersona: function() { return maybe(this.persons)[0]; }}),
            memoryPersonasMapper
          ));
      });
  };

  // TODO check whether all memory personas are still included in the results

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
   * __NOTE__ currently, if a memory has multiple personas and one of them it attached to a person, _all_ of the personas
   * for the memory will appear in the results for the person.
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
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-memory-persona-references-template', pid, {pid: pid}),
      function(url) {
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
      }
    );
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
   * @name memories.functions:deleteMemory
   * @function
   *
   * @description
   * Delete the specified memory
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/Tm6X2/ editable example}
   *
   * @param {string} mid id or full URL of the memory
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the memory id/URL
   */
  exports.deleteMemory = function(mid, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('memory-template', mid, {mid: mid}),
      function(url) {
        return plumbing.del(url, {}, opts, function() {
          return mid;
        });
      }
    );
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
   * {@link http://jsfiddle.net/DallanQ/q8VML/ editable example}
   *
   * @param {string} mid memory id or full URL of the memory persona
   * @param {string=} mpid id of the memory persona (must be set if mid is a memory id and not the full URL)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the mid
   */
  exports.deleteMemoryPersona = function(mid, mpid, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('memory-persona-template', mid, {mid: mid, pid: mpid}),
      function(url) {
        return plumbing.del(url, {}, opts, function() {
          return mid;
        });
      }
    );
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
   * {@link http://jsfiddle.net/DallanQ/3r3vp/ editable example}
   *
   * @param {string} pid person id or full URL of the memory persona reference
   * @param {string=} mprid id of the memory persona reference (must be set if pid is a person id and not the full URL)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the pid
   */
  exports.deleteMemoryPersonaRef = function(pid, mprid, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-memory-persona-reference-template', pid, {pid: pid, erid: mprid}),
      function(url) {
        return plumbing.del(url, {}, opts, function() {
          return pid;
        });
      }
    );
  };

  return exports;
});
