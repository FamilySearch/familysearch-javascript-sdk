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
 * Two methods to note below are _save_ and _delete_.
 * _save_ persists the changes made to father, mother, child, and facts;
 * _delete_ removes the relationship.
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {father, mother, child, fatherFacts, motherFacts}.
 * _father_, _mother_, and _child_ are Person objects, URLs, or ids.
 * _fatherFacts_ and _motherFacts_ are arrays of Facts or objects to be passed into the Fact constructor.
 */
var ChildAndParents = FS.ChildAndParents = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.father) {
      //noinspection JSUnresolvedFunction
      this.setFather(data.father);
    }
    if (data.mother) {
      //noinspection JSUnresolvedFunction
      this.setMother(data.mother);
    }
    if (data.child) {
      //noinspection JSUnresolvedFunction
      this.setChild(data.child);
    }
    if (data.fatherFacts) {
      utils.forEach(this.data.fatherFacts, function(value, i) {
        if(!(value instanceof FS.Fact)){
          this.data.fatherFacts[i] = client.createFact(value);
        }  
      }, this);
    }
    if (data.motherFacts) {
      utils.forEach(this.data.motherFacts, function(value, i) {
        if(!(value instanceof FS.Fact)){
          this.data.motherFacts[i] = client.createFact(value);
        }  
      }, this);
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

ChildAndParents.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: ChildAndParents,
  
  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} Id of the relationship
   */
  getId: function() { return this.data.id; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getChildAndParentsUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents

   * @return {String} Url of this child-and-parents relationship
   */
  getChildAndParentsUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('relationship')).href); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getFatherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., parent-relationship type
   */
  getFatherFacts: function() { return this.data.fatherFacts || []; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getMotherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., parent-relationship type
   */
  getMotherFacts: function() { return this.data.motherFacts || []; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getFatherId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} Id of the father
   */
  getFatherId: function() { return maybe(this.data.father).resourceId; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getFatherUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} URL of the father
   */
  getFatherUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.father).resource); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getFather
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  getFather: function() { return this.client.getPerson(this.getFatherUrl()); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getMotherId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} Id of the mother
   */
  getMotherId: function() { return maybe(this.data.mother).resourceId; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getMotherUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} URL of the mother
   */
  getMotherUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.mother).resource); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getMother
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  getMother: function() { return this.client.getPerson(this.getMotherUrl()); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getChildId
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} Id of the child
   */
  getChildId: function() { return maybe(this.data.child).resourceId; },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getChildUrl
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {String} URL of the child
   */
  getChildUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.child).resource); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getChild
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Object} promise for the {@link person.functions:getPerson getPerson} response
   */
  getChild: function() { return this.client.getPerson(this.getChildUrl()); },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getNotes
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Object} promise for the {@link notes.functions:getNotes getNotes} response
   */
  getNotes: function() { 
    var self = this;
    return self.getLinkPromise('notes').then(function(link){
      return self.client.getNotes(link.href);
    });
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getSourceRefs
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Object} promise for the {@link sources.functions:getSourceRefs getSourceRefs} response
   */
  getSourceRefs: function() { 
    var self = this;
    return self.getLinkPromise('source-references').then(function(link){
      return self.client.getSourceRefs(link.href);
    });
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getSources
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @return {Object} promise for the {@link sources.functions:getSourcesQuery getSourcesQuery} response
   */
  getSources: function() { 
    var self = this;
    return self.getLinkPromise('source-descriptions').then(function(link){
      return self.client.getSourcesQuery(link.href);
    });
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#getChanges
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description
   * Get change history for a child and parents relationship
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/v6e1yjsz/1/ Editable Example}
   *
   * @param {String} caprid id of the child and parents relationship or full URL of the child and parents relationship changes endpoint
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @return {Object} promise for the response
   */
  getChanges: function(params) { 
    var self = this;
    return self.getLinkPromise('change-history').then(function(link) {
      return self.client.getChanges(link.href, params);
    });
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#setFather
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @param {Person|string} father person or URL or id
   * @return {ChildAndParents} this relationship
   */
  setFather: function(father) {
    relHelpers.setMember.call(this, 'father', father);
    this.fatherChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#setMother
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @param {Person|string} mother person or URL or id
   * @return {ChildAndParents} this relationship
   */
  setMother: function(mother) {
    relHelpers.setMember.call(this, 'mother', mother);
    this.motherChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#setChild
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description NOTE: Once the relationship has been saved, the child can no longer be changed
   * @param {Person|string} child person or URL or id
   * @return {ChildAndParents} this relationship
   */
  setChild: function(child) {
    relHelpers.setMember.call(this, 'child', child);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#deleteFather
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description remove father from the relationship
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  deleteFather: function(changeMessage) {
    relHelpers.deleteMember.call(this, 'father', changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#deleteMother
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description remove mother from the relationship
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  deleteMother: function(changeMessage) {
    relHelpers.deleteMember.call(this, 'mother', changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#setFatherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact[]|Object[]} facts facts to set; if an array element is not a Fact, it is passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {ChildAndParents} this relationship
   */
  setFatherFacts: function(facts, changeMessage) {
    relHelpers.setFacts.call(this, 'fatherFacts', facts, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#addFatherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {ChildAndParents} this relationship
   */
  addFatherFact: function(value) {
    relHelpers.addFact.call(this, 'fatherFacts', value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#deleteFatherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  deleteFatherFact: function(value, changeMessage) {
    relHelpers.deleteFact.call(this, 'fatherFacts', value, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#setMotherFacts
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact[]|Object[]} facts facts to set; if an array element is not a Fact, it is passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {ChildAndParents} this relationship
   */
  setMotherFacts: function(facts, changeMessage) {
    relHelpers.setFacts.call(this, 'motherFacts', facts, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#addMotherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description NOTE: dates are not supported for BiologicalParent, and places are not supported at all
   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {ChildAndParents} this relationship
   */
  addMotherFact: function(value) {
    relHelpers.addFact.call(this, 'motherFacts', value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#deleteMotherFact
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {ChildAndParents} this relationship
   */
  deleteMotherFact: function(value, changeMessage) {
    relHelpers.deleteFact.call(this, 'motherFacts', value, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#save
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description
   * Create a new relationship if this relationship does not have an id, or update the existing relationship.
   * When a new relationship is created the Id and links will be set from the HTTP response headers.
   *
   * {@link http://jsfiddle.net/6of3pzte/2/ Editable Example}
   *
   * @param {String=} changeMessage default change message to use when fact/deletion-specific changeMessage was not specified
   * @return {Object} promise that is resolved with an array of responses for all HTTP requests that were made
   */
  save: function(changeMessage) {
    var postData = this.client.createChildAndParents();
    var isChanged = false;
    var caprid = this.getId();
    var self = this;

    // send father if new or changed
    if (!caprid || this.fatherChanged) {
      postData.setFather(this.data.father);
      isChanged = true;
    }

    // send mother if new or changed
    if (!caprid || this.motherChanged) {
      postData.setMother(this.data.mother);
      isChanged = true;
    }

    // send child if new (can't change child)
    if (!caprid) {
      postData.setChild(this.data.child);
      isChanged = true;
    }

    // set global changeMessage
    if (changeMessage) {
      postData.setAttribution(changeMessage);
    }

    // send facts if new or changed
    utils.forEach(['fatherFacts', 'motherFacts'], function(prop) {
      utils.forEach(self.data[prop], function(fact) {
        if (!caprid || !fact.getId() || fact.changed) {
          relHelpers.addFact.call(postData, prop, fact);
          isChanged = true;
        }
      });
    });
    
    var promises = [];

    // post update
    if (isChanged) {
      var urlPromise = self.getChildAndParentsUrl() ? Promise.resolve(self.getChildAndParentsUrl()) :
                   self.plumbing.getCollectionUrl('FSFT', 'relationships');
      promises.push(
        urlPromise.then(function(url) {
          utils.forEach(['father', 'mother', 'child'], function(role) {
            if (postData.data[role] && !postData.data[role].resource && postData.data[role].resourceId) {
              postData.data[role].resource = postData.data[role].resourceId;
            }
          });
          return self.plumbing.post(url, { childAndParentsRelationships: [ postData ] }, {'Content-Type': 'application/x-fs-v1+json'});
        }).then(function(response){
          self.updateFromResponse(response, 'relationship');
          return response;
        })
      );
    }

    // post deleted members that haven't been re-set to something else
    utils.forEach(['father', 'mother'], function(role) {
      if (self.getId() && self.deletedMembers && self.deletedMembers.hasOwnProperty(role) && !self.data[role]) {
        var msg = self.deletedMembers[role] || changeMessage; // default to global change message
        promises.push(
          self.getLinkPromise(role + '-role').then(function(link) {
            var headers = {'Content-Type': 'application/x-fs-v1+json'};
            if (msg) {
              headers['X-Reason'] = msg;
            }
            return self.plumbing.del(link.href, headers);
          })
        );
      }
    });

    // post deleted facts
    if (caprid && self.deletedFacts) {
      utils.forEach(self.deletedFacts, function(value, key) {
        value = value || changeMessage; // default to global change message
        var headers = {'Content-Type': 'application/x-fs-v1+json'};
        if (value) {
          headers['X-Reason'] = value;
        }
        promises.push(self.plumbing.del(key, headers));
      });
    }

    // wait for all promises to be fulfilled
    return Promise.all(promises);
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#delete
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description delete this relationship - see {@link parentsAndChildren.functions:deleteChildAndParents deleteChildAndPArents}
   * @param {string} changeMessage change message
   * @return {Object} promise for response
   */
  delete: function(changeMessage) {
    return this.client.deleteChildAndParents(this.getChildAndParentsUrl(), changeMessage);
  },

  /**
   * @ngdoc function
   * @name parentsAndChildren.types:constructor.ChildAndParents#restore
   * @methodOf parentsAndChildren.types:constructor.ChildAndParents
   * @description restore this relationship - see {@link parentsAndChildren.functions:restoreChildAndPArents restoreChildAndPArents}
   * @return {Object} promise for the response
   */
  restore: function() {
    var self = this;
    return self.getLinkPromise('restore').then(function(link){
      return self.client.restoreChildAndParents(link.href);
    });
  }
  
});