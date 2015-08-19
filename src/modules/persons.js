var FS = require('../FamilySearch'),
    utils = require('../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc overview
 * @name person
 * @description
 * Functions related to persons
 *
 * {@link https://familysearch.org/developers/docs/api/resources#person FamilySearch API Docs}
 */

// Functions to extract various pieces of the response
var personWithRelationshipsConvenienceFunctions = {
  getPrimaryId: function() {
    var sourceDescriptionId = this.description.substring(1),
        sourceDescription = utils.find(this.sourceDescriptions, function(sourceDescription){
          return sourceDescription.id === sourceDescriptionId;
        });
    if(sourceDescription){
      return sourceDescription.about.substring(1);
    }
  },
  getPerson: function(id) { 
    return utils.find(this.persons, function(person){
      return person.getId() === id;
    });
  },
  getPrimaryPerson: function() { return this.getPerson(this.getPrimaryId()); },
  getParentRelationships: function() {
    var primaryId = this.getPrimaryId();
    return utils.filter(this.childAndParentsRelationships, function(r) {
      return r.getChildId() === primaryId;
    });
  },
  getSpouseRelationships: function() {
    return utils.filter(this.relationships, function(r) {
      return r.data.type === 'http://gedcomx.org/Couple';
    });
  },
  getSpouseRelationship: function(spouseId) {
    var primaryId = this.getPrimaryId();
    return utils.find(this.relationships, function(r) {
      return r.data.type === 'http://gedcomx.org/Couple' &&
        (primaryId === r.getHusbandId() ? r.getWifeId() : r.getHusbandId()) === spouseId;
    });
  },
  getChildRelationships: function() {
    var primaryId = this.getPrimaryId();
    return utils.filter(this.childAndParentsRelationships, function(r) {
      return r.getFatherId() === primaryId || r.getMotherId() === primaryId;
    });
  },
  getChildRelationshipsOf: function(spouseId) {
    var primaryId = this.getPrimaryId();
    return utils.filter(this.childAndParentsRelationships, function(r) {
      /*jshint eqeqeq:false */
      return (r.getFatherId() === primaryId || r.getMotherId() === primaryId) &&
        (r.getFatherId() == spouseId || r.getMotherId() == spouseId); // allow spouseId to be null or undefined
    });
  },
  getFatherIds: function() {
    return utils.uniq(utils.map(
      utils.filter(this.getParentRelationships(), function(r) {
        return !!r.getFatherId();
      }),
      function(r) {
        return r.getFatherId();
      }, this));
  },
  getFathers: function() { return utils.map(this.getFatherIds(), this.getPerson, this); },
  getMotherIds: function() {
    return utils.uniq(utils.map(
      utils.filter(this.getParentRelationships(), function(r) {
        return !!r.getMotherId();
      }),
      function(r) {
        return r.getMotherId();
      }, this));
  },
  getMothers: function() { return utils.map(this.getMotherIds(), this.getPerson, this); },
  getSpouseIds: function() {
    return utils.uniq(utils.map(
      utils.filter(this.getSpouseRelationships(), function(r) {
        return r.getHusbandId() && r.getWifeId(); // only consider couple relationships with both spouses
      }),
      function(r) {
        return this.getPrimaryId() === r.getHusbandId() ? r.getWifeId() : r.getHusbandId();
      }, this));
  },
  getSpouses: function() { return utils.map(this.getSpouseIds(), this.getPerson, this); },
  getChildIds: function() {
    return utils.uniq(utils.map(this.getChildRelationships(),
      function(r) {
        return r.getChildId();
      }, this));
  },
  getChildren: function() { return utils.map(this.getChildIds(), this.getPerson, this); },
  getChildIdsOf: function(spouseId) {
    return utils.uniq(utils.map(this.getChildRelationshipsOf(spouseId),
      function(r) {
        return r.getChildId();
      }, this));
  },
  getChildrenOf: function(spouseId) { return utils.map(this.getChildIdsOf(spouseId), this.getPerson, this); },
  wasRedirected: function() {
    return this.getPrimaryId() !== this.getRequestedId();
  }
};

// TODO consider moving to another documentation generator so we can link to _methods_ like save and delete

/**
 * @ngdoc function
 * @name person.functions:getPerson
 * @function
 *
 * @description
 * Get the specified person
 * The response includes the following convenience function
 *
 * - `getPerson()` - get the {@link person.types:constructor.Person Person} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/m2y1qwm3/110/ Editable Example}
 *
 * @param {String} pid id or full URL of the person
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPerson = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.helpers.isAbsoluteUrl(pid) ? self.helpers.refPromise(pid) : self.plumbing.getCollectionUrl('FSFT', 'person', {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getPerson: function() { return this.persons[0]; }}),
          function(response){
            utils.forEach(response.persons, function(person, index, obj){
              obj[index] = self.createPerson(person);
            });
            return response;
          },
          function(response, promise) {
            response.persons[0].isReadOnly = function() {
              var allowHeader = promise.getResponseHeader('Allow');
              return !!allowHeader && allowHeader.indexOf('POST') < 0;
            };
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name person.functions:getMultiPerson
 * @function
 *
 * @description
 * Get multiple people at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/ukvu1dqs/1/ Editable Example}
 *
 * @param {Array} pids of the people to read
 * @param {Object=} params to pass to getPerson currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the people have been read,
 * returning a map of person id to {@link person.functions:getPerson getPerson} response
 */
FS.prototype.getMultiPerson = function(pids, params, opts) {
  var promises = {},
      self = this;
  utils.forEach(pids, function(pid) {
    promises[pid] = self.getPerson(pid, params, opts);
  });
  return self.helpers.promiseAll(promises);
};

FS.prototype._personsAndRelationshipsMapper = function(){
  var self = this;
  return utils.compose(
    utils.objectExtender({
      getCoupleRelationships: function() { 
        return utils.filter(maybe(this).relationships, function(rel){
          return rel.data.type === 'http://gedcomx.org/Couple';
        }) || []; 
      },
      getChildAndParentsRelationships: function() { 
        return maybe(this).childAndParentsRelationships || []; 
      },
      getPerson: function(id) { 
        return utils.find(this.persons, function(person){
          return person.getId() === id;
        });
      }
    }),
    function(response){
      utils.forEach(response.persons, function(person, index, obj){
        obj[index] = self.createPerson(person);
      });
      utils.forEach(response.relationships, function(rel, index, obj){
        // This will create couple objects for ParentChild relationships
        // but those are ignored/filtered out in the convenience functions.
        // TODO: try removing the ParentChild relationships
        obj[index] = self.createCouple(rel);
      });
      utils.forEach(response.childAndParentsRelationships, function(rel, index, obj){
        obj[index] = self.createChildAndParents(rel);
      });
      return response;
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:getPersonWithRelationships
 * @function
 *
 * @description
 * Get a person and their children, spouses, and parents.
 * The response has the following convenience functions
 *
 * - `getPrimaryId()` - id of the person returned
 * - `getRequestedId()` - person id that was requested; may differ from primary id
 * when the requested id was deleted due to a merge
 * - `getFatherIds()` - array of ids
 * - `getMotherIds()` - array of ids
 * - `getSpouseIds()` - array of ids
 * - `getChildIds()` - array of ids of all children
 * - `getChildIdsOf(spouseId)` - array of ids; if `spouseId` is null/undefined, return ids of children without the other parent
 * - `getParentRelationships()` - array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship objects
 * - `getSpouseRelationships()` - array of {@link spouses.types:constructor.Couple Couple} relationship objects
 * - `getSpouseRelationship(spouseId)` - {@link spouses.types:constructor.Couple Couple} relationship with the specified spouse
 * - `getChildRelationships()` - array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship objects
 * - `getChildRelationshipsOf(spouseId)` - array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship objects
 * if `spouseId` is null/undefined, return ids of child relationships without the other parent
 * - `getPrimaryPerson()` - {@link person.types:constructor.Person Person} object for the primary person
 *
 * In addition, the following functions are available if persons is set to true in params
 *
 * - `getPerson(id)` - {@link person.types:constructor.Person Person} object for the person with `id`
 * - `getFathers()` - array of father {@link person.types:constructor.Person Persons}
 * - `getMothers()` - array of mother {@link person.types:constructor.Person Persons}
 * - `getSpouses()` - array of spouse {@link person.types:constructor.Person Persons}
 * - `getChildren()` - array of all child {@link person.types:constructor.Person Persons};
 * - `getChildrenOf(spouseId)` - array of child {@link person.types:constructor.Person Persons};
 * if `spouseId` is null/undefined, return children without the other parent
 * - `wasRedirected()` - returns true when the primary id is different from the requested id
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_With_Relationships_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/6vpk7asr/51/ Editable Example}
 *
 * @param {String} pid id of the person
 * @param {Object=} params set `persons` to true to retrieve full person objects for each relative
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person with relationships
 */
FS.prototype.getPersonWithRelationships = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getCollectionUrl('FSFT', 'person-with-relationships'),
    function(url) {
      return self.plumbing.get(url, utils.extend({'person': pid}, params), {}, opts,
        utils.compose(
          utils.objectExtender({getRequestedId: function() { return pid; }}),
          self._personsAndRelationshipsMapper(),
          utils.objectExtender(personWithRelationshipsConvenienceFunctions),
          function(response, promise) {
            response.persons[0].isReadOnly = function() {
              var allowHeader = promise.getResponseHeader('Allow');
              return !!allowHeader && allowHeader.indexOf('POST') < 0;
            };
            return response;
          }
        ));
    });
};

/**
 * @ngdoc function
 * @name person.functions:deletePerson
 * @function
 *
 * @description
 * Delete the specified person
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/cv5wravg/2/ Editable Example}
 *
 * @param {string} pid id or full URL of the person
 * @param {string} changeMessage reason for the deletion
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id/URL
 */
FS.prototype.deletePerson = function(pid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.helpers.isAbsoluteUrl(pid) ? self.helpers.refPromise(pid) : self.plumbing.getCollectionUrl('FSFT', 'person', {pid: pid}),
    function(url) {
      return self.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
        return pid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:getPreferredSpouse
 * @function
 *
 * @description
 * Get the preferred Couple relationship id if any for this person and this user.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Spouse_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/fh5jxsre/1/ Editable Example}
 *
 * @param {string} pid id of the person
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the preferred couple relationship id,
 * null if the preferred spouse is the unknown spouse,
 * or undefined if no preference
 */
FS.prototype.getPreferredSpouse = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.getCurrentUser(),
    function(response) {
      var uid = response.getUser().getTreeUserId();
      return self.plumbing.getCollectionUrl('FSFT', 'preferred-spouse-relationship', {uid: uid, pid: pid});
    },
    function(url) {
      var promise = self.plumbing.get(url + '.json', params, { 'X-Expect-Override': '200-ok' }, opts);
      return promise.then(function(){
        if (promise.getStatusCode() === 200) {
          var contentLocation = promise.getResponseHeader('Location');
          if (contentLocation.indexOf('child-and-parents-relationships') >= 0) {
            return null;
          }
          else {
            return self.helpers.getLastUrlSegment(contentLocation);
          }
        }
        return void 0;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:setPreferredSpouse
 * @function
 *
 * @description
 * Set the preferred spouse for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Spouse_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/j8kws5n3/1/ Editable Example}
 *
 * @param {string} pid id of the person
 * @param {string} curl url of the preferred couple relationship. You may also pass in a child and parents relationship url
 * if you want to set the preferred spouse as a missing/unknown spouse.
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id
 */
FS.prototype.setPreferredSpouse = function(pid, curl, opts) {
  var location = curl,
      self = this;
  return self.helpers.chainHttpPromises(
    self.getCurrentUser(),
    function(response) {
      var uid = response.getUser().getTreeUserId();
      return self.plumbing.getCollectionUrl('FSFT', 'preferred-spouse-relationship', {uid: uid, pid: pid});
    },
    function(url) {
      return self.plumbing.put(url, null, {'Location': location}, opts, function() {
        return pid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:deletePreferredSpouse
 * @function
 *
 * @description
 * Delete the preferred spouse preference for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Spouse_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/2cxup42f/1/ Editable Example}
 *
 * @param {string} pid id of the person
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id
 */
FS.prototype.deletePreferredSpouse = function(pid, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.getCurrentUser(),
    function(response) {
      var uid = response.getUser().getTreeUserId();
      return self.plumbing.getCollectionUrl('FSFT', 'preferred-spouse-relationship', {uid: uid, pid: pid});
    },
    function(url) {
      return self.plumbing.del(url, {}, opts, function() {
        return pid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:getPreferredParents
 * @function
 *
 * @description
 * Get the preferred ChildAndParents relationship id if any for this person and this user.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Parent_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/rarpqLb6/ Editable Example}
 *
 * @param {string} pid id of the person
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the preferred ChildAndParents relationship id or undefined if no preference
 */
FS.prototype.getPreferredParents = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.getCurrentUser(),
    function(response) {
      var uid = response.getUser().getTreeUserId();
      return self.plumbing.getCollectionUrl('FSFT', 'preferred-parent-relationship', {uid: uid, pid: pid});
    },
    function(url) {
      // TODO remove accept header when FS bug is fixed (last checked 4/2/14) - unable to check 14 July 14
      // couldn't check 14 July 14 because the endpoint returns a 403 now
      var promise = self.plumbing.get(url + '.json', params, {Accept: 'application/x-fs-v1+json', 'X-Expect-Override': '200-ok'}, opts);
      return promise.then(function(){
        return promise.getStatusCode() === 200 ? self.helpers.getLastUrlSegment(promise.getResponseHeader('Location')) : void 0;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:setPreferredParents
 * @function
 *
 * @description
 * Set the preferred parents for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Parent_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/swfsnarb/1/ Editable Example}
 *
 * @param {string} pid id of the person
 * @param {string} curl url of the preferred ChildAndParents relationship
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id
 */
FS.prototype.setPreferredParents = function(pid, curl, opts) {
  var childAndParentsUrl = curl,
      self = this;
  return self.helpers.chainHttpPromises(
    self.getCurrentUser(),
    function(response) {
      var uid = response.getUser().getTreeUserId();
      return self.plumbing.getCollectionUrl('FSFT', 'preferred-parent-relationship', {uid: uid, pid: pid});
    },
    function(url) {
      return self.plumbing.put(url, null, {'Location': childAndParentsUrl}, opts, function() {
        return pid;
      });
    }
  );
};

/**
 * @ngdoc function
 * @name person.functions:deletePreferredParents
 * @function
 *
 * @description
 * Delete the preferred parents preference for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Parent_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/r5erwvft/1/ Editable Example}
 *
 * @param {string} pid id of the person
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id
 */
FS.prototype.deletePreferredParents = function(pid, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.getCurrentUser(),
    function(response) {
      var uid = response.getUser().getTreeUserId();
      return self.plumbing.getCollectionUrl('FSFT', 'preferred-parent-relationship', {uid: uid, pid: pid});
    },
    function(url) {
      return self.plumbing.del(url, {}, opts, function() {
        return pid;
      });
    }
  );
};

// TODO person merge
// TODO person not a match
