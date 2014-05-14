define([
  'attribution',
  'changeHistory',
  'fact',
  'globals',
  'helpers',
  'notes',
  'plumbing',
  'sources'
], function(attribution, changeHistory, fact, globals, helpers, notes, plumbing, sources) {
  /**
   * @ngdoc overview
   * @name parentsAndChildren
   * @description
   * Functions related to parents and children relationships
   *
   * {@link https://familysearch.org/developers/docs/api/resources#parents-and-children FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

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
   * @param {Object=} data an object with optional attributes {father, mother, child, fatherFacts, motherFacts}.
   * _father_, _mother_, and _child_ are Person objects, URLs, or ids.
   * _fatherFacts_ and _motherFacts_ are arrays of Facts or objects to be passed into the Fact constructor.
   */
  var ChildAndParents = exports.ChildAndParents = function(data) {
    if (data) {
      if (data.father) {
        //noinspection JSUnresolvedFunction
        this.$setFather(data.father);
      }
      if (data.mother) {
        //noinspection JSUnresolvedFunction
        this.$setMother(data.mother);
      }
      if (data.child) {
        //noinspection JSUnresolvedFunction
        this.$setChild(data.child);
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

  // helper functions - called with this set to the relationship
  // export so we can use them in spouses.js

  // person may be a Person, a URL, or an ID
  exports.setMember = function(role, person) {
    if (!this[role]) {
      this[role] = {};
    }
    if (person instanceof globals.Person) {
      this[role].resource = person.$getPersonUrl();
      delete this[role].resourceId;
    }
    else if (helpers.isAbsoluteUrl(person)) {
      this[role].resource = person;
      delete this[role].resourceId;
    }
    else {
      this[role].resourceId = person;
      delete this[role].resource;
    }
  };

  exports.deleteMember = function(role, changeMessage) {
    if (!this.$deletedMembers) {
      this.$deletedMembers = {};
    }
    this.$deletedMembers[role] = changeMessage;
    delete this[role];
  };

  exports.setFacts = function(prop, values, changeMessage) {
    if (helpers.isArray(this[prop])) {
      helpers.forEach(this[prop], function(fact) {
        exports.deleteFact.call(this, prop, fact, changeMessage);
      }, this);
    }
    this[prop] = [];
    helpers.forEach(values, function(value) {
      exports.addFact.call(this, prop, value);
    }, this);
  };

  exports.addFact = function(prop, value) {
    if (!helpers.isArray(this[prop])) {
      this[prop] = [];
    }
    if (!(value instanceof fact.Fact)) {
      value = new fact.Fact(value);
    }
    this[prop].push(value);
  };

  exports.deleteFact = function(prop, value, changeMessage) {
    if (!(value instanceof fact.Fact)) {
      value = helpers.find(this[prop], { id: value });
    }
    var pos = helpers.indexOf(this[prop], value);
    if (pos >= 0) {
      // add fact to $deletedFacts map; key is the href to delete
      var key = helpers.removeAccessToken(maybe(maybe(maybe(value).links).conclusion).href);
      if (key) {
        if (!this.$deletedFacts) {
          this.$deletedFacts = {};
        }
        this.$deletedFacts[key] = changeMessage;
      }
      // remove fact from array
      this[prop].splice(pos,1);
    }
  };

  exports.ChildAndParents.prototype = {
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
    $getChildAndParentsUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).relationship).href); },

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
    $getFatherUrl: function() { return helpers.removeAccessToken(maybe(this.father).resource); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getFather
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
     */
    $getFather: function() { return globals.getPerson(this.$getFatherUrl() || this.$getFatherId()); },

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
    $getMotherUrl: function() { return helpers.removeAccessToken(maybe(this.mother).resource); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getMother
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
     */
    $getMother: function() { return globals.getPerson(this.$getMotherUrl() || this.$getMotherId()); },

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
    $getChildUrl: function() { return helpers.removeAccessToken(maybe(this.child).resource); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getChild
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
     */
    $getChild: function() { return globals.getPerson(this.$getChildUrl() || this.$getChildId()); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getNoteRefs
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link notes.functions:getChildAndParentsNoteRefs getChildAndParentsNoteRefs} response
     */
    $getNoteRefs: function() { return notes.getChildAndParentsNoteRefs(helpers.removeAccessToken(this.links.notes.href)); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getSourceRefs
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} promise for the {@link sources.functions:getChildAndParentsSourceRefs getChildAndParentsSourceRefs} response
     */
    $getSourceRefs: function() { return sources.getChildAndParentsSourceRefs(this.id); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$getChanges
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @return {Object} __BROKEN__ promise for the {@link sources.functions:getChildAndParentsChanges getChildAndParentsChanges} response
     */
    $getChanges: function() { return changeHistory.getChildAndParentsChanges(helpers.removeAccessToken(maybe(this.links['change-history']).href)); },

    /**
     * @ngdoc function
     * @name parentsAndChildren.types:constructor.ChildAndParents#$setFather
     * @methodOf parentsAndChildren.types:constructor.ChildAndParents
     * @function
     * @param {Person|string} father person or URL or id
     * @return {ChildAndParents} this relationship
     */
    $setFather: function(father) {
      exports.setMember.call(this, 'father', father);
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
      exports.setMember.call(this, 'mother', mother);
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
      exports.setMember.call(this, 'child', child);
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
      exports.deleteMember.call(this, 'father', changeMessage);
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
      exports.deleteMember.call(this, 'mother', changeMessage);
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
      exports.setFacts.call(this, 'fatherFacts', facts, changeMessage);
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
      exports.addFact.call(this, 'fatherFacts', value);
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
      exports.deleteFact.call(this, 'fatherFacts', value, changeMessage);
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
      exports.setFacts.call(this, 'motherFacts', facts, changeMessage);
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
      exports.addFact.call(this, 'motherFacts', value);
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
      exports.deleteFact.call(this, 'motherFacts', value, changeMessage);
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
     * {@link http://jsfiddle.net/DallanQ/PXN34/ editable example}
     *
     * @param {String=} changeMessage default change message to use when fact/deletion-specific changeMessage was not specified
     * @param {boolean=} refresh true to read the relationship after updating
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the relationship id, which is fulfilled after the relationship has been updated,
     * and if refresh is true, after the relationship has been read
     */
    $save: function(changeMessage, refresh, opts) {
      var postData = new ChildAndParents();
      var isChanged = false;
      var caprid = this.id;

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
      // TODO as far as I can tell, the change message isn't stored (last checked 4/2/14)
      if (changeMessage) {
        postData.attribution = new attribution.Attribution(changeMessage);
      }

      // send facts if new or changed
      helpers.forEach(['fatherFacts', 'motherFacts'], function(prop) {
        helpers.forEach(this[prop], function(fact) {
          if (!caprid || !fact.id || fact.$changed) {
            exports.addFact.call(postData, prop, fact);
            isChanged = true;
          }
        });
      }, this);

      var promises = [];

      // post update
      if (isChanged) {
        promises.push(helpers.chainHttpPromises(
          caprid ? plumbing.getUrl('child-and-parents-relationship-template', null, {caprid: caprid}) :
                   plumbing.getUrl('relationships'),
          function(url) {
            // set url from id now that discovery resource is guaranteed to be loaded
            helpers.forEach(['father', 'mother', 'child'], function(role) {
              if (postData[role] && !postData[role].resource && postData[role].resourceId) {
                postData[role].resource =
                  helpers.getUrlFromDiscoveryResource(globals.discoveryResource, 'person-template', {pid: postData[role].resourceId});
              }
            });
            return plumbing.post(url,
              { childAndParentsRelationships: [ postData ] },
              {'Content-Type': 'application/x-fs-v1+json'},
              opts,
              helpers.getResponseEntityId);
          }));
      }

      // post deleted members that haven't been re-set to something else
      helpers.forEach(['father', 'mother'], function(role) {
        if (this.id && this.$deletedMembers && this.$deletedMembers.hasOwnProperty(role) && !this[role]) {
          var msg = this.$deletedMembers[role] || changeMessage; // default to global change message
          promises.push(helpers.chainHttpPromises(
            plumbing.getUrl('child-and-parents-relationship-parent-template', null, {caprid: caprid, role: role}),
            function(url) {
              var headers = {'Content-Type': 'application/x-fs-v1+json'};
              if (msg) {
                headers['X-Reason'] = msg;
              }
              return plumbing.del(url, headers, opts);
            }
          ));
        }
      }, this);

      // post deleted facts
      if (caprid && this.$deletedFacts) {
        helpers.forEach(this.$deletedFacts, function(value, key) {
          value = value || changeMessage; // default to global change message
          var headers = {'Content-Type': 'application/x-fs-v1+json'};
          if (value) {
            headers['X-Reason'] = value;
          }
          promises.push(plumbing.del(key, headers, opts));
        });
      }

      var relationship = this;
      // wait for all promises to be fulfilled
      var promise = helpers.promiseAll(promises).then(function(results) {
        var id = caprid ? caprid : results[0]; // if we're adding a new relationship, get id from the first (only) promise
        helpers.extendHttpPromise(promise, promises[0]); // extend the first promise into the returned promise

        if (refresh) {
          // re-read the relationship and set this object's properties from response
          return exports.getChildAndParents(id, {}, opts).then(function(response) {
            helpers.deletePropertiesPartial(relationship, helpers.appFieldRejector);
            helpers.extend(relationship, response.getRelationship());
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
      return exports.deleteChildAndParents(this.$getChildAndParentsUrl() || this.id, changeMessage, opts);
    }
  };

  /**
   * @ngdoc function
   * @name parentsAndChildren.functions:getChildAndParents
   * @function
   *
   * @description
   * Get information about a child and parents relationship.
   * The response includes the following convenience functions
   *
   * - `getRelationship()` - a {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:constructor.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/C437t/ editable example}
   *
   * @param {String} caprid id or full URL of the child-and-parents relationship
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParents = function(caprid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-template', caprid, {caprid: caprid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.constructorSetter(ChildAndParents, 'childAndParentsRelationships'),
            helpers.objectExtender(childAndParentsConvenienceFunctions),
            helpers.constructorSetter(fact.Fact, 'motherFacts', function(response) {
              return maybe(response).childAndParentsRelationships;
            }),
            helpers.constructorSetter(fact.Fact, 'fatherFacts', function(response) {
              return maybe(response).childAndParentsRelationships;
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return helpers.flatMap(response.childAndParentsRelationships, function(relationship) {
                return helpers.union(relationship.motherFacts, relationship.fatherFacts);
              });
            }),
            globals.personMapper()
          ));
      });
  };

  var childAndParentsConvenienceFunctions = {
    getRelationship: function() { return maybe(this.childAndParentsRelationships)[0]; },
    getPerson:       function(id) { return helpers.find(this.persons, {id: id}); }
  };

  /**
   * @ngdoc function
   * @name parentsAndChildren.functions:deleteChildAndParents
   * @function
   *
   * @description
   * Delete the specified relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/LvUtM/ editable example}
   *
   * @param {string} caprid id or full URL of the child-and-parents relationship
   * @param {string} changeMessage reason for the deletion
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the relationship id/URL
   */
  exports.deleteChildAndParents = function(caprid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-template', caprid, {caprid: caprid}),
      function(url) {
        var headers = {'Content-Type': 'application/x-fs-v1+json'};
        if (changeMessage) {
          headers['X-Reason'] = changeMessage;
        }
        return plumbing.del(url, headers, opts, function() {
          return caprid;
        });
      }
    );
  };

  return exports;
});
