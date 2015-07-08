var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

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
 * {@link http://jsfiddle.net/a0eLkwtb/2/ Editable Example}
 *
 * @param {String} uid of the user or full URL of the collections-for-user endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCollectionsForUser = function(uid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-collections-for-user-template', uid, {uid: uid}),
    function(url) {
      return self.plumbing.get(url, {}, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getCollections: function() { return this.collections || []; }}),
          function(response){
            utils.forEach(response.collections, function(collection, index, obj){
              obj[index] = self.createCollection(collection);
            });
            return response;
          }
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
 * {@link http://jsfiddle.net/rn5hd0cd/1/ Editable Example}
 *
 * @param {String} udcid id or full URL of the collection
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCollection = function(udcid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-collection-template', udcid, {udcid: udcid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getCollection: function() { return maybe(this.collections)[0]; }}),
          function(response){
            utils.forEach(response.collections, function(collection, index, obj){
              obj[index] = self.createCollection(collection);
            });
            return response;
          }
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
 * {@link http://jsfiddle.net/a73eysbs/1/ Editable Example}
 *
 * @param {String} udcid id of the collection or full URL of the collection-source-descriptions endpoint
 * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCollectionSourceDescriptions = function(udcid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-collection-source-descriptions-template', udcid, {udcid: udcid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getSourceDescriptions: function() { return this.sourceDescriptions || []; }}),
          function(response){
            utils.forEach(response.sourceDescriptions, function(source, index, obj){
              obj[index] = self.createSourceDescription(source);
            });
            return response;
          }
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
 * {@link http://jsfiddle.net/pse56a1f/1/ Editable Example}
 *
 * @param {String} uid of the user or full URL of the collection-source-descriptions-for-user endpoint
 * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCollectionSourceDescriptionsForUser = function(uid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-collections-source-descriptions-for-user-template', uid, {uid: uid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getSourceDescriptions: function() { return this.sourceDescriptions || []; }}),
          function(response){
            utils.forEach(response.sourceDescriptions, function(source, index, obj){
              obj[index] = self.createSourceDescription(source);
            });
            return response;
          }
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
 * {@link http://jsfiddle.net/5mva0why/1/ Editable Example}
 *
 * @param {string} udcid id of the collection or full URL of the collection descriptions endpoint
 * @param {SourceDescription[]|string[]} srcDescs array of source descriptions - may be objects or id's
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the udcid
 */
FS.prototype.moveSourceDescriptionsToCollection = function(udcid, srcDescs, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-collection-source-descriptions-template', udcid, {udcid: udcid}),
    function(url) {
      var srcDescIds = utils.map(srcDescs, function(srcDesc) {
        return { id: (srcDesc instanceof FS.SourceDescription) ? srcDesc.id : srcDesc };
      });
      return self.plumbing.post(url, { sourceDescriptions: srcDescIds }, {}, opts, function() {
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
 * {@link http://jsfiddle.net/k39uo7zk/1/ Editable Example}
 *
 * @param {SourceDescription[]|string[]} srcDescs array of source descriptions - may be objects or id's
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the srcDescs
 */
FS.prototype.removeSourceDescriptionsFromCollections = function(srcDescs, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.getCurrentUser(),
    function(response) {
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('user-collections-source-descriptions-for-user-template', null, {uid: uid});
    },
    function(url) {
      var sdids = utils.map(srcDescs, function(srcDesc) {
        return (srcDesc instanceof FS.SourceDescription) ? srcDesc.id : srcDesc;
      });
      return self.plumbing.del(self.helpers.appendQueryParameters(url, {id: sdids}), {}, opts, function() {
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
 * {@link http://jsfiddle.net/yhdznLu0/1/ Editable Example}
 *
 * @param {string} udcid id or full URL of the collection
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the udcid
 */
FS.prototype.deleteCollection = function(udcid, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('user-collection-template', udcid, {udcid: udcid}),
    function(url) {
      return self.plumbing.del(url, {}, opts, function() {
        return udcid;
      });
    }
  );
};
