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
  getPerson:     function(id) { return utils.find(this.persons, {id: id}); },
  getPrimaryPerson: function() { return this.getPerson(this.getPrimaryId()); },
  getParentRelationships: function() {
    var primaryId = this.getPrimaryId();
    return utils.filter(this.childAndParentsRelationships, function(r) {
      return maybe(r.child).resourceId === primaryId;
    });
  },
  getSpouseRelationships:  function() {
    return utils.filter(this.relationships, function(r) {
      return r.type === 'http://gedcomx.org/Couple';
    });
  },
  getSpouseRelationship:  function(spouseId) {
    var primaryId = this.getPrimaryId();
    return utils.find(this.relationships, function(r) {
      return r.type === 'http://gedcomx.org/Couple' &&
        (primaryId === r.$getHusbandId() ? r.$getWifeId() : r.$getHusbandId()) === spouseId;
    });
  },
  getChildRelationships: function() {
    var primaryId = this.getPrimaryId();
    return utils.filter(this.childAndParentsRelationships, function(r) {
      return maybe(r.father).resourceId === primaryId || maybe(r.mother).resourceId === primaryId;
    });
  },
  getChildRelationshipsOf: function(spouseId) {
    var primaryId = this.getPrimaryId();
    return utils.filter(this.childAndParentsRelationships, function(r) {
      /*jshint eqeqeq:false */
      return (maybe(r.father).resourceId === primaryId || maybe(r.mother).resourceId === primaryId) &&
        (maybe(r.father).resourceId == spouseId || maybe(r.mother).resourceId == spouseId); // allow spouseId to be null or undefined
    });
  },
  getFatherIds:  function() {
    return utils.uniq(utils.map(
      utils.filter(this.getParentRelationships(), function(r) {
        return !!r.$getFatherId();
      }),
      function(r) {
        return r.$getFatherId();
      }, this));
  },
  getFathers:    function() { return utils.map(this.getFatherIds(), this.getPerson, this); },
  getMotherIds:  function() {
    return utils.uniq(utils.map(
      utils.filter(this.getParentRelationships(), function(r) {
        return !!r.$getMotherId();
      }),
      function(r) {
        return r.$getMotherId();
      }, this));
  },
  getMothers:    function() { return utils.map(this.getMotherIds(), this.getPerson, this); },
  getSpouseIds:  function() {
    return utils.uniq(utils.map(
      utils.filter(this.getSpouseRelationships(), function(r) {
        return r.$getHusbandId() && r.$getWifeId(); // only consider couple relationships with both spouses
      }),
      function(r) {
        return this.getPrimaryId() === r.$getHusbandId() ? r.$getWifeId() : r.$getHusbandId();
      }, this));
  },
  getSpouses:    function() { return utils.map(this.getSpouseIds(), this.getPerson, this); },
  getChildIds:   function() {
    return utils.uniq(utils.map(this.getChildRelationships(),
      function(r) {
        return r.$getChildId();
      }, this));
  },
  getChildren:   function() { return utils.map(this.getChildIds(), this.getPerson, this); },
  getChildIdsOf:   function(spouseId) {
    return utils.uniq(utils.map(this.getChildRelationshipsOf(spouseId),
      function(r) {
        return r.$getChildId();
      }, this));
  },
  getChildrenOf:   function(spouseId) { return utils.map(this.getChildIdsOf(spouseId), this.getPerson, this); }
};

// TODO consider moving to another documentation generator so we can link to _methods_ like $save and $delete

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
 * {@link http://jsfiddle.net/m2y1qwm3/ editable example}
 *
 * @param {String} pid id or full URL of the person
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPerson = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-template', pid, {pid: pid}),
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
            response.persons[0].$isReadOnly = function() {
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
 * {@link http://jsfiddle.net/ukvu1dqs/ editable example}
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
      getCoupleRelationships: function() { return utils.filter(maybe(this).relationships, {type: 'http://gedcomx.org/Couple'}) || []; },
      getChildAndParentsRelationships: function() { return maybe(this).childAndParentsRelationships || []; },
      getPerson:    function(id) { return utils.find(this.persons, {id: id}); }
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
 * - `getPrimaryId()` - id of the person requested
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
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_With_Relationships_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/6vpk7asr/ editable example}
 *
 * @param {String} pid id of the person
 * @param {Object=} params set `persons` to true to retrieve full person objects for each relative
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person with relationships
 */
FS.prototype.getPersonWithRelationships = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-with-relationships-query'),
    function(url) {
      return self.plumbing.get(url, utils.extend({'person': pid}, params), {}, opts,
        utils.compose(
          utils.objectExtender({getPrimaryId: function() { return pid; }}), // Make the primary person's id available
          self._personsAndRelationshipsMapper(),
          utils.objectExtender(personWithRelationshipsConvenienceFunctions),
          function(response, promise) {
            response.persons[0].$isReadOnly = function() {
              var allowHeader = promise.getResponseHeader('Allow');
              return !!allowHeader && allowHeader.indexOf('POST') < 0;
            };
            return response;
          }
        ));
    });
};

