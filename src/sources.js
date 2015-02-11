var FS = require('./FamilySearch'),
    utils = require('./utils'),
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
 * {@link http://jsfiddle.net/DallanQ/eECJx/ editable example}
 *
 * @param {String|SourceRef} sdid id or full URL or {@link sources.types:constructor.SourceRef SourceRef} of the source description
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getSourceDescription = function(sdid, params, opts) {
  if (sdid instanceof FS.SourceRef) {
    //noinspection JSUnresolvedFunction
    sdid = sdid.$getSourceDescriptionUrl() || sdid.$sourceDescriptionId;
  }
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('source-description-template', sdid, {sdid: sdid}),
    function(url) {
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
    });
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
 * {@link http://jsfiddle.net/DallanQ/chQ64/ editable example}
 *
 * @param {string[]|SourceRef[]} sdids ids or full URLs or {@link sources.types:constructor.SourceRef SourceRefs} of the source descriptions
 * @param {Object=} params pass to getSourceDescription currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the source descriptions have been read,
 * returning a map of source description id or URL to {@link sources.functions:getSourceDescription getSourceDescription} response
 */
FS.prototype.getMultiSourceDescription = function(sdids, params, opts) {
  var promises = {},
      self = this;
  utils.forEach(sdids, function(sdid) {
    var id, url;
    if (sdid instanceof FS.SourceRef) {
      id = sdid.$sourceDescriptionId || sdid.$getSourceDescriptionUrl();
      url = sdid.$getSourceDescriptionUrl() || sdid.$sourceDescriptionId;
    }
    else {
      id = sdid;
      url = sdid;
    }
    promises[id] = self.getSourceDescription(url, params, opts);
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
 * {@link http://jsfiddle.net/DallanQ/E866s/ editable example}
 *
 * @param {String} sdid id of the source description (cannot be the URL)
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getSourceRefsQuery = function(sdid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('source-references-query'),
    function(url) {
      url = self.helpers.appendQueryParameters(url, {source: sdid});
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
          },
          utils.objectExtender(function(response, sourceRef) {
            // get the person that contains this source ref
            var person = utils.find(maybe(response).persons, function(person) {
              return !!utils.find(maybe(person).sources, {id: sourceRef.id});
            });
            return {
              $personId: person.id,
              $sourceDescriptionId: sdid
            };
          }, function(response) {
            return utils.flatMap(maybe(response).persons, function(person) {
              return person.sources;
            });
          }),
          utils.objectExtender(function(response, sourceRef) {
            // get the couple that contains this source ref
            var couple = utils.find(maybe(response).relationships, function(couple) {
              return !!utils.find(maybe(couple).sources, {id: sourceRef.id});
            });
            return {
              $coupleId: couple.id,
              $sourceDescriptionId: sdid
            };
          }, function(response) {
            return utils.flatMap(maybe(response).relationships, function(couple) {
              return couple.sources;
            });
          }),
          utils.objectExtender(function(response, sourceRef) {
            // get the child-and-parents that contains this source ref
            var childAndParents = utils.find(maybe(response).childAndParentsRelationships, function(childAndParents) {
              return !!utils.find(maybe(childAndParents).sources, {id: sourceRef.id});
            });
            return {
              $childAndParentsId: childAndParents.id,
              $sourceDescriptionId: sdid
            };
          }, function(response) {
            return utils.flatMap(maybe(response).childAndParentsRelationships, function(childAndParents) {
              return childAndParents.sources;
            });
          })
        ));
    }
  );
};

FS.prototype._getSourcesResponseMapper = function(root, label, includeDescriptions) {
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
        obj[index] = self.createSourceRef(source);
      });
      return response;
    },
    utils.objectExtender(function(response, srcRef) {
      var result;
      if (self.helpers.isAbsoluteUrl(srcRef.description)) {
        // TODO check whether source description id is in source references as resourceId (last checked 14 July 14)
        result = {
          $sourceDescriptionId: self.helpers.getLastUrlSegment(srcRef.description)
        };
      }
      else { // '#id' format (or maybe just 'id', though 'id' may be deprecated now)
        var sdid = srcRef.description.charAt(0) === '#' ? srcRef.description.substr(1) : srcRef.description;
        result = {
          $sourceDescriptionId: sdid,
          description: self.helpers.getUrlFromDiscoveryResource(self.settings.discoveryResource, 'source-description-template',
            {sdid: sdid})
        };
      }
      result[label] = maybe(maybe(maybe(response)[root])[0]).id;
      return result;
    }, function(response) {
      return maybe(maybe(maybe(response)[root])[0]).sources;
    }),
    includeDescriptions ? function(response){
      utils.forEach(response.sourceDescriptions, function(source, index, obj){
        obj[index] = self.createSourceDescription(source);
      });
      return response;
    } : null
  );
}

