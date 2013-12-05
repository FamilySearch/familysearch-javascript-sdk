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
    getMemoryId:          function() { return this.resource ? this.resource.replace(/^.*\/memories\/(\d+)\/.*$/, '$1') : this.resource; },
    getPersonaId:         function() { return this.resourceId; }
  };

  return exports;
});
