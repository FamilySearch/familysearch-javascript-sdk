var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc overview
 * @name sources
 * @description
 * Functions related to sources
 *
 * {@link https://familysearch.org/developers/docs/api/resources#sources FamilySearch API Docs}
 */

/**
 * @ngdoc function
 * @name sources.functions:getSourceDescription

 *
 * @description
 * Get information about a source
 * The response includes the following convenience function
 *
 * - `getSourceDescription()` - get the {@link sources.types:constructor.SourceDescription SourceDescription} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the source description
 * @return {Object} promise for the response
 */
FS.prototype.getSourceDescription = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var sourceDescriptions = maybe(maybe(response.getData()).sourceDescriptions);
    for(var i = 0; i < sourceDescriptions.length; i++){
      sourceDescriptions[i] = self.createSourceDescription(sourceDescriptions[i]);
    }
    return utils.extend(response, {
      getSourceDescription: function() { return sourceDescriptions[0]; }
    });
  });
};

/**
 * @ngdoc function
 * @name sources.functions:getMultiSourceDescription

 *
 * @description
 * Get multiple source descriptions at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 *
 * @param {string[]} urls full URLs of the source descriptions
 * @return {Object} promise that is fulfilled when all of the source descriptions have been read,
 * returning a map of source description id or URL to {@link sources.functions:getSourceDescription getSourceDescription} response
 */
FS.prototype.getMultiSourceDescription = function(urls) {
  var self = this,
      promises = [],
      responses = {};
  utils.forEach(urls, function(u) {
    promises.push(
      self.getSourceDescription(u).then(function(response){
        responses[u] = response;
      })
    );
  });
  return Promise.all(promises).then(function(){
    return responses;
  });
};

/**
 * @ngdoc function
 * @name sources.functions:getSourceRefsQuery

 *
 * @description
 * Get the people, couples, and child-and-parents relationships referencing a source
 * The response includes the following convenience functions
 *
 * - `getPersonSourceRefs()` - get an array of person {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getCoupleSourceRefs()` - get an array of couple relationship {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getChildAndParentsSourceRefs()` - get an array of child and parent relationship {@link sources.types:constructor.SourceRef SourceRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Source_References_Query_resource FamilySearch API Docs}
 *
 *
 * @param {String} url url of the source description
 * @return {Object} promise for the response
 */
FS.prototype.getSourceRefsQuery = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    var data = maybe(response.getData());
    utils.forEach(['persons','relationships','childAndParentsRelationships'], function(type){
      data[type] = utils.map(data[type], function(group){
        group.sources = utils.map(group.sources, function(source){
          return self.createSourceRef(source);
        });
        return group;
      });
    });
    return utils.extend(response, {
      getPersonSourceRefs: function() {
        return utils.flatMap(maybe(data.persons), function(person) {
          return person.sources;
        });
      },
      getCoupleSourceRefs: function() {
        return utils.flatMap(maybe(data.relationships), function(couple) {
          return couple.sources;
        });
      },
      getChildAndParentsSourceRefs: function() {
        return utils.flatMap(maybe(data.childAndParentsRelationships), function(childAndParents) {
          return childAndParents.sources;
        });
      }
    });
  });
};

FS.prototype._getSourcesResponseMapper = function(response, root, includeDescriptions) {
  var self = this,
      data = maybe(response.getData());
  if(includeDescriptions){
    utils.forEach(data.sourceDescriptions, function(source, index, obj){
      obj[index] = self.createSourceDescription(source);
    });
  }
  utils.forEach(maybe(maybe(data[root])[0]).sources, function(source, index, obj){
    if(source.description.charAt(0) === '#'){
      var descriptionId = source.description.substr(1);
      utils.forEach(maybe(data.sourceDescriptions), function(description){
        if(description.getId() === descriptionId){
          source.description = description.getSourceDescriptionUrl();
        }
      });
    }
    obj[index] = self.createSourceRef(source);
  });
  return utils.extend(response, utils.removeEmptyProperties({
    getSourceRefs: function() {
      return maybe(maybe(data[root])[0]).sources || [];
    },
    getSourceDescriptions: includeDescriptions ? function() {
      return data.sourceDescriptions || [];
    } : null,
    getSourceDescription: includeDescriptions ? function(id) {
      return utils.find(data.sourceDescriptions, function(o){
        return o.getId() === id;
      });
    } : null
  }));
};

/**
 * @ngdoc function
 * @name sources.functions:getSourceRefs

 *
 * @description
 * Get the source references for a person
 * The response includes the following convenience function
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource Person Source References API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_References_resource Couple Source References API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource Child and Parents Source References API Docs}
 *
 *
 * @param {String} url full URL of the source-references endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getSourceRefs = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    self._getSourcesResponseMapper(response, self.helpers.getEntityType(url), false);
    return response;
  });
};

/**
 * @ngdoc function
 * @name sources.functions:getSourcesQuery

 *
 * @description
 * Get source references and descriptions for a person, couple, or child and parents.
 * The response includes the following convenience functions:
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
 * with the specified source description id from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Sources_Query_resource Person Sources Query API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Sources_Query_resource Couple Sources Query API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource Child and Parents Sources Query API Docs}
 *
 *
 * @param {String} url full URL of the sources-query endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getSourcesQuery = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    self._getSourcesResponseMapper(response, self.helpers.getEntityType(url), true);
    return response;
  });
};

/**
 * @ngdoc function
 * @name sources.functions:deleteSourceDescription

 *
 * @description
 * Delete the specified source description as well as all source references that refer to it
 *
 * __NOTE__ if you delete a source description, FamilySearch does not automatically delete references to it.
 * FamilySearch is aware of this issue but hasn't committed to a fix.
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full url of the source description
 * @param {string} changeMessage reason for the deletion
 * @return {Object} promise for the response
 */
FS.prototype.deleteSourceDescription = function(url, changeMessage) {
  return this.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {});
};

/**
 * @ngdoc function
 * @name sources.functions:deleteSourceRef

 *
 * @description
 * Delete the specified source reference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_Reference_resource Person Source Reference API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_Reference_resource Couple Source Reference API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_Reference_resource Child and Parents Source Reference API Docs}
 *
 *
 * @param {string} url url for the source reference
 * @param {string} changeMessage reason for the deletion
 * @return {Object} promise for the response
 */
FS.prototype.deleteSourceRef = function(url, changeMessage) {
  return this.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {});
};
