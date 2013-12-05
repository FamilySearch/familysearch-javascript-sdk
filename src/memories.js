define([
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
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
   * @name memories.functions:getPersonMemoryReferences
   * @function
   *
   * @description
   * Get references to memories for a person
   * The response includes the following convenience function
   *
   * - `getMemories()` - get the array of memory references from the response; each reference has the following convenience functions
   *
   * ###Memory reference convenience Functions
   *
   * - `getMemoryId()` - id of the memory (use `getMemory` to find out more)
   * - `getPersonaId()` - id of the persona in the memory that is attached to this person
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Memory_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/vt79D/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonMemoryReferences = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/memory-references', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getMemories: function() {
          return maybe(maybe(this.persons)[0]).evidence || [];
        }}),
        helpers.objectExtender(memoryReferenceConvenienceFunctions, function(response) {
          return maybe(maybe(response.persons)[0]).evidence;
        })
      ));
  };

  var memoryReferenceConvenienceFunctions = {
    getMemoryId:  function() { return this.resource ? this.resource.replace(/^.*\/memories\/(\d+)\/.*$/, '$1') : this.resource; },
    getPersonaId: function() { return this.resourceId; }
  };

  /**
   * @ngdoc function
   * @name memories.functions:getMemory
   * @function
   *
   * @description
   * Get information about a source
   * The response includes the following convenience functions
   *
   * - `getId()` - id of the memory
   * - `getMediaType()` - media type
   * - `getObjectURL()` - URL of the media object
   * - `getIconURL()` - URL of an icon for the media object
   * - `getThumbnailURL()` - URL of a thumbnail for the media object
   * - `getTitles()` - an array of title strings
   * - `getTitle()` - first title in the array
   * - `getDescriptions()` - an array of description strings
   * - `getDescription()` - first description in the array
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
      helpers.objectExtender(memoryConvenienceFunctions));
  };

  var memoryConvenienceFunctions = {
    getId:           function() { return maybe(maybe(this.sourceDescriptions)[0]).id; },
    getMediaType:    function() { return maybe(maybe(this.sourceDescriptions)[0]).mediaType; },
    getObjectURL:    function() { return maybe(maybe(this.sourceDescriptions)[0]).about; },
    getIconURL:      function() { return maybe(maybe(maybe(maybe(this.sourceDescriptions)[0]).links)['image-icon']).href; },
    getThumbnailURL: function() { return maybe(maybe(maybe(maybe(this.sourceDescriptions)[0]).links)['image-thumbnail']).href; },
    getTitle:        function() { return maybe(maybe(maybe(maybe(this.sourceDescriptions)[0]).titles)[0]).value; },
    getTitles:       function() { return helpers.map(maybe(maybe(this.sourceDescriptions)[0]).titles, function(title) {
      return title.value;
    }); },
    getDescription:  function() { return maybe(maybe(maybe(maybe(this.sourceDescriptions)[0]).description)[0]).value; },
    getDescriptions: function() { return helpers.map(maybe(maybe(this.sourceDescriptions)[0]).description, function(description) {
      return description.value;
    }); }
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
   * - `getComments()` - get the array of comments from the response; each comment has an `id` and `text`
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Comments_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/nLW5hn/ editable example}
   *
   * @param {String} id of the memory to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getMemoryComments = function(id, params, opts) {
    return plumbing.get('/platform/memories/memories/'+encodeURI(id)+'/comments', params, {}, opts,
      helpers.objectExtender({getComments: function() { return maybe(maybe(this.discussions)[0]).comments || []; }}));
  };

  return exports;
});
