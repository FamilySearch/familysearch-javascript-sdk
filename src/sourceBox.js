define([
  'attribution',
  'helpers',
  'plumbing',
  'sources'
], function(attribution, helpers, plumbing, sources) {
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
   * @name sourceBox.types:constructor.Collection
   * @description
   *
   * Collection
   */
  var Collection = exports.Collection = function() {

  };

  exports.Collection.prototype = {
    constructor: Collection,
    /**
     * @ngdoc property
     * @name sourceBox.types:constructor.Collection#id
     * @propertyOf sourceBox.types:constructor.Collection
     * @return {String} Id of the collection
     */

    /**
     * @ngdoc property
     * @name sourceBox.types:constructor.Collection#title
     * @propertyOf sourceBox.types:constructor.Collection
     * @return {String} title of the collection folder
     */

    /**
     * @ngdoc property
     * @name sourceBox.types:constructor.Collection#size
     * @propertyOf sourceBox.types:constructor.Collection
     * @return {Number} number of sources in the collection
     */

    /**
     * @ngdoc property
     * @name sourceBox.types:constructor.Collection#attribution
     * @propertyOf sourceBox.types:constructor.Collection
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc function
     * @name sourceBox.types:constructor.Collection#$getSourceDescriptions
     * @methodOf sourceBox.types:constructor.Collection
     * @function
     * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
     * @return {Object} promise for the {@link sourceBox.functions:getCollectionSourceDescriptions getCollectionSourceDescriptions} response
     */
    $getSourceDescriptions: function(params) {
      return exports.getCollectionSourceDescriptions(helpers.removeAccessToken(this.links['source-descriptions'].href), params);
    }
  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:getCollectionsForUser
   * @function
   *
   * @description
   * Search people
   * The response includes the following convenience function
   *
   * - `getCollections()` - get an array of {@link sourceBox.types:constructor.Collection Collections} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_for_a_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/et88N/ editable example}
   *
   * @param {String} uid of the user or full URL of the collections-for-user endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollectionsForUser = function(uid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('user-collections-for-user-template', uid, {uid: uid}),
      function(url) {
        return plumbing.get(url, {}, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getCollections: function() { return this.collections || []; }}),
            helpers.constructorSetter(Collection, 'collections'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.collections;
            })
          ));
      });
  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:getCollection
   * @function
   *
   * @description
   * Get information about a user-defined collection
   * The response includes the following convenience function
   *
   * - `getCollection()` - get a {@link sourceBox.types:constructor.Collection Collection} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/h5wCt/ editable example}
   *
   * @param {String} udcid id or full URL of the collection
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollection = function(udcid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('user-collection-template', udcid, {udcid: udcid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getCollection: function() { return maybe(this.collections)[0]; }}),
            helpers.constructorSetter(Collection, 'collections'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.collections;
            })
          ));
      });
  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:getCollectionSourceDescriptions
   * @function
   *
   * @description
   * Get a paged list of source descriptions in a user-defined collection
   * The response includes the following convenience function
   *
   * - `getSourceDescriptions()` - get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_Source_Descriptions_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/7yDmE/ editable example}
   *
   * @param {String} udcid id of the collection or full URL of the collection-source-descriptions endpoint
   * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollectionSourceDescriptions = function(udcid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('user-collection-source-descriptions-template', udcid, {udcid: udcid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getSourceDescriptions: function() { return this.sourceDescriptions || []; }}),
            helpers.constructorSetter(sources.SourceDescription, 'sourceDescriptions'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.sourceDescriptions;
            })
          ));
      });
  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:getCollectionSourceDescriptionsForUser
   * @function
   *
   * @description
   * Get a paged list of source descriptions in all user-defined collections defined by a user
   * The response includes the following convenience function
   *
   * - `getSourceDescriptions()` - get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_Source_Descriptions_for_a_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/4TSxJ/ editable example}
   *
   * @param {String} uid of the user or full URL of the collection-source-descriptions-for-user endpoint
   * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCollectionSourceDescriptionsForUser = function(uid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('user-collections-source-descriptions-for-user-template', uid, {uid: uid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getSourceDescriptions: function() { return this.sourceDescriptions || []; }}),
            helpers.constructorSetter(sources.SourceDescription, 'sourceDescriptions'),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return response.sourceDescriptions;
            })
          ));
      });
  };

  return exports;
});
