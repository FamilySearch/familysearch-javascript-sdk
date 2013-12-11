define([
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name sourceBox
   * @description
   * Functions related to a user's source box
   *
   * {@link https://familysearch.org/developers/docs/api/resources#source-box FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name sourceBox.functions:getUserDefinedCollectionsForUser
   * @function
   *
   * @description
   * Search people
   * The response includes the following convenience functions
   *
   * - `getCollectionIds()` - get the array of collection id's from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_for_a_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/et88N/ editable example}
   *
   * @param {String} id of the user who owns the source box
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getUserDefinedCollectionsForUser = function(id, params, opts) {
    return plumbing.get('/platform/sources/'+encodeURI(id)+'/collections', {}, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.objectExtender({getCollectionIds: function() {
        return helpers.map(this.collections, function(collection) {
          return collection.id;
        });
      }}));
  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:getUserDefinedCollection
   * @function
   *
   * @description
   * Get information about a user-defined collection
   * The response includes the following convenience functions
   *
   * - `getId()` - collection id
   * - `getTitle()` - title string
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/h5wCt/ editable example}
   *
   * @param {String} id of the collection to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getUserDefinedCollection = function(id, params, opts) {
    return plumbing.get('/platform/sources/collections/'+encodeURI(id), params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.objectExtender(userDefinedCollectionConvenienceFunctions));
  };

  var userDefinedCollectionConvenienceFunctions = {
    getId:               function() { return maybe(maybe(this.collections)[0]).id; },
    getTitle:            function() { return maybe(maybe(this.collections)[0]).title; }
  };

  return exports;
});
