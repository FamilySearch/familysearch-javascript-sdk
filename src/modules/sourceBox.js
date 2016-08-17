var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * Get the url for a user's source descriptions collection. We first make a request
 * to the source-descriptions endpoint which responds with a forward to the current
 * user's source descriptions collection. We have to set a special header so that
 * the server responds with a 200 instead of a 30X, otherwise browsers will
 * automatically forward and we won't get the url. We don't want them to automatically
 * forward because the behavior is undefined in official specs, meaning they don't
 * all consistently repeat the proper headers, plus we lose query params if the
 * server doesn't include them in the Location header on the response.
 * 
 * @return promise for the url
 */
FS.prototype._getUserSourceDescriptionsUrl = function(){
  var self = this,
      headers = {
        'Accept': 'application/x-fs-v1+json',
        'X-Expect-Override': '200-ok'
      };
  return self.plumbing.getCollectionUrl('FSFT', 'source-descriptions').then(function(url){
    return self.plumbing.get(url, null, headers);
  }).then(function(response){
    return response.getHeader('Location');
  });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:getCollectionsForUser

 *
 * @description
 * Get the collections for the current user
 * The response includes the following convenience function:
 *
 * - `getCollections()` - get an array of {@link sourceBox.types:constructor.Collection Collections} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User_Source_Folders_resource FamilySearch API Docs}
 *
 *
 * @return {Object} promise for the response
 */
FS.prototype.getCollectionsForUser = function() {
  var self = this;
  return self.plumbing.getCollectionUrl('FSUDS', 'subcollections').then(function(url) {
    var headers = {'Accept': 'application/x-fs-v1+json', 'X-Expect-Override': '200-ok'};
    return self.plumbing.get(url, null, headers);
  }).then(function(response){
    return response.getHeader('Location');
  }).then(function(url) {
    return self.plumbing.get(url, {}, {'Accept': 'application/x-fs-v1+json'});
  }).then(function(response){
    var data = maybe(response.getData());
    utils.forEach(data.collections, function(collection, index, obj){
      obj[index] = self.createCollection(collection);
    });
    return utils.extend(response, {
      getCollections: function() { 
        return data.collections || [];
      }
    });
  });  
};

/**
 * @ngdoc function
 * @name sourceBox.functions:getCollection

 *
 * @description
 * Get information about a user-defined collection
 * The response includes the following convenience function
 *
 * - `getCollection()` - get a {@link sourceBox.types:constructor.Collection Collection} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Folder_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the collection
 * @return {Object} promise for the response
 */
FS.prototype.getCollection = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    var data = maybe(response.getData());
    utils.forEach(data.collections, function(collection, index, obj){
      obj[index] = self.createCollection(collection);
    });
    return utils.extend(response, {
      getCollection: function() { 
        return maybe(data.collections)[0];
      }
    });
  });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:getCollectionSourceDescriptions

 *
 * @description
 * Get a paged list of source descriptions in a user-defined collection
 * The response includes the following convenience function
 *
 * - `getSourceDescriptions()` - get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Folder_Source_Descriptions_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the collection-source-descriptions endpoint
 * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
 * @return {Object} promise for the response
 */
FS.prototype.getCollectionSourceDescriptions = function(url, params) {
  var self = this;
  return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    var data = maybe(response.getData());
    utils.forEach(data.sourceDescriptions, function(source, index, obj){
      obj[index] = self.createSourceDescription(source);
    });
    return utils.extend(response, {
      getSourceDescriptions: function() { 
        return data.sourceDescriptions || []; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:getCollectionSourceDescriptionsForUser

 *
 * @description
 * Get a paged list of source descriptions in all user-defined collections defined by a user
 * The response includes the following convenience function
 *
 * - `getSourceDescriptions()` - get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User_Source_Descriptions_resource FamilySearch API Docs}
 *
 *
 * @param {Object=} params `count` maximum to return (defaults to 25), `start` zero-based index of first source to return
 * @return {Object} promise for the response
 */
FS.prototype.getCollectionSourceDescriptionsForUser = function(params) {
  var self = this;
  return self._getUserSourceDescriptionsUrl().then(function(url){
    return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'});
  }).then(function(response){
    var data = maybe(response.getData());
    utils.forEach(data.sourceDescriptions, function(source, index, obj){
      obj[index] = self.createSourceDescription(source);
    });
    return utils.extend(response, {
      getSourceDescriptions: function() { 
        return data.sourceDescriptions || []; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:moveSourceDescriptionsToCollection

 *
 * @description
 * Move the specified source descriptions to the specified collection
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Folder_Source_Descriptions_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the collection descriptions endpoint
 * @param {SourceDescription[]|string[]} srcDescs array of source descriptions - may be objects or id's
 * @return {Object} promise for the response
 */
FS.prototype.moveSourceDescriptionsToCollection = function(url, srcDescs) {
  var self = this;
  var srcDescIds = utils.map(srcDescs, function(srcDesc) {
    return { id: (srcDesc instanceof FS.SourceDescription) ? srcDesc.getId() : srcDesc };
  });
  return self.plumbing.post(url, { sourceDescriptions: srcDescIds });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:removeSourceDescriptionsFromCollections

 *
 * @description
 * Remove the specified source descriptions from all collections
 *
 * {@link https://familysearch.org/developers/docs/api/sources/User_Source_Descriptions_resource FamilySearch API Docs}
 *
 *
 * @param {SourceDescription[]|string[]} srcDescs array of source descriptions - may be objects or id's
 * @return {Object} promise for the response
 */
FS.prototype.removeSourceDescriptionsFromCollections = function(srcDescs) {
  var self = this;
  return self._getUserSourceDescriptionsUrl().then(function(url) {
    var sdids = utils.map(srcDescs, function(srcDesc) {
      return (srcDesc instanceof FS.SourceDescription) ? srcDesc.getId() : srcDesc;
    });
    return self.plumbing.del(self.helpers.appendQueryParameters(url, {id: sdids}));
  });
};

/**
 * @ngdoc function
 * @name sourceBox.functions:deleteCollection

 *
 * @description
 * Delete the specified collection
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Folder_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the collection
 * @return {Object} promise for the response
 */
FS.prototype.deleteCollection = function(url) {
  return this.plumbing.del(url);
};
