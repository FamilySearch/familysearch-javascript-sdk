var FS = require('../FamilySearch'),
    relHelpers = require('../relationshipHelpers'),
    utils = require('../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name spouses.types:constructor.Couple
 * @description
 *
 * Couple relationship
 *
 * Two methods to note below are _save_ and _delete_.
 * _save_ persists the changes made to husband, wife, and facts;
 * _delete_ removes the relationship.
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {husband, wife, facts}.
 * _husband_ and _wife_ are Person objects, URLs, or ids.
 * _facts_ is an array of Facts or objects to be passed into the Fact constructor.
 */
var Couple = FS.Couple = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.husband) {
      //noinspection JSUnresolvedFunction
      this.setHusband(data.husband);
      delete data.husband;
    }
    if (data.wife) {
      //noinspection JSUnresolvedFunction
      this.setWife(data.wife);
      delete data.wife;
    }
    if (data.facts) {
      utils.forEach(this.data.facts, function(fact, i){
        if(!(fact instanceof FS.Fact)){
          this.data.facts[i] = client.createFact(fact);
        }
      }, this);
    }
  }
};

/**
 * @ngdoc function
 * @name spouses.functions:createCouple
 * @param {Object} data [Relationship](https://familysearch.org/developers/docs/api/gx/Relationship_json) data
 * @return {Object} {@link spouses.types:constructor.Couple Couple}
 * @description Create a {@link spouses.types:constructor.Couple Couple} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createCouple = function(data){
  return new Couple(this, data);
};

Couple.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Couple,
  
  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getId
   * @methodOf spouses.types:constructor.Couple
   * @return {String} Id of the relationship
   */

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getCoupleUrl
   * @methodOf spouses.types:constructor.Couple

   * @return {String} Url of this couple relationship
   */
  getCoupleUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('relationship')).href); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getFacts
   * @methodOf spouses.types:constructor.Couple
   * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., marriage
   */
  getFacts: function() { return this.data.facts || []; },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getMarriageFact
   * @methodOf spouses.types:constructor.Couple
   * @return {Fact} {@link fact.types:constructor.Fact Fact} of type http://gedcomx.org/Marriage (first one if multiple)
   */
  getMarriageFact: function() { return utils.find(this.data.facts, function(fact){
      return fact.getType() === 'http://gedcomx.org/Marriage';
    }); 
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getHusbandId
   * @methodOf spouses.types:constructor.Couple
   * @return {String} Id of the husband
   */
  getHusbandId: function() { return maybe(this.data.person1).resourceId; },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getHusbandUrl
   * @methodOf spouses.types:constructor.Couple
   * @return {String} URL of the husband
   */
  getHusbandUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.person1).resource); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getHusband
   * @methodOf spouses.types:constructor.Couple
   * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
   */
  getHusband: function() { return this.client.getPerson(this.getHusbandUrl()); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getWifeId
   * @methodOf spouses.types:constructor.Couple
   * @return {String} Id of the wife
   */
  getWifeId: function() { return maybe(this.data.person2).resourceId; },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getWifeUrl
   * @methodOf spouses.types:constructor.Couple
   * @return {String} URL of the wife
   */
  getWifeUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.person2).resource); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getWife
   * @methodOf spouses.types:constructor.Couple
   * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
   */
  getWife: function() { return this.client.getPerson(this.getWifeUrl()); },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getSpouseId
   * @methodOf spouses.types:constructor.Couple
   * @description Use this method when you know the ID of one person in the relationship and you want to fetch the ID of the other person.
   * @param {string} ID of the spouse which you already know
   * @return {String} Id of the other spouse
   */
  getSpouseId: function(knownSpouseId) { 
    if(maybe(this.data.person1).resourceId === knownSpouseId) {
      return maybe(this.data.person2).resourceId;
    } else {
      return maybe(this.data.person1).resourceId;
    }
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getSpouseUrl
   * @methodOf spouses.types:constructor.Couple
   * @description Use this method when you know the ID of one person in the relationship and you want to fetch the URL of the other person.
   * @param {string} ID of the spouse which you already know
   * @return {String} URL of the other spouse
   */
  getSpouseUrl: function(knownSpouseId) {
    if(maybe(this.data.person1).resourceId === knownSpouseId) {
      return this.helpers.removeAccessToken(maybe(this.data.person2).resource);
    } else {
      return this.helpers.removeAccessToken(maybe(this.data.person1).resource);
    }
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getSpouse
   * @methodOf spouses.types:constructor.Couple
   * @description Use this method when you know the ID of one person in the relationship and you want to fetch the other person.
   * @param {string} ID of the spouse which you already know
   * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
   */
  getSpouse: function(knownSpouseId) { 
    return this.client.getPerson(this.getSpouseUrl(knownSpouseId));
  },
  
  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getNotes
   * @methodOf spouses.types:constructor.Couple
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
   * @name spouses.types:constructor.Couple#getSourceRefs
   * @methodOf spouses.types:constructor.Couple
   * @return {Object} promise for the {@link sources.functions:getCoupleSourceRefs getCoupleSourceRefs} response
   */
  getSourceRefs: function() { 
    var self = this;
    return self.getLinkPromise('source-references').then(function(link){
      return self.client.getSourceRefs(link.href);
    });
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#getSources
   * @methodOf spouses.types:constructor.Couple
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
   * @name spouses.types:constructor.Couple#getChanges
   * @methodOf spouses.types:constructor.Couple
   * @description
   * Get change history for a couple relationship
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/940x4gux/1/ Editable Example}
   *
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
   * @name spouses.types:constructor.Couple#setHusband
   * @methodOf spouses.types:constructor.Couple
   * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
   * @param {Person|string} husband person or URL or id
   * @return {Couple} this relationship
   */
  setHusband: function(husband) {
    relHelpers.setMember.call(this, 'person1', husband);
    this.husbandChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#setWife
   * @methodOf spouses.types:constructor.Couple
   * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
   * @param {Person|string} wife person or URL or id
   * @return {Couple} this relationship
   */
  setWife: function(wife) {
    relHelpers.setMember.call(this, 'person2', wife);
    this.wifeChanged = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#setFacts
   * @methodOf spouses.types:constructor.Couple
   * @param {Fact[]|Object[]} facts facts to set; if array elements are not Facts, they are passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {Couple} this relationship
   */
  setFacts: function(facts, changeMessage) {
    relHelpers.setFacts.call(this, 'facts', facts, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#addFact
   * @methodOf spouses.types:constructor.Couple
   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {Couple} this relationship
   */
  addFact: function(value) {
    relHelpers.addFact.call(this, 'facts', value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#deleteFact
   * @methodOf spouses.types:constructor.Couple
   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {Couple} this relationship
   */
  deleteFact: function(value, changeMessage) {
    relHelpers.deleteFact.call(this, 'facts', value, changeMessage);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#save
   * @methodOf spouses.types:constructor.Couple
   * @description
   * Create a new relationship if this relationship does not have an id, or update the existing relationship.
   *
   * {@link http://jsfiddle.net/LtphkL51/1/ Editable Example}
   *
   * @param {String=} changeMessage default change message to use when fact/deletion-specific changeMessage was not specified
   * @return {Object} promise that resolves to an array of responses
   */
  save: function(changeMessage) {
    var postData = this.client.createCouple();
    var isChanged = false;
    var crid = this.getId();
    var self = this;

    // send husband and wife if new or either has changed
    if (!crid || this.husbandChanged || this.wifeChanged) {
      postData.data.person1 = this.data.person1;
      postData.data.person2 = this.data.person2;
      isChanged = true;
    }

    // set global changeMessage
    if (changeMessage) {
      postData.setAttribution(self.client.createAttribution(changeMessage));
    }

    utils.forEach(this.data.facts, function(fact) {
      if (!crid || !fact.getId() || fact.changed) {
        relHelpers.addFact.call(postData, 'facts', fact);
        isChanged = true;
      }
    });

    var promises = [];

    // post update
    if (isChanged) {
      if (!crid) {
        postData.data.type = 'http://gedcomx.org/Couple'; // set type on new relationships
      }
      // as of 9 July 2014 it's possible to update relationships using the relationships endpoint,
      // but the way we're doing it is fine as well
      var urlPromise = self.getCoupleUrl() ? Promise.resolve(self.getCoupleUrl()) : self.plumbing.getCollectionUrl('FSFT', 'relationships');
      promises.push(
        urlPromise.then(function(url) {
          // set url from id
          utils.forEach(['person1', 'person2'], function(role) {
            if (postData.data[role] && !postData.data[role].resource && postData.data[role].resourceId) {
              postData.data[role].resource = postData.data[role].resourceId;
            }
          });
          return self.plumbing.post(url, { relationships: [ postData ] });
        }).then(function(response){
          self.updateFromResponse(response);
          return response;
        })
      );
    }

    // post deleted facts
    if (crid && this.deletedFacts) {
      utils.forEach(this.deletedFacts, function(value, key) {
        value = value || changeMessage; // default to global change message
        promises.push(self.plumbing.del(key, value ? {'X-Reason' : value} : {}));
      });
    }

    // wait for all promises to be fulfilled
    return Promise.all(promises);
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#delete
   * @methodOf spouses.types:constructor.Couple
   * @description delete this relationship - see {@link spouses.functions:deleteCouple deleteCouple}
   * @param {string} changeMessage change message
   * @return {Object} promise for the relationship URL
   */
  delete: function(changeMessage) {
    return this.client.deleteCouple(this.getCoupleUrl(), changeMessage);
  },

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple#restore
   * @methodOf spouses.types:constructor.Couple
   * @description restore this relationship - see {@link spouses.functions:restoreCouple restoreCouple}
   * @return {Object} promise for the relationship URL
   */
  restore: function() {
    var self = this;
    return self.getLinkPromise('restore').then(function(link){
      return self.client.restoreCouple(link.href);
    });
  }
});