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

// TODO consider moving to another documentation generator so we can link to _methods_ like save and delete

/**
 * @ngdoc function
 * @name person.functions:getPerson
 *
 * @description
 * Get the specified person
 * The response includes the following convenience functions:
 *
 * - `getPerson()` - get the {@link person.types:constructor.Person Person} from the response
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
 * - `getPerson(id)` - {@link person.types:constructor.Person Person} object for the person with `id`
 * - `getFathers()` - array of father {@link person.types:constructor.Person Persons}
 * - `getMothers()` - array of mother {@link person.types:constructor.Person Persons}
 * - `getSpouses()` - array of spouse {@link person.types:constructor.Person Persons}
 * - `getChildren()` - array of all child {@link person.types:constructor.Person Persons};
 * - `getChildrenOf(spouseId)` - array of child {@link person.types:constructor.Person Persons};
 * if `spouseId` is null/undefined, return children without the other parent
 * - `wasRedirected()` - returns true when the primary id is different from the requested id
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 * @param {String} pid id or full URL of the person
 * @param {Object} query URL query parameters. See the API docs for supported parameters.
 * @return {Object} promise for the response
 */
FS.prototype.getPerson = function(pid, query) {
  var self = this,
      urlPromise = self.helpers.isAbsoluteUrl(pid) ? Promise.resolve(pid) : self.plumbing.getCollectionUrl('FSFT', 'person', {pid: pid});
  return urlPromise.then(function(url) {
    return self.plumbing.get(url, query);
  }).then(function(response){
    response = self._personsAndRelationshipsMapper(response);
    response.getData().persons[0].isReadOnly = function() {
      var allowHeader = response.getHeader('Allow');
      return !!allowHeader && allowHeader.indexOf('POST') < 0;
    };
    return utils.extend(response, {
      getRequestedId: function() { return pid; },
      getPrimaryId: function() {
        var sourceDescriptionId = this.getData().description.substring(1),
            sourceDescription = utils.find(this.getData().sourceDescriptions, function(sourceDescription){
              return sourceDescription.id === sourceDescriptionId;
            });
        if(sourceDescription){
          return sourceDescription.about.substring(1);
        }
      },
      getPerson: function(id) { 
        if(id){
          return utils.find(this.getData().persons, function(person){
            return person.getId() === id;
          });
        } else {
          return this.getPrimaryPerson();
        }
      },
      getPrimaryPerson: function() { return this.getPerson(this.getPrimaryId()); },
      getParentRelationships: function() {
        var primaryId = this.getPrimaryId();
        return utils.filter(this.getData().childAndParentsRelationships, function(r) {
          return r.getChildId() === primaryId;
        });
      },
      getSpouseRelationships: function() {
        return utils.filter(this.getData().relationships, function(r) {
          return r.data.type === 'http://gedcomx.org/Couple';
        });
      },
      getSpouseRelationship: function(spouseId) {
        var primaryId = this.getPrimaryId();
        return utils.find(this.getData().relationships, function(r) {
          return r.data.type === 'http://gedcomx.org/Couple' &&
            (primaryId === r.getHusbandId() ? r.getWifeId() : r.getHusbandId()) === spouseId;
        });
      },
      getChildRelationships: function() {
        var primaryId = this.getPrimaryId();
        return utils.filter(this.getData().childAndParentsRelationships, function(r) {
          return r.getFatherId() === primaryId || r.getMotherId() === primaryId;
        });
      },
      getChildRelationshipsOf: function(spouseId) {
        var primaryId = this.getPrimaryId();
        return utils.filter(this.getData().childAndParentsRelationships, function(r) {
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
    });
  });
};

/**
 * @ngdoc function
 * @name person.functions:getMultiPerson

 *
 * @description
 * Get multiple people at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 *
 * @param {Array} pids array of ids or urls for the people to read
 * @return {Object} promise that is fulfilled when all of the people have been read,
 * returning a map of person id to {@link person.functions:getPerson getPerson} response
 */
FS.prototype.getMultiPerson = function(pids) {
  var promises = [],
      responses = {},
      self = this;
  utils.forEach(pids, function(pid) {
    promises.push(self.getPerson(pid).then(function(response){
      responses[pid] = response;
    }));
  });
  return Promise.all(promises).then(function(){
    return responses;
  });
};

/**
 * Expose globally so that other files can access it
 */
FS.prototype._personsAndRelationshipsMapper = function(response){
  var self = this;
  
  utils.forEach(response.getData().persons, function(person, index, obj){
    obj[index] = self.createPerson(person);
  });
  utils.forEach(response.getData().relationships, function(rel, index, obj){
    // This will create couple objects for ParentChild relationships
    // but those are ignored/filtered out in the convenience functions.
    // TODO: try removing the ParentChild relationships
    obj[index] = self.createCouple(rel);
  });
  utils.forEach(response.getData().childAndParentsRelationships, function(rel, index, obj){
    obj[index] = self.createChildAndParents(rel);
  });
  
  return utils.extend(response, {
    getCoupleRelationships: function() { 
      return utils.filter(maybe(this.getData()).relationships, function(rel){
        return rel.data.type === 'http://gedcomx.org/Couple';
      }) || []; 
    },
    getChildAndParentsRelationships: function() { 
      return maybe(this.getData()).childAndParentsRelationships || []; 
    },
    getPerson: function(id) { 
      return utils.find(this.getData().persons, function(person){
        return person.getId() === id;
      });
    }
  });
};

/**
 * @ngdoc function
 * @name person.functions:getPersonWithRelationships
 * @deprecated
 * @description
 * 
 * __This method is deprecated as of December 6, 2016. Use {@link person.functions:getPerson getPerson()} instead.__
 * 
 * Get a person and their children, spouses, and parents.
 * The response has the following convenience functions:
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
 *
 * @param {String} pid id of the person
 * @param {Object=} params set `persons` to true to retrieve full person objects for each relative
 * @return {Object} promise for the person with relationships
 */
FS.prototype.getPersonWithRelationships = function(pid, params) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSFT', 'person-with-relationships').then(function(url) {
    return self.plumbing.get(url, utils.extend({'person': pid}, params), {
      'X-FS-Feature-Tag': 'consolidate-redundant-resources',
      'X-Expect-Override': '200-ok'
    });
  })
  .then(function(response){
    return self.plumbing.get(response.getHeader('Location'), null, {
      'X-FS-Feature-Tag': 'include-non-subject-persons-and-relationships'
    });
  })
  .then(function(response){
    response = self._personsAndRelationshipsMapper(response);
    response.getData().persons[0].isReadOnly = function() {
      var allowHeader = response.getHeader('Allow');
      return !!allowHeader && allowHeader.indexOf('POST') < 0;
    };
    return utils.extend(response, {
      getRequestedId: function() { return pid; },
      getPrimaryId: function() {
        var sourceDescriptionId = this.getData().description.substring(1),
            sourceDescription = utils.find(this.getData().sourceDescriptions, function(sourceDescription){
              return sourceDescription.id === sourceDescriptionId;
            });
        if(sourceDescription){
          return sourceDescription.about.substring(1);
        }
      },
      getPerson: function(id) { 
        return utils.find(this.getData().persons, function(person){
          return person.getId() === id;
        });
      },
      getPrimaryPerson: function() { return this.getPerson(this.getPrimaryId()); },
      getParentRelationships: function() {
        var primaryId = this.getPrimaryId();
        return utils.filter(this.getData().childAndParentsRelationships, function(r) {
          return r.getChildId() === primaryId;
        });
      },
      getSpouseRelationships: function() {
        return utils.filter(this.getData().relationships, function(r) {
          return r.data.type === 'http://gedcomx.org/Couple';
        });
      },
      getSpouseRelationship: function(spouseId) {
        var primaryId = this.getPrimaryId();
        return utils.find(this.getData().relationships, function(r) {
          return r.data.type === 'http://gedcomx.org/Couple' &&
            (primaryId === r.getHusbandId() ? r.getWifeId() : r.getHusbandId()) === spouseId;
        });
      },
      getChildRelationships: function() {
        var primaryId = this.getPrimaryId();
        return utils.filter(this.getData().childAndParentsRelationships, function(r) {
          return r.getFatherId() === primaryId || r.getMotherId() === primaryId;
        });
      },
      getChildRelationshipsOf: function(spouseId) {
        var primaryId = this.getPrimaryId();
        return utils.filter(this.getData().childAndParentsRelationships, function(r) {
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
    });
  });
};

/**
 * @ngdoc function
 * @name person.functions:deletePerson

 *
 * @description
 * Delete the specified person.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id or full URL of the person
 * @param {string} changeMessage reason for the deletion
 * @return {Object} promise for the response
 */
FS.prototype.deletePerson = function(pid, changeMessage) {
  var self = this,
      urlPromise = self.helpers.isAbsoluteUrl(pid) ? Promise.resolve(pid) : self.plumbing.getCollectionUrl('FSFT', 'person', {pid: pid});
  return urlPromise.then(function(url) {
    return self.plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {});
  });
};

/**
 * @ngdoc function
 * @name person.functions:getPreferredSpouse

 *
 * @description
 * Get the preferred Couple relationship id if any for this person and this user.
 * The response has the following convenience function:
 * 
 * - `getPreferredSpouse()` - returns the url of the preferred couple relationship,
 * null if it is the unknown spouse, or undefined if there is no preference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Spouse_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @return {Object} promise for the response
 */
FS.prototype.getPreferredSpouse = function(pid) {
  var self = this;
  return self.getCurrentUser().then(function(response) {
    var uid = response.getUser().getTreeUserId();
    return self.plumbing.getCollectionUrl('FSFT', 'preferred-spouse-relationship', {uid: uid, pid: pid});
  }).then(function(url) {
    return self.plumbing.get(url + '.json', null, { 'X-Expect-Override': '200-ok' });
  }).then(function(response){
    response.getPreferredSpouse = function(){
      if (response.getStatusCode() === 200) {
        var contentLocation = response.getHeader('Location');
        if (contentLocation.indexOf('child-and-parents-relationships') >= 0) {
          return null;
        }
        else {
          return contentLocation;
        }
      }
    };
    return response;
  });
};

/**
 * @ngdoc function
 * @name person.functions:setPreferredSpouse

 *
 * @description
 * Set the preferred spouse for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Spouse_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @param {string} curl url of the preferred couple relationship. You may also pass in a child and parents relationship url
 * if you want to set the preferred spouse as a missing/unknown spouse.
 * @return {Object} promise for the response
 */
FS.prototype.setPreferredSpouse = function(pid, curl) {
  var location = curl,
      self = this;
  return self.getCurrentUser().then(function(response) {
    var uid = response.getUser().getTreeUserId();
    return self.plumbing.getCollectionUrl('FSFT', 'preferred-spouse-relationship', {uid: uid, pid: pid});
  }).then(function(url) {
    return self.plumbing.put(url, null, {'Location': location});
  });
};

/**
 * @ngdoc function
 * @name person.functions:deletePreferredSpouse

 *
 * @description
 * Delete the preferred spouse preference for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Spouse_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @return {Object} promise for the response
 */
FS.prototype.deletePreferredSpouse = function(pid) {
  var self = this;
  return self.getCurrentUser().then(function(response) {
    var uid = response.getUser().getTreeUserId();
    return self.plumbing.getCollectionUrl('FSFT', 'preferred-spouse-relationship', {uid: uid, pid: pid});
  }).then(function(url) {
    return self.plumbing.del(url);
  });
};

/**
 * @ngdoc function
 * @name person.functions:getPreferredParents

 *
 * @description
 * Get the preferred ChildAndParents relationship id if any for this person and this user.
 * The response has the following convenience function:
 * 
 * - `getPreferredParents()` - returns the url of the preferred ChildAndParents relationship
 * or undefined if there is no preference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Parent_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @param {Object=} params currently unused
 * @return {Object} promise for the response
 */
FS.prototype.getPreferredParents = function(pid) {
  var self = this;
  return self.getCurrentUser().then(function(response) {
    var uid = response.getUser().getTreeUserId();
    return self.plumbing.getCollectionUrl('FSFT', 'preferred-parent-relationship', {uid: uid, pid: pid});
  }).then(function(url) {
    // TODO remove accept header when FS bug is fixed (last checked 4/2/14) - unable to check 14 July 14
    // couldn't check 14 July 14 because the endpoint returns a 403 now
    return self.plumbing.get(url + '.json', null, {Accept: 'application/x-fs-v1+json', 'X-Expect-Override': '200-ok'});
  }).then(function(response){
    response.getPreferredParents = function(){
      return response.getStatusCode() === 200 ? response.getHeader('Location') : void 0;
    };
    return response;
  });
};

/**
 * @ngdoc function
 * @name person.functions:setPreferredParents

 *
 * @description
 * Set the preferred parents for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Parent_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @param {string} curl url of the preferred ChildAndParents relationship
 * @return {Object} promise for the response
 */
FS.prototype.setPreferredParents = function(pid, curl) {
  var childAndParentsUrl = curl,
      self = this;
  return self.getCurrentUser().then(function(response){
    var uid = response.getUser().getTreeUserId();
    return self.plumbing.getCollectionUrl('FSFT', 'preferred-parent-relationship', {uid: uid, pid: pid});
  }).then(function(url){
    return self.plumbing.put(url, null, {'Location': childAndParentsUrl});
  });
};

/**
 * @ngdoc function
 * @name person.functions:deletePreferredParents

 *
 * @description
 * Delete the preferred parents preference for this person and this user
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Preferred_Parent_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @return {Object} promise for the response
 */
FS.prototype.deletePreferredParents = function(pid) {
  var self = this;
  return self.getCurrentUser().then(function(response) {
    var uid = response.getUser().getTreeUserId();
    return self.plumbing.getCollectionUrl('FSFT', 'preferred-parent-relationship', {uid: uid, pid: pid});
  }).then(function(url) {
    return self.plumbing.del(url);
  });
};

// TODO person merge
// TODO person not a match
