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
 * @function
 *
 * @description
 * Get information about a source
 * The response includes the following convenience function
 *
 * - `getSourceDescription()` - get the {@link sources.types:constructor.SourceDescription SourceDescription} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/m4Lhab24/1/ Editable Example}
 *
 * @param {string} url full URL of the source description
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getSourceDescription = function(url, params, opts) {
  var self = this;
  return self.plumbing.get(url, params, {}, opts,
    utils.compose(
      utils.objectExtender({getSourceDescription: function() { return maybe(this.sourceDescriptions)[0]; }}),
      function(response){
        var sourceDescriptions = maybe(maybe(response).sourceDescriptions);
        for(var i = 0; i < sourceDescriptions.length; i++){
          sourceDescriptions[i] = self.createSourceDescription(sourceDescriptions[i]);
        }
        return response;
      }
    ));
};

/**
 * @ngdoc function
 * @name sources.functions:getMultiSourceDescription
 * @function
 *
 * @description
 * Get multiple source descriptions at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/jvvohktt/1/ Editable Example}
 *
 * @param {string[]} urls full URLs of the source descriptions
 * @param {Object=} params pass to getSourceDescription currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the source descriptions have been read,
 * returning a map of source description id or URL to {@link sources.functions:getSourceDescription getSourceDescription} response
 */
FS.prototype.getMultiSourceDescription = function(urls, params, opts) {
  var promises = {},
      self = this;
  utils.forEach(urls, function(u) {
    promises[u] = self.getSourceDescription(u, params, opts);
  });
  return self.helpers.promiseAll(promises);
};

/**
 * @ngdoc function
 * @name sources.functions:getSourceRefsQuery
 * @function
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
 * {@link http://jsfiddle.net/gbusgbys/1/ Editable Example}
 *
 * @param {String} url url of the source description
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getSourceRefsQuery = function(url, params, opts) {
  var self = this;
  return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
    utils.compose(
      utils.objectExtender({getPersonSourceRefs: function() {
        return utils.flatMap(maybe(this.persons), function(person) {
          return person.sources;
        });
      }}),
      utils.objectExtender({getCoupleSourceRefs: function() {
        return utils.flatMap(maybe(this.relationships), function(couple) {
          return couple.sources;
        });
      }}),
      utils.objectExtender({getChildAndParentsSourceRefs: function() {
        return utils.flatMap(maybe(this.childAndParentsRelationships), function(childAndParents) {
          return childAndParents.sources;
        });
      }}),
      function(response){
        utils.forEach(['persons','relationships','childAndParentsRelationships'], function(type){
          maybe(response)[type] = utils.map(maybe(response)[type], function(group){
            group.sources = utils.map(group.sources, function(source){
              return self.createSourceRef(source);
            });
            return group;
          });
        });
        return response;
      }
    ));
};

FS.prototype._getSourcesResponseMapper = function(root, includeDescriptions) {
  var self = this;
  return utils.compose(
    utils.objectExtender(utils.removeEmptyProperties({
      getSourceRefs: function() {
        return maybe(maybe(this[root])[0]).sources || [];
      },
      getSourceDescriptions: includeDescriptions ? function() {
        return this.sourceDescriptions || [];
      } : null,
      getSourceDescription: includeDescriptions ? function(id) {
        return utils.find(this.sourceDescriptions, {id: id});
      } : null
    })),
    function(response){
      utils.forEach(maybe(maybe(maybe(response)[root])[0]).sources, function(source, index, obj){
        if(source.description.charAt(0) === '#'){
          var descriptionId = source.description.substr(1);
          utils.forEach(maybe(response.sourceDescriptions), function(description){
            if(description.id === descriptionId){
              source.description = description.$getSourceDescriptionUrl();
            }
          });
        }
        obj[index] = self.createSourceRef(source);
      });
      return response;
    },
    includeDescriptions ? function(response){
      utils.forEach(response.sourceDescriptions, function(source, index, obj){
        obj[index] = self.createSourceDescription(source);
      });
      return response;
    } : null
  );
};

/**
 * @ngdoc function
 * @name sources.functions:getSourceRefs
 * @function
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
 * {@link http://jsfiddle.net/xdqcv2dn/1/ Editable Example}
 *
 * @param {String} url full URL of the source-references endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getSourceRefs = function(url, params, opts) {
  return this.plumbing.get(url, params, {}, opts, this._getSourcesResponseMapper(this.helpers.getEntityType(url), false));
};

/**
 * @ngdoc function
 * @name sources.functions:getSourcesQuery
 * @function
 *
 * @description
 * Get source references and descriptions for a person
 * The response includes the following convenience functions
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
 * {@link http://jsfiddle.net/bxt10adm/2/ Editable Example}
 *
 * @param {String} url full URL of the person-sources-query endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getSourcesQuery = function(url, params, opts) {
  return this.plumbing.get(url, params, {}, opts, this._getSourcesResponseMapper(this.helpers.getEntityType(url), true));
};

/**
 * @ngdoc function
 * @name sources.functions:deleteSourceDescription
 * @function
 *
 * @description
 * Delete the specified source description as well as all source references that refer to it
 *
 * __NOTE__ if you delete a source description, FamilySearch does not automatically delete references to it.
 * FamilySearch is aware of this issue but hasn't committed to a fix.
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/fb2fzgsv/1/ Editable Example}
 *
 * @param {string} url full url of the source description
 * @param {string} changeMessage reason for the deletion
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the url
 */
FS.prototype.deleteSourceDescription = function(url, changeMessage, opts) {
  return this.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
    return url;
  });
};

/**
 * @ngdoc function
 * @name sources.functions:deleteSourceRef
 * @function
 *
 * @description
 * Delete the specified source reference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_Reference_resource Person Source Reference API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_Reference_resource Couple Source Reference API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_Reference_resource Child and Parents Source Reference API Docs}
 *
 * {@link http://jsfiddle.net/nenz4de2/1/ Editable Example}
 *
 * @param {string} url url for the source reference
 * @param {string} changeMessage reason for the deletion
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the pid
 */
FS.prototype.deleteSourceRef = function(url, changeMessage, opts) {
  var self = this;
  return self.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
    return url;
  });
};
