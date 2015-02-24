var FS = require('../FamilySearch'),
    relHelpers = require('../relationshipHelpers'),
    utils = require('../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name parentsAndChildren.types:constructor.ChildAndParents
 * @description
 *
 * Child and parents relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
 *
 * Two methods to note below are _$save_ and _$delete_.
 * _$save_ persists the changes made to father, mother, child, and facts;
 * _$delete_ removes the relationship.
 *
 * @param {Object=} data an object with optional attributes {$father, $mother, $child, fatherFacts, motherFacts}.
 * _$father_, _$mother_, and _$child_ are Person objects, URLs, or ids.
 * _fatherFacts_ and _motherFacts_ are arrays of Facts or objects to be passed into the Fact constructor.
 */
var ChildAndParents = FS.ChildAndParents = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.$father) {
      //noinspection JSUnresolvedFunction
      this.$setFather(data.$father);
      delete this.$father;
    }
    if (data.$mother) {
      //noinspection JSUnresolvedFunction
      this.$setMother(data.$mother);
      delete this.$mother;
    }
    if (data.$child) {
      //noinspection JSUnresolvedFunction
      this.$setChild(data.$child);
      delete this.$child;
    }
    if (data.fatherFacts) {
      //noinspection JSUnresolvedFunction
      this.$setFatherFacts(data.fatherFacts);
    }
    if (data.motherFacts) {
      //noinspection JSUnresolvedFunction
      this.$setMotherFacts(data.motherFacts);
    }
  }
};