// TODO check if person change summary has been fixed (last checked 14 July 14)
// also check if the entries really contain changeInfo and contributors attributes
// can't get any data from this resource as of 12 Feb 2015
// needs to be adapted to new sdk structure when fixed
//  /**
//   * @ngdoc function
//   * @name person.functions:getPersonChangeSummary
//   * @function
//   *
//   * @description
//   * Get the change summary for a person. For detailed change information see functions in the changeHistory module
//   * The response includes the following convenience function
//   *
//   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
//   *
//   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_Summary_resource FamilySearch API Docs}
//   *
//   * {@link http://jsfiddle.net/DallanQ/ga37h/ editable example}
//   *
//   * @param {String} pid id of the person or full URL of the person-change-summary endpoint
//   * @param {Object=} params currently unused
//   * @param {Object=} opts options to pass to the http function specified during init
//   * @return {Object} promise for the response
//   */
//  exports.getPersonChangeSummary = function(pid, params, opts) {
//    return helpers.chainHttpPromises(
//      plumbing.getUrl('person-change-summary-template', pid, {pid: pid}),
//      function(url) {
//        return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
//          helpers.compose(
//            helpers.objectExtender({getChanges: function() { return this.entries || []; }}),
//            helpers.constructorSetter(changeHistory.Change, 'entries')));
//      });
//  };

/**
 * @ngdoc function
 * @name person.functions:getSpouses
 * @function
 *
 * @description
 * Get the relationships to a person's spouses.
 * The response includes the following convenience functions
 *
 * - `getCoupleRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships
 * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents}
 * relationships for children of the couples
 * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship except children
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Spouses_of_a_Person_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/1311jcz8/ editable example}
 *
 * @param {String} pid id of the person or full URL of the spouses endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getSpouses = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('spouses-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._personsAndRelationshipsMapper());
    });
};

/**
 * @ngdoc function
 * @name person.functions:getParents
 * @function
 *
 * @description
 * Get the relationships to a person's parents.
 * The response includes the following convenience functions
 *
 * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
 * - `getCoupleRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships for parents
 * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Parents_of_a_person_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/Lf9fe61r/ editable example}
 *
 * @param {String} pid id of the person or full URL of the parents endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getParents = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('parents-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._personsAndRelationshipsMapper());
    });
};

/**
 * @ngdoc function
 * @name person.functions:getChildren
 * @function
 *
 * @description
 * Get the relationships to a person's children
 * The response includes the following convenience functions
 *
 * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
 * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Children_of_a_person_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/fownteLe/ editable example}
 *
 * @param {String} pid id of the person or full URL of the children endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getChildren = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('children-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts, self._personsAndRelationshipsMapper());
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
 * {@link http://jsfiddle.net/cv5wravg/ editable example}
 *
 * @param {string} pid id or full URL of the person
 * @param {string} changeMessage reason for the deletion
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id/URL
 */
FS.prototype.deletePerson = function(pid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-template', pid, {pid: pid}),
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
 * {@link http://jsfiddle.net/fh5jxsre/ editable example}
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
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('preferred-spouse-relationship-template', null, {uid: uid, pid: pid});
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
 * {@link http://jsfiddle.net/j8kws5n3/ editable example}
 *
 * @param {string} pid id of the person
 * @param {string} crid id or URL of the preferred Couple relationship, or null to set the unknown spouse
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id
 */
FS.prototype.setPreferredSpouse = function(pid, crid, opts) {
  var location,
      promises = [],
      self = this;
  if (crid === null) {
    // grab the first child-and-parents relationship with an unknown parent
    promises.push(
      self.getChildren(pid),
      function(response) {
        var capr = utils.find(response.getChildAndParentsRelationships(), function(capr) {
          return !capr.$getFatherId() || !capr.$getMotherId();
        });
        return self.plumbing.getUrl('child-and-parents-relationship-template', null, {caprid: capr.id});
      }
    );
  }
  else {
    promises.push(
      self.plumbing.getUrl('couple-relationship-template', crid, {crid: crid})
    );
  }
  promises.push(
    function(url) {
      location = url;
      return self.getCurrentUser();
    },
    function(response) {
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('preferred-spouse-relationship-template', null, {uid: uid, pid: pid});
    },
    function(url) {
      return self.plumbing.put(url, null, {'Location': location}, opts, function() {
        return pid;
      });
    }
  );
  return self.helpers.chainHttpPromises.apply(self.helpers, promises);
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
 * {@link http://jsfiddle.net/2cxup42f/ editable example}
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
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('preferred-spouse-relationship-template', null, {uid: uid, pid: pid});
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
 * {@link http://jsfiddle.net/rarpqLb6/ editable example}
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
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('preferred-parent-relationship-template', null, {uid: uid, pid: pid});
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
 * {@link http://jsfiddle.net/swfsnarb/ editable example}
 *
 * @param {string} pid id of the person
 * @param {string} caprid id or URL of the preferred ChildAndParents relationship
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the person id
 */
FS.prototype.setPreferredParents = function(pid, caprid, opts) {
  var childAndParentsUrl,
      self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-template', caprid, {caprid: caprid}),
    function(url) {
      childAndParentsUrl = url;
      return self.getCurrentUser();
    },
    function(response) {
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('preferred-parent-relationship-template', null, {uid: uid, pid: pid});
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
 * {@link http://jsfiddle.net/r5erwvft/ editable example}
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
      var uid = response.getUser().treeUserId;
      return self.plumbing.getUrl('preferred-parent-relationship-template', null, {uid: uid, pid: pid});
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
// TODO restore person