/**
 * @ngdoc function
 * @name sources.functions:getPersonSourceRefs
 * @function
 *
 * @description
 * Get the source references for a person
 * The response includes the following convenience function
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_References_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/BkydV/ editable example}
 *
 * @param {String} pid person id or full URL of the source-references endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonSourceRefs = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-source-references-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._getSourcesResponseMapper('persons', '$personId', false));
    });
};

/**
 * @ngdoc function
 * @name sources.functions:getPersonSourcesQuery
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
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Sources_Query_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/8Dy8n/ editable example}
 *
 * @param {String} pid person id or full URL of the person-sources-query endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonSourcesQuery = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-sources-query-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._getSourcesResponseMapper('persons','$personId', true));
    });
};

/**
 * @ngdoc function
 * @name sources.functions:getCoupleSourceRefs
 * @function
 *
 * @description
 * Get the source references for a couple relationship
 * The response includes the following convenience function
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
 * with the specified source description id from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_References_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/ahu29/ editable example}
 *
 * @param {String} crid couple relationship id or full URL of the couple-relationship-source-references endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCoupleSourceRefs = function(crid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-source-references-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._getSourcesResponseMapper('relationships', '$coupleId', false));
    });
};

/**
 * @ngdoc function
 * @name sources.functions:getCoupleSourcesQuery
 * @function
 *
 * @description
 * Get the source references and descriptions for a couple relationship
 * The response includes the following convenience function
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
 * with the specified source description id from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Sources_Query_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/Hd34g/ editable example}
 *
 * @param {String} crid couple relationship id or full URL of the couple-relationship-sources-query endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCoupleSourcesQuery = function(crid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-sources-query-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._getSourcesResponseMapper('relationships', '$coupleId', true));
    });
};

/**
 * @ngdoc function
 * @name sources.functions:getChildAndParentsSourceRefs
 * @function
 *
 * @description
 * Get the source references for a child and parents relationship
 * The response includes the following convenience function
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
 * with the specified source description id from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/ZKLVT/ editable example}
 *
 * @param {String} caprid child-and-parents relationship id or full URL of the child-and-parents-relationship-sources-query endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getChildAndParentsSourceRefs = function(caprid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-source-references-template', caprid, {caprid: caprid}),
    function(url) {
      return self.plumbing.get(url, params,
        {'Accept': 'application/x-fs-v1+json'}, opts, self._getSourcesResponseMapper('childAndParentsRelationships', '$childAndParentsId', false));
    });
};

/**
 * @ngdoc function
 * @name sources.functions:getChildAndParentsSourcesQuery
 * @function
 *
 * @description
 * Get the source references and descriptions for a child and parents relationship
 * The response includes the following convenience function
 *
 * - `getSourceRefs()` - get an array of {@link sources.types:constructor.SourceRef SourceRefs} from the response
 * - `getSourceDescriptions()` get an array of {@link sources.types:constructor.SourceDescription SourceDescriptions} from the response
 * - `getSourceDescription(id)` get the {@link sources.types:constructor.SourceDescription SourceDescription}
 * with the specified source description id from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_References_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/SDVz2/ editable example}
 *
 * @param {String} caprid child-and-parents relationship id or full URL of the child-and-parents-relationship-sources-query endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getChildAndParentsSourcesQuery = function(caprid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-sources-template', caprid, {caprid: caprid}),
    function(url) {
      return self.plumbing.get(url, params,
        {'Accept': 'application/x-fs-v1+json'}, opts, self._getSourcesResponseMapper('childAndParentsRelationships', '$childAndParentsId', true));
    });
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
 * Therefore, this function reads and deletes source references before deleting the source description.
 * FamilySearch is aware of this issue but hasn't committed to a fix.
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Description_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/UNK8W/ editable example}
 *
 * @param {string} sdid id of the source description (cannot be the URL)
 * @param {string} changeMessage reason for the deletion
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the sdid
 */
