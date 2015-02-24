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
 * @param {Object=} data data
 */
var Collection = FS.Collection = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data && data.attribution){
    this.attribution = client.createAttribution(data.attribution);    
  }
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

Collection.prototype = {
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
   * @return {String} title of the collection
   */

  /**
   * @ngdoc property
   * @name sourceBox.types:constructor.Collection#size
   * @propertyOf sourceBox.types:constructor.Collection
   * @return {Number} number of source descriptions in the collection
   */

  /**
   * @ngdoc property
   * @name sourceBox.types:constructor.Collection#attribution
   * @propertyOf sourceBox.types:constructor.Collection
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#$getCollectionUrl
   * @methodOf sourceBox.types:constructor.Collection
   * @function
   * @return {String} Url of the person
   */
  $getCollectionUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).self).href); },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#$getSourceDescriptions
   * @methodOf sourceBox.types:constructor.Collection
   * @function
   * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
   * @return {Object} promise for the {@link sourceBox.functions:getCollectionSourceDescriptions getCollectionSourceDescriptions} response
   */
  $getSourceDescriptions: function(params) {
    return this.$client.getCollectionSourceDescriptions(this.$helpers.removeAccessToken(this.links['source-descriptions'].href), params);
  },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#$save
   * @methodOf sourceBox.types:constructor.Collection
   * @function
   * @description
   * Create a new user-defined collection (folder)
   *
   * {@link http://jsfiddle.net/ppm671s2/ editable example}
   *
   * @param {boolean=} refresh true to read the collection after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the collection id, which is fulfilled after the collection has been updated,
   * and if refresh is true, after the collection has been read.
   */
  $save: function(refresh, opts) {
    var self = this;
    var promise = self.$helpers.chainHttpPromises(
      self.id ? self.$plumbing.getUrl('user-collection-template', null, {udcid: self.id}) : self.$plumbing.getUrl('user-collections'),
      function(url) {
        return self.$plumbing.post(url, { collections: [ self ] }, {}, opts, function(data, promise) {
          // x-entity-id and location headers are not set on update, only on create
          return self.id || promise.getResponseHeader('X-ENTITY-ID');
        });
      });
    var returnedPromise = promise.then(function(udcid) {
      self.$helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
      if (refresh) {
        // re-read the collection and set this object's properties from response
        return self.$client.getCollection(udcid, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getCollection());
          return udcid;
        });
      }
      else {
        return udcid;
      }
    });
    return returnedPromise;
  },

  /**
   * @ngdoc function
   * @name sourceBox.types:constructor.Collection#$delete
   * @methodOf sourceBox.types:constructor.Collection
   * @function
   * @description delete this collection (must be empty)
   * - see {@link sources.functions:deleteCollection deleteCollection}
   *
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the collection id
   */
  $delete: function(opts) {
    return this.$client.deleteCollection(this.$getCollectionUrl() || this.id, opts);
  }

};