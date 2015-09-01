var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name sourceBox.types:constructor.Collection
 * @description
 *
 * Collection
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_resource FamilySearch API Docs}
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var Collection = FS.Collection = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name sourceBox.functions:createCollection
 * @param {Object} data [Collection](https://familysearch.org/developers/docs/api/gx/Collection_json) data
 * @return {Object} {@link sourceBox.types:constructor.Collection Collection}
 * @description Create a {@link sourceBox.types:constructor.Collection Collection} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createCollection = function(data){
  return new Collection(this, data);
};

Collection.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Collection,
  
  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#getId
   * @methodOf sourceBox.types:constructor.Collection
   * @return {String} Id of the collection
   */

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#getTitle
   * @methodOf sourceBox.types:constructor.Collection
   * @return {String} title of the collection
   */
  getTitle: function(){ return this.data.title; },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#getSize
   * @methodOf sourceBox.types:constructor.Collection
   * @return {Number} number of source descriptions in the collection
   */
  getSize: function(){ return this.data.size; },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#getAttribution
   * @methodOf sourceBox.types:constructor.Collection
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#getCollectionUrl
   * @methodOf sourceBox.types:constructor.Collection

   * @return {String} Url of the person
   */
  getCollectionUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('self')).href); },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#getSourceDescriptions
   * @methodOf sourceBox.types:constructor.Collection

   * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
   * @return {Object} promise for the {@link sourceBox.functions:getCollectionSourceDescriptions getCollectionSourceDescriptions} response
   */
  getSourceDescriptions: function(params) {
    return this.client.getCollectionSourceDescriptions(this.helpers.removeAccessToken(maybe(this.getLink('source-descriptions')).href), params);
  },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#save
   * @methodOf sourceBox.types:constructor.Collection

   * @description
   * Create a new user-defined collection (folder)
   *
   *
   * @return {Object} promise for the response
   */
  save: function() {
    var self = this,
        urlPromise = self.getCollectionUrl() ? Promise.resolve(self.getCollectionUrl()) : self.plumbing.getCollectionUrl('FSUDS', 'subcollections');
    return urlPromise.then(function(url) {
      return self.plumbing.post(url, { collections: [ self ] });
    }).then(function(response){
      self.updateFromResponse(response, 'self');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#delete
   * @methodOf sourceBox.types:constructor.Collection

   * @description delete this collection (must be empty)
   * - see {@link sources.functions:deleteCollection deleteCollection}
   *
   * @return {Object} promise for the response
   */
  delete: function() {
    return this.client.deleteCollection(this.getCollectionUrl());
  }

});