FS.prototype.deleteSourceDescription = function(sdid, changeMessage, opts) {
  // read the source references
  var self = this;
  var returnedPromise = self.getSourceRefsQuery(sdid, {}, opts).then(function(response) {
    // delete source references
    var promises = utils.union(
      utils.map(response.getPersonSourceRefs(), function(srcRef) {
        return self.deletePersonSourceRef(srcRef.$getSourceRefUrl(), null, changeMessage, opts);
      }),
      utils.map(response.getCoupleSourceRefs(), function(srcRef) {
        return self.deleteCoupleSourceRef(srcRef.$getSourceRefUrl(), null, changeMessage, opts);
      }),
      utils.map(response.getChildAndParentsSourceRefs(), function(srcRef) {
        return self.deleteChildAndParentsSourceRef(srcRef.$getSourceRefUrl(), null, changeMessage, opts);
      }));
    // once the source references are deleted, delete the source description
    return self.helpers.promiseAll(promises).then(function() {
      var promise = self.helpers.chainHttpPromises(
        self.plumbing.getUrl('source-description-template', null, {sdid: sdid}),
        function(url) {
          return self.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
            return sdid;
          });
        });
      self.helpers.extendHttpPromise(returnedPromise, promise); // extend this promise into the returned promise
      return promise;
    });
  });
  return returnedPromise;
};

/**
 * @ngdoc function
 * @name sources.functions:deletePersonSourceRef
 * @function
 *
 * @description
 * Delete the specified person source reference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Source_Reference_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/eSbWF/ editable example}
 *
 * @param {string} changeMessage reason for the deletion
 * @param {string} pid person id or full url of the source reference
 * @param {string=} srid id of the source reference (must be set if pid is a person id and not the full URL)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the pid
 */
FS.prototype.deletePersonSourceRef = function(pid, srid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-source-reference-template', pid, {pid: pid, srid: srid}),
    function(url) {
      return self.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
        return pid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name sources.functions:deleteCoupleSourceRef
 * @function
 *
 * @description
 * Delete the specified couple source reference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Source_Reference_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/2tau4/ editable example}
 *
 * @param {string} changeMessage reason for the deletion
 * @param {string} crid couple relationship id or full url of the source reference
 * @param {string=} srid id of the source reference (must be set if crid is a couple relationship id and not the full URL)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the crid
 */
FS.prototype.deleteCoupleSourceRef = function(crid, srid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-source-reference-template', crid, {crid: crid, srid: srid}),
    function(url) {
      return self.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
        return crid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name sources.functions:deleteChildAndParentsSourceRef
 * @function
 *
 * @description
 * Delete the specified child-and-parents source reference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Source_Reference_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/awM4R/ editable example}
 *
 * @param {string} changeMessage reason for the deletion
 * @param {string} caprid child-and-parents relationship id or full url of the source reference
 * @param {string=} srid id of the source reference (must be set if caprid is a child-and-parents relationship id and not the full URL)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the caprid
 */
FS.prototype.deleteChildAndParentsSourceRef = function(caprid, srid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-source-reference-template', caprid, {caprid: caprid, srid: srid}),
    function(url) {
      var headers = {'Content-Type' : 'application/x-fs-v1+json'};
      if (changeMessage) {
        headers['X-Reason'] = changeMessage;
      }
      return self.plumbing.del(url, headers, opts, function() {
        return caprid;
      });
    }
  );
};