/**
 * @ngdoc function
 * @name parentsAndChildren.functions:createChildAndParents
 * @param {Object} data [ChildAndParentsRelationship](https://familysearch.org/developers/docs/api/fs/ChildAndParentsRelationship_json) data
 * @return {Object} {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents}
 * @description Create a {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createChildAndParents = function(data){
  return new ChildAndParents(this, data);
};

ChildAndParents.prototype = {
  constructor: ChildAndParents,
  /**
   * @ngdoc property
   * @name parentsAndChildren.types:constructor.ChildAndParents#id
   * @propertyOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} Id of the relationship
   */

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getChildAndParentsUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} Url of this child-and-parents relationship
   */
  $getChildAndParentsUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).relationship).href); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getFatherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., parent-relationship type
   */
  $getFatherFacts: function() { return this.fatherFacts || []; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getMotherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., parent-relationship type
   */
  $getMotherFacts: function() { return this.motherFacts || []; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getFatherId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} Id of the father
   */
  $getFatherId: function() { return maybe(this.father).resourceId; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getFatherUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} URL of the father
   */
  $getFatherUrl: function() { return this.$helpers.removeAccessToken(maybe(this.father).resource); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getFather
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  $getFather: function() { return this.$client.getPerson(this.$getFatherUrl() || this.$getFatherId()); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getMotherId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} Id of the mother
   */
  $getMotherId: function() { return maybe(this.mother).resourceId; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getMotherUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} URL of the mother
   */
  $getMotherUrl: function() { return this.$helpers.removeAccessToken(maybe(this.mother).resource); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getMother
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  $getMother: function() { return this.$client.getPerson(this.$getMotherUrl() || this.$getMotherId()); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getChildId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} Id of the child
   */
  $getChildId: function() { return maybe(this.child).resourceId; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getChildUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {String} URL of the child
   */
  $getChildUrl: function() { return this.$helpers.removeAccessToken(maybe(this.child).resource); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getChild
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  $getChild: function() { return this.$client.getPerson(this.$getChildUrl() || this.$getChildId()); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getNotes
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} promise for the {@link notes.functions:getChildAndParentsNotes getChildAndParentsNotes} response
   */
  $getNotes: function() { return this.$client.getChildAndParentsNotes(this.$helpers.removeAccessToken(maybe(maybe(this.links).notes).href)); },


  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getSourceRefs
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} promise for the {@link sources.functions:getChildAndParentsSourceRefs getChildAndParentsSourceRefs} response
   */
  $getSourceRefs: function() { return this.$client.getChildAndParentsSourceRefs(this.id); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getSources
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} promise for the {@link sources.functions:getChildAndParentsSourcesQuery getChildAndParentsSourcesQuery} response
   */
  $getSources: function() { return this.$client.getChildAndParentsSourcesQuery(this.id); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$getChanges
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @return {Object} __BROKEN__ promise for the {@link changeHistory.functions:getChildAndParentsChanges getChildAndParentsChanges} response
   */
  $getChanges: function() { return this.$client.getChildAndParentsChanges(this.$helpers.removeAccessToken(maybe(this.links['change-history']).href)); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$setFather
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @param {Person|string} father person or URL or id
   * @return {ChildAndParents} this relationship
   */
  $setFather: function(father) {
    relHelpers.setMember.call(this, 'father', father);
    this.$fatherChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$setMother
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @param {Person|string} mother person or URL or id
   * @return {ChildAndParents} this relationship
   */
  $setMother: function(mother) {
    relHelpers.setMember.call(this, 'mother', mother);
    this.$motherChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$setChild
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description NOTE: Once the relationship has been saved, the child can no longer be changed
   * @param {Person|string} child person or URL or id
   * @return {ChildAndParents} this relationship
   */
  $setChild: function(child) {
    relHelpers.setMember.call(this, 'child', child);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$deleteFather
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description remove father from the relationship
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  $deleteFather: function(changeMessage) {
    relHelpers.deleteMember.call(this, 'father', changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$deleteMother
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description remove mother from the relationship
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  $deleteMother: function(changeMessage) {
    relHelpers.deleteMember.call(this, 'mother', changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$setFatherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact[]|Object[]} facts facts to set; if an array element is not a Fact, it is passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {ChildAndParents} this relationship
   */
  $setFatherFacts: function(facts, changeMessage) {
    relHelpers.setFacts.call(this, 'fatherFacts', facts, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$addFatherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {ChildAndParents} this relationship
   */
  $addFatherFact: function(value) {
    relHelpers.addFact.call(this, 'fatherFacts', value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$deleteFatherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  $deleteFatherFact: function(value, changeMessage) {
    relHelpers.deleteFact.call(this, 'fatherFacts', value, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$setMotherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact[]|Object[]} facts facts to set; if an array element is not a Fact, it is passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {ChildAndParents} this relationship
   */
  $setMotherFacts: function(facts, changeMessage) {
    relHelpers.setFacts.call(this, 'motherFacts', facts, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$addMotherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {ChildAndParents} this relationship
   */
  $addMotherFact: function(value) {
    relHelpers.addFact.call(this, 'motherFacts', value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$deleteMotherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  $deleteMotherFact: function(value, changeMessage) {
    relHelpers.deleteFact.call(this, 'motherFacts', value, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$save
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description
   * Create a new relationship if this relationship does not have an id, or update the existing relationship
   *
   * {@link http://jsfiddle.net/6of3pzte/ editable example}
   *
   * @param {String=} changeMessage default change message to use when fact/deletion-specific changeMessage was not specified
   * @param {boolean=} refresh true to read the relationship after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the relationship id, which is fulfilled after the relationship has been updated,
   * and if refresh is true, after the relationship has been read
   */
  $save: function(changeMessage, refresh, opts) {
    var postData = this.$client.createChildAndParents();
    var isChanged = false;
    var caprid = this.id;
    var self = this;

    // send father if new or changed
    if (!this.id || this.$fatherChanged) {
      postData.father = this.father;
      isChanged = true;
    }

    // send mother if new or changed
    if (!this.id || this.$motherChanged) {
      postData.mother = this.mother;
      isChanged = true;
    }

    // send child if new (can't change child)
    if (!this.id) {
      postData.child = this.child;
      isChanged = true;
    }

    // set global changeMessage
    if (changeMessage) {
      postData.attribution = self.$client.createAttribution(changeMessage);
    }

    // send facts if new or changed
    utils.forEach(['fatherFacts', 'motherFacts'], function(prop) {
      utils.forEach(self[prop], function(fact) {
        if (!caprid || !fact.id || fact.$changed) {
          relHelpers.addFact.call(postData, prop, fact);
          isChanged = true;
        }
      });
    });

    var promises = [];

    // post update
    if (isChanged) {
      promises.push(self.$helpers.chainHttpPromises(
        caprid ? self.$plumbing.getUrl('child-and-parents-relationship-template', null, {caprid: caprid}) :
                 self.$plumbing.getUrl('relationships'),
        function(url) {
          // set url from id
          utils.forEach(['father', 'mother', 'child'], function(role) {
            if (postData[role] && !postData[role].resource && postData[role].resourceId) {
              postData[role].resource =postData[role].resourceId;
            }
          });
          return self.$plumbing.post(url,
            { childAndParentsRelationships: [ postData ] },
            {'Content-Type': 'application/x-fs-v1+json'},
            opts,
            self.$helpers.getResponseEntityId);
        }));
    }

    // post deleted members that haven't been re-set to something else
    utils.forEach(['father', 'mother'], function(role) {
      if (self.id && self.$deletedMembers && self.$deletedMembers.hasOwnProperty(role) && !self[role]) {
        var msg = self.$deletedMembers[role] || changeMessage; // default to global change message
        promises.push(self.$helpers.chainHttpPromises(
          self.$plumbing.getUrl('child-and-parents-relationship-parent-template', null, {caprid: caprid, role: role}),
          function(url) {
            var headers = {'Content-Type': 'application/x-fs-v1+json'};
            if (msg) {
              headers['X-Reason'] = msg;
            }
            return self.$plumbing.del(url, headers, opts);
          }
        ));
      }
    });

    // post deleted facts
    if (caprid && self.$deletedFacts) {
      utils.forEach(self.$deletedFacts, function(value, key) {
        value = value || changeMessage; // default to global change message
        var headers = {'Content-Type': 'application/x-fs-v1+json'};
        if (value) {
          headers['X-Reason'] = value;
        }
        promises.push(self.$plumbing.del(key, headers, opts));
      });
    }

    // wait for all promises to be fulfilled
    var promise = self.$helpers.promiseAll(promises).then(function(results) {
      var id = caprid ? caprid : results[0]; // if we're adding a new relationship, get id from the first (only) promise
      self.$helpers.extendHttpPromise(promise, promises[0]); // extend the first promise into the returned promise

      if (refresh) {
        // re-read the relationship and set this object's properties from response
        return self.$client.getChildAndParents(id, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getRelationship());
          return id;
        });
      }
      else {
        return id;
      }
    });
    return promise;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#$delete
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @function
   * @description delete this relationship - see {@link parentsAndChildren.functions:deleteChildAndParents deleteChildAndPArents}
   * @param {string} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the relationship URL
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteChildAndParents(this.$getChildAndParentsUrl() || this.id, changeMessage, opts);
  }
};