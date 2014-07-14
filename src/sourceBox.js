define([
  'attribution',
  'helpers',
  'plumbing',
  'sources',
  'user'
], function(attribution, helpers, plumbing, sources, user) {
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
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_resource FamilySearch API Docs}
   *
   * @param {Object=} data an object with optional attributes {title}.
   */
  var Collection = exports.Collection = function(data) {
    if (data) {
      this.title = data.title;
    }
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
    $getCollectionUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).self).href); },

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
    },

    /**
     * @ngdoc function
     * @name sourceBox.types:constructor.Collection#$save
     * @methodOf sourceBox.types:constructor.Collection
     * @function
     * @description
     * Create a new user-defined collection (folder)
     *
     * {@link http://jsfiddle.net/DallanQ/2VgxM/ editable example}
     *
     * @param {boolean=} refresh true to read the collection after updating
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the collection id, which is fulfilled after the collection has been updated,
     * and if refresh is true, after the collection has been read.
     */
    $save: function(refresh, opts) {
      var self = this;
      var promise = helpers.chainHttpPromises(
        self.id ? plumbing.getUrl('user-collection-template', null, {udcid: self.id}) : plumbing.getUrl('user-collections'),
        function(url) {
          return plumbing.post(url, { collections: [ self ] }, {}, opts, function(data, promise) {
            // x-entity-id and location headers are not set on update, only on create
            return self.id || promise.getResponseHeader('X-ENTITY-ID');
          });
        });
      var returnedPromise = promise.then(function(udcid) {
        helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
        if (refresh) {
          // re-read the collection and set this object's properties from response
          return exports.getCollection(udcid, {}, opts).then(function(response) {
            helpers.deletePropertiesPartial(self, helpers.appFieldRejector);
            helpers.extend(self, response.getCollection());
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
      return exports.deleteCollection(this.$getCollectionUrl() || this.id, opts);
    }

  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:getCollectionsForUser
   * @function
   *
   * @description
   * Get the collections for the specified user
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

  /**
   * @ngdoc function
   * @name sourceBox.functions:moveSourceDescriptionsToCollection
   * @function
   *
   * @description
   * Move the specified source descriptions to the specified collection
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_Source_Descriptions_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/HhYy2/ editable example}
   *
   * @param {string} udcid id of the collection or full URL of the collection descriptions endpoint
   * @param {SourceDescription[]|string[]} srcDescs array of source descriptions - may be objects or id's
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the udcid
   */
  exports.moveSourceDescriptionsToCollection = function(udcid, srcDescs, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('user-collection-source-descriptions-template', udcid, {udcid: udcid}),
      function(url) {
        var srcDescIds = helpers.map(srcDescs, function(srcDesc) {
          return { id: (srcDesc instanceof sources.SourceDescription) ? srcDesc.id : srcDesc };
        });
        return plumbing.post(url, { sourceDescriptions: srcDescIds }, {}, opts, function() {
          return udcid;
        });
      }
    );
  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:removeSourceDescriptionsFromCollections
   * @function
   *
   * @description
   * Remove the specified source descriptions from all collections
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collections_Source_Descriptions_for_a_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/bDWxw/ editable example}
   *
   * @param {SourceDescription[]|string[]} srcDescs array of source descriptions - may be objects or id's
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the srcDescs
   */
  exports.removeSourceDescriptionsFromCollections = function(srcDescs, opts) {
    return helpers.chainHttpPromises(
      user.getCurrentUser(),
      function(response) {
        var uid = response.getUser().treeUserId;
        return plumbing.getUrl('user-collections-source-descriptions-for-user-template', null, {uid: uid});
      },
      function(url) {
        var sdids = helpers.map(srcDescs, function(srcDesc) {
          return (srcDesc instanceof sources.SourceDescription) ? srcDesc.id : srcDesc;
        });
        return plumbing.del(helpers.appendQueryParameters(url, {id: sdids}), {}, opts, function() {
          return srcDescs;
        });
      }
    );
  };

  /**
   * @ngdoc function
   * @name sourceBox.functions:deleteCollection
   * @function
   *
   * @description
   * Delete the specified collection
   *
   * {@link https://familysearch.org/developers/docs/api/sources/User-Defined_Collection_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/aYpkq/ editable example}
   *
   * @param {string} udcid id or full URL of the collection
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the udcid
   */
  exports.deleteCollection = function(udcid, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('user-collection-template', udcid, {udcid: udcid}),
      function(url) {
        return plumbing.del(url, {}, opts, function() {
          return udcid;
        });
      }
    );
  };

  return exports;
});
