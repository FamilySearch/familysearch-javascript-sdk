var FS = require('../FamilySearch'),
    utils = require('../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc function
 * @name person.types:constructor.Person
 * @description
 *
 * Person
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
 *
 * Two methods to note below are _save_ and _delete_.
 * _save_ persists the changes made to names, facts, and gender;
 * _delete_ removes the person.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {gender, names, facts}.
 * _gender_ is a string.
 * _names_ is an array of Name's, or Objects or strings to pass into the Name constructor.
 * _facts_ is an array of Fact's or Objects to pass into the Fact constructor.
 */
var Person = FS.Person = function(client, data) {
  FS.BaseClass.call(this, client, data);
  if (data) {
    if (data.gender) {
      this.setGender(data.gender);
    }
    if (data.names) {
      utils.forEach(this.data.names, function(name, i){
        if(!(name instanceof FS.Name)){
          this.data.names[i] = client.createName(name);
        }
      }, this);
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
 * @name person.functions:createPerson
 * @param {Object} data [Person](https://familysearch.org/developers/docs/api/gx/Person_json) data
 * @return {Object} {@link person.types:constructor.Person Person}
 * @description Create a {@link person.types:constructor.Person Person} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createPerson = function(data){
  return new Person(this, data);
};

function spacePrefix(namePiece) {
  return namePiece ? ' ' + namePiece : '';
}

Person.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Person,
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getId
   * @methodOf person.types:constructor.Person
   * @return {String} Id of the person
   */

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#isLiving
   * @methodOf person.types:constructor.Person
   * @return {Boolean} true or false
   */
  isLiving: function() { return this.data.living; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplay
   * @methodOf person.types:constructor.Person
   * @return {Object} includes `birthDate`, `birthPlace`, `deathDate`, `deathPlace`, `gender`, `lifespan`, and `name` attributes
   */
  getDisplay: function() { return maybe(this.data.display); },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getIdentifiers
   * @methodOf person.types:constructor.Person
   * @return {Object} map of identifiers to arrays of values
   */
  getIdentifiers: function() { return maybe(this.data.identifiers); },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getGender
   * @methodOf person.types:constructor.Person
   * @return {Gender} gender
   */
  getGender: function() { return this.data.gender; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#isReadOnly
   * @methodOf person.types:constructor.Person
   * @description
   * This function is available only if the person is read with `getPerson` or `getPersonWithRelationships`.
   * @returns {Boolean} true if the person is read-only
   */
  // this function is added when an api response is processed because the information
  // is contained in the http headers

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getFacts
   * @methodOf person.types:constructor.Person

   * @param {string=} type if present, return only facts with this type
   * @return {Fact[]} an array of {@link fact.types:constructor.Fact Facts}
   */
  getFacts: function(type) {
    return (type ? utils.filter(this.data.facts, {type: type}) : this.data.facts) || [];
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getFact
   * @methodOf person.types:constructor.Person

   * @param {string} type fact type; e.g., http://gedcomx.org/Birth
   * @return {Fact} return first {@link fact.types:constructor.Fact Fact} having specified type
   */
  getFact: function(type) {
    return utils.find(this.data.facts, function(fact){
      return fact.getType() === type;
    });
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getBirth
   * @methodOf person.types:constructor.Person

   * @return {Fact} Birth {@link fact.types:constructor.Fact Fact}
   */
  getBirth: function() {
    return this.getFact('http://gedcomx.org/Birth');
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getBirthDate
   * @methodOf person.types:constructor.Person

   * @return {string} Birth date
   */
  getBirthDate: function() {
    var fact = this.getBirth();
    return fact ? fact.getOriginalDate() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getBirthPlace
   * @methodOf person.types:constructor.Person

   * @return {string} Birth place
   */
  getBirthPlace: function() {
    var fact = this.getBirth();
    return fact ? fact.getOriginalPlace() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getChristening
   * @methodOf person.types:constructor.Person

   * @return {Fact} Christening {@link fact.types:constructor.Fact Fact}
   */
  getChristening: function() {
    return this.getFact('http://gedcomx.org/Christening');
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getChristeningDate
   * @methodOf person.types:constructor.Person

   * @return {string} Christening date
   */
  getChristeningDate: function() {
    var fact = this.getChristening();
    return fact ? fact.getOriginalDate() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getChristeningPlace
   * @methodOf person.types:constructor.Person

   * @return {string} Christning place
   */
  getChristeningPlace: function() {
    var fact = this.getChristening();
    return fact ? fact.getOriginalPlace() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDeath
   * @methodOf person.types:constructor.Person

   * @return {Fact} Death {@link fact.types:constructor.Fact Fact}
   */
  getDeath: function() {
    return this.getFact('http://gedcomx.org/Death');
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDeathDate
   * @methodOf person.types:constructor.Person

   * @return {string} Death date
   */
  getDeathDate: function() {
    var fact = this.getDeath();
    return fact ? fact.getOriginalDate() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDeathPlace
   * @methodOf person.types:constructor.Person

   * @return {string} Death place
   */
  getDeathPlace: function() {
    var fact = this.getDeath();
    return fact ? fact.getOriginalPlace() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getBurial
   * @methodOf person.types:constructor.Person

   * @return {Fact} Burial {@link fact.types:constructor.Fact Fact}
   */
  getBurial: function() {
    return this.getFact('http://gedcomx.org/Burial');
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getBurialDate
   * @methodOf person.types:constructor.Person

   * @return {string} Burial date
   */
  getBurialDate: function() {
    var fact = this.getBurial();
    return fact ? fact.getOriginalDate() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getBurialPlace
   * @methodOf person.types:constructor.Person

   * @return {string} Birth place
   */
  getBurialPlace: function() {
    var fact = this.getBurial();
    return fact ? fact.getOriginalPlace() : '';
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayBirthDate
   * @methodOf person.types:constructor.Person

   * @return {String} birth date
   */
  getDisplayBirthDate: function() { return this.getDisplay().birthDate; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayBirthPlace
   * @methodOf person.types:constructor.Person

   * @return {String} birth place
   */
  getDisplayBirthPlace: function() { return this.getDisplay().birthPlace; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayDeathDate
   * @methodOf person.types:constructor.Person

   * @return {String} death date
   */
  getDisplayDeathDate: function() { return this.getDisplay().deathDate; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayDeathPlace
   * @methodOf person.types:constructor.Person

   * @return {String} death place
   */
  getDisplayDeathPlace: function() { return this.getDisplay().deathPlace; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayGender
   * @methodOf person.types:constructor.Person

   * @return {String} gender - Male or Female
   */
  getDisplayGender: function() { return this.getDisplay().gender; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayLifeSpan
   * @methodOf person.types:constructor.Person

   * @returns {string} birth year - death year
   */
  getDisplayLifeSpan: function() { return this.getDisplay().lifespan; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDisplayName
   * @methodOf person.types:constructor.Person

   * @return {string} display name
   */
  getDisplayName: function() { return this.getDisplay().name; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getNames
   * @methodOf person.types:constructor.Person

   * @param {string=} type if present, return only names with this type
   * @return {Name[]} an array of {@link name.types:constructor.Name Names}
   */
  getNames: function(type) {
    return (type ? utils.filter(this.data.names, function(n){ return n.getType() === type; }) : this.data.names) || [];
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getPreferredName
   * @methodOf person.types:constructor.Person

   * @return {string} preferred {@link name.types:constructor.Name Name}
   */
  getPreferredName: function() { return utils.findOrFirst(this.data.names, function(n){ return n.isPreferred(); }); },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getGivenName
   * @methodOf person.types:constructor.Person

   * @return {String} preferred given name
   */
  getGivenName: function() {
    var name = this.getPreferredName();
    if (name) {
      name = name.getGivenName();
    }
    return name;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getSurname
   * @methodOf person.types:constructor.Person

   * @return {String} preferred surname
   */
  getSurname: function() {
    var name = this.getPreferredName();
    if (name) {
      name = name.getSurname();
    }
    return name;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getPersistentIdentifier
   * @methodOf person.types:constructor.Person

   * @return {String} persistent identifier
   */
  getPersistentIdentifier: function() { return maybe(this.getIdentifiers()['http://gedcomx.org/Persistent'])[0]; },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getPersonUrl
   * @methodOf person.types:constructor.Person

   * @return {String} Url of the person
   */
  getPersonUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('person')).href); },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getChanges
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Get change history for a person
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_History_resource FamilySearch API Docs}
   *
   *
   * @param {String} pid id of the person or full URL of the person changes endpoint
   * @param {Object=} params `count` is the number of change entries to return, `from` to return changes following this id
   * @return {Object} promise for the {@link changeHistory.functions:getPersonChanges getPersonChanges} response
   */
  getChanges: function(params) {
    var self = this;
    return self.getLinkPromise('change-history').then(function(link) {
      return self.client.getChanges(link.href, params);
    });
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDiscussionRefs
   * @methodOf person.types:constructor.Person

   * @return {Object} promise for the {@link discussions.functions:getPersonDiscussionRefs getPersonDiscussionRefs} response
   */
  getDiscussionRefs: function() {
    return this.client.getPersonDiscussionRefs(this.helpers.removeAccessToken(maybe(this.getLink('discussion-references')).href));
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getMemoryPersonaRefs
   * @methodOf person.types:constructor.Person

   * @return {Object} promise for the {@link memories.functions:getMemoryPersonaRefs getMemoryPersonaRefs} response
   */
  getMemoryPersonaRefs: function() {
    return this.client.getMemoryPersonaRefs(this.helpers.removeAccessToken(maybe(this.getLink('evidence-references')).href));
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getNotes
   * @methodOf person.types:constructor.Person

   * @return {Object} promise for the {@link notes.functions:getNotes getNotes} response
   */
  getNotes: function() {
    return this.client.getNotes(maybe(this.getLink('notes')).href);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getSourceRefs
   * @methodOf person.types:constructor.Person

   * @return {Object} promise for the {@link sources.functions:getSourceRefs getSourceRefs} response
   */
  getSourceRefs: function() {
    return this.client.getSourceRefs(this.getLink('source-references').href);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getSources
   * @methodOf person.types:constructor.Person

   * @return {Object} promise for the {@link sources.functions:getSourcesQuery getSourcesQuery} response
   */
  getSources: function() {
    return this.client.getSourcesQuery(this.getLink('source-descriptions').href);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getSpouses
   * @methodOf person.types:constructor.Person
   *
   * @description
   * Get the relationships to a person's spouses. The response may include child and parents
   * relationships because two people can be the parent of a child without an explicit
   * couple relationship; this method returns those implied relationships.
   * The response includes the following convenience functions:
   *
   * - `getCoupleRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents}
   * relationships for children of the couples
   * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship except children
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Spouses_of_a_Person_resource FamilySearch API Docs}
   *
   *
   * @return {Object} promise for the response
   */
  getSpouses: function() {
    var self = this;
    return self.getLinkPromise('spouses').then(function(link) {
      return self.plumbing.get(link.href);
    }).then(function(response){
      return self.client._personsAndRelationshipsMapper(response);
    });
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getSpouseRelationships
   * @methodOf person.types:constructor.Person
   * @deprecated
   * @description
   * 
   * Get the spouse relationships for a person. Use the `persons` param to also
   * get {@link person.types:constructor.Person Person} objects for the spouses. 
   * Use {@link person.types:constructor.Person#getSpouses getSpouses}
   * method if you also want implied spouse relationships (listed together as 
   * parents in a child and parents relationship but no explicit couple relationship).
   * The response includes the following convenience functions:
   * 
   * - `getCoupleRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships.
   * - `getPerson(id)` - a {@link person.types:constructor.Person Person} for any person id in any
   * couple relationship in the response.
   * 
   * @param {Object=} params if `persons` is set (the value doesn't matter) then the response will include
   * person objects for the spouses in the couple relationships.
   * @return {Object} promise for the response.
   */
  getSpouseRelationships: function(params){
    var self = this;
    return self.getLinkPromise('spouse-relationships').then(function(link){
      return self.plumbing.get(link.href, params, {
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
      return self.client._personsAndRelationshipsMapper(response);
    });
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getParents
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Get the relationships to a person's parents, person objects for the
   * parents, and couple relationships for the parents (when a relationship exists).
   * The response includes the following convenience functions
   *
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
   * - `getCoupleRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships for parents
   * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Parents_of_a_Person_resource FamilySearch API Docs}
   *
   *
   * @return {Object} promise for the response
   */
  getParents: function() {
    var self = this;
    return self.getLinkPromise('parents').then(function(link) {
      return self.plumbing.get(link.href);
    }).then(function(response){
      return self.client._personsAndRelationshipsMapper(response);
    });
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getParentRelationships
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Get the parent relationships for a person. Use the `persons` param to also
   * get {@link person.types:constructor.Person Person} objects for the parents.
   * Use {@link person.types:constructor.Person#getParents getParents} method 
   * if you also want couple relationships for the parents.
   * The response includes the following convenience function:
   * 
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
   * - `getPerson(id)` - a {@link person.types:constructor.Person Person} for any person id in any
   * relationship in the response.
   * 
   * @param {Object=} params if `persons` is set (the value doesn't matter) then the response will include
   * person objects for all parents in the relationships.
   * @return {Object} promise for the response. This is only available when the `persons` parameter is set.
   */
  getParentRelationships: function(params){
    var self = this;
    return self.getLinkPromise('parent-relationships').then(function(link){
      return self.plumbing.get(link.href, params);
    }).then(function(response){
      return self.client._personsAndRelationshipsMapper(response);
    });
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getChildren
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Get the relationships to a person's children
   * The response includes the following convenience functions
   *
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
   * - `getPerson(pid)` - a {@link person.types:constructor.Person Person} for any person id in a relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Children_of_a_Person_resource FamilySearch API Docs}
   *
   *
   * @return {Object} promise for the response
   */
  getChildren: function() {
    var self = this;
    return self.getLinkPromise('children').then(function(link) {
      return self.plumbing.get(link.href);
    }).then(function(response){
      return self.client._personsAndRelationshipsMapper(response);
    });
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getChildRelationships
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Get the child relationships for a person. Use the `persons` param to also
   * get {@link person.types:constructor.Person Person} objects for the children.
   * You may also use {@link person.types:constructor.Person#getChildren getChildren} method 
   * to get {@link person.types:constructor.Person Person} objects for the children.
   * The response includes the following convenience function:
   * 
   * - `getChildAndParentsRelationships()` - an array of {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationships
   * - `getPerson(id)` - a {@link person.types:constructor.Person Person} for any person id in any
   * relationship in the response. This is only available when the `persons` parameter is set.
   * 
   * @param {Object=} params if `persons` is set (the value doesn't matter) then the response will include
   * person objects for all children in the relationships.
   * @return {Object} promise for the response
   */
  getChildRelationships: function(params){
    var self = this;
    return self.getLinkPromise('child-relationships').then(function(link){
      return self.plumbing.get(link.href, params);
    }).then(function(response){
      return self.client._personsAndRelationshipsMapper(response);
    });
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getMatches
   * @methodOf person.types:constructor.Person
   * @return {Object} promise for the {@link searchAndMatch.functions:getPersonMatches getPersonMatches} response
   */
  getMatches: function() {
    var self = this;
    return self.getLinkPromise('matches').then(function(link){
      return self.client.getPersonMatches(link.href);
    });
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getRecordMatches
   * @methodOf person.types:constructor.Person
   * @return {Object} promise for the {@link searchAndMatch.functions:getPersonMatches getPersonMatches} response
   */
  getRecordMatches: function() {
    var self = this;
    return self.getLinkPromise('matches').then(function(link){
      return self.client.getPersonMatches(link.href, {
        collection: 'records'
      });
    });
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getAncestry
   * @methodOf person.types:constructor.Person
   * @param {Object=} params include `generations` to retrieve max 8, `spouse` id to get ancestry of person and spouse,
   * `personDetails` set to true to retrieve full person objects for each ancestor
   * @return {Object} promise for the {@link pedigree.functions:getAncestry getAncestry} response
   */
  getAncestry: function(params) {
    return this.client.getAncestry(this.getId(), params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getDescendancy
   * @methodOf person.types:constructor.Person
   * @param {Object=} params include `generations` to retrieve max 2, `spouse` id to get descendency of person and spouse
   * @return {Object} promise for the {@link pedigree.functions:getDescendancy getDescendancy} response
   */
  getDescendancy: function(params) {
    return this.client.getDescendancy(this.getId(), params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#getPersonPortraitUrl
   * @methodOf person.types:constructor.Person
   * @param {Object=} params `default` URL to redirect to if portrait doesn't exist;
   * `followRedirect` if true, follow the redirect and return the final URL
   * @return {Object} promise for the {@link memories.functions:getPersonPortraitUrl getPersonPortraitUrl} response
   */
  getPersonPortraitUrl: function(params) {
    return this.client.getPersonPortraitUrl(this.getLink('portrait').href, params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#setNames
   * @methodOf person.types:constructor.Person

   * @param {Name[]|Object[]|string[]} values names to set; if an array element is not a Name, it is passed into the Name constructor
   * @param {string=} changeMessage change message to use for deleted names if any
   * @return {Person} this person
   */
  setNames: function(values, changeMessage) {
    if (utils.isArray(this.data.names)) {
      utils.forEach(this.data.names, function(name) {
        this.deleteName(name, changeMessage);
      }, this);
    }
    this.data.names = [];
    utils.forEach(values, function(value) {
      this.addName(value);
    }, this);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#addName
   * @methodOf person.types:constructor.Person

   * @param {Name|Object|string} value name to add; if value is not a Name, it is passed into the Name constructor
   * @return {Person} this person
   */
  addName: function(value) {
    if (!utils.isArray(this.data.names)) {
      this.data.names = [];
    }
    if (!(value instanceof FS.Name)) {
      value = this.client.createName(value);
    }
    this.data.names.push(value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#deleteName
   * @methodOf person.types:constructor.Person

   * @param {Name|string} value name or name id to remove
   * @param {String=} changeMessage change message
   * @return {Person} this person
   */
  deleteName: function(value, changeMessage) {
    if (!(value instanceof FS.Name)) {
      value = utils.find(this.data.names, function(name){
        return name.getId() === value;
      });
    }
    var pos = utils.indexOf(this.data.names, value);
    if (pos >= 0) {
      // add name to deleted map
      if (!this.deletedConclusions) {
        this.deletedConclusions = {};
      }
      this.deletedConclusions[value.getId()] = changeMessage;
      // remove name from array
      this.data.names.splice(pos,1);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#setFacts
   * @methodOf person.types:constructor.Person

   * @param {Fact[]|Object[]} values facts to set; if an array element is not a Fact, it is passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {Person} this person
   */
  setFacts: function(values, changeMessage) {
    if (utils.isArray(this.data.facts)) {
      utils.forEach(this.data.facts, function(fact) {
        this.deleteFact(fact, changeMessage);
      }, this);
    }
    this.data.facts = [];
    utils.forEach(values, function(value) {
      this.addFact(value);
    }, this);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#addFact
   * @methodOf person.types:constructor.Person

   * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
   * @return {Person} this person
   */
  addFact: function(value) {
    if (!utils.isArray(this.data.facts)) {
      this.data.facts = [];
    }
    if (!(value instanceof FS.Fact)) {
      value = this.client.createFact(value);
    }
    this.data.facts.push(value);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#deleteFact
   * @methodOf person.types:constructor.Person

   * @param {Fact|string} value fact or fact id to remove
   * @param {String=} changeMessage change message
   * @return {Person} this person
   */
  deleteFact: function(value, changeMessage) {
    if (!(value instanceof FS.Fact)) {
      value = utils.find(this.data.facts, function(fact){
        return fact.getId() === value;
      });
    }
    var pos = utils.indexOf(this.data.facts, value);
    if (pos >= 0) {
      // add fact to deleted map
      if (!this.deletedConclusions) {
        this.deletedConclusions = {};
      }
      this.deletedConclusions[value.getId()] = changeMessage;
      // remove fact from array
      this.data.facts.splice(pos,1);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#setGender
   * @methodOf person.types:constructor.Person

   * @param {String|Object} gender e.g., http://gedcomx.org/Female
   * @param {String=} changeMessage change message
   * @return {Person} this person
   */
  setGender: function(gender, changeMessage) {
    if (utils.isString(gender)) {
      this.data.gender = this.client.createGender().setType(gender);
    } else {
      this.data.gender = this.client.createGender(gender);
    }
    if (changeMessage) {
      this.data.gender.setAttribution(changeMessage);
    }
    return this;
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#addSource
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Attach a source to this person. This will create a source description (if
   * it doesn't already exist) and a source reference for you.
   * 
   * @param {Object} sourceDescription Data for the source description or a
   * {@link sources.types:constructor.SourceDescription SourceDescription} object.
   * @param {String=} changeMessage change message
   * @param {String[]=} tags an array of tags; e.g., http://gedcomx.org/Name or http://gedcomx.org/Birth
   * @return {Object} promise for the {@link sources.types:constructor.SourceRef#save SourceRef.save()} response
   */
  addSource: function(sourceDescription, changeMessage, tags){
    return this.client._createAndAttachSource(this.getPersonUrl(), sourceDescription, changeMessage, tags);
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#addDiscussion
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Add a discussion to this person. This will create a discussion (if
   * it doesn't already exist) and a discussion reference.
   * 
   * @param {Object} discussion Data for the discussion or a
   * {@link discussions.types:constructor.Discussion Discussion} object.
   * @param {String=} changeMessage change message
   * @return {Object} promise for the {@link discussions.types:constructor.DiscussionRef#save DiscussionRef.save()} response
   */
  addDiscussion: function(discussion, changeMessage){
    var person = this,
        client = this.client;
    
    if(!(discussion instanceof FS.Discussion)){
      discussion = client.createDiscussion(discussion);
    }
    
    // Save the discussion if it hasn't already been saved
    var discussionPromise = new Promise(function(resolve, reject){
      if(discussion.getId()){
        resolve(discussion);
      } else {
        discussion.save().then(function(){
          resolve(discussion);
        }, function(e){
          reject(e);
        });
      }
    });
    
    // Create the discussion ref after the discussion is saved
    return discussionPromise.then(function(discussion){
      var discussionRef = client.createDiscussionRef({
        discussion: discussion
      });
      return discussionRef.save(person.getPersonUrl(), changeMessage);
    });
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#addNote
   * @methodOf person.types:constructor.Person
   * 
   * @description
   * Add a note to this person.
   * 
   * @param {Object} note Data for the note or a
   * {@link notes.types:constructor.Note Note} object.
   * @param {String=} changeMessage change message
   * @return {Object} promise for the {@link notes.types:constructor.Note#save Note.save()} response
   */
  addNote: function(note, changeMessage){
    var client = this.client;
    return this.getLinkPromise('notes').then(function(link){
      return client._addNote(link.href, note, changeMessage);
    });
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#save
   * @methodOf person.types:constructor.Person
   * @description
   * Create a new person (if this person does not have an id) or update the existing person.
   * Multiple HTTP requests may be needed when conslusions are deleted. Therefore
   * the returned promises resolves with an array of responses. After being created,
   * the person's ID and links will be updated from HTTP headers in the response.
   *
   * 
   * {@link https://familysearch.org/developers/docs/api/tree/Create_Person_usecase API Docs}
   *
   * @param {String=} changeMessage default change message to use when name/fact/gender-specific changeMessage is not specified
   * @return {Object} promise that is resolved with an array of responses for all HTTP requests that were made
   */
  save: function(changeMessage) {
    var postData = this.client.createPerson();
    var isChanged = false;
    
    // updating existing person
    if (this.getId()) {
      postData.setId(this.getId()); 
    }

    // if person is new, default a few things
    else {
      // default gender to unknown
      if (!this.data.gender) {
        this.setGender('http://gedcomx.org/Unknown');
      }
      // default name to Unknown if no names
      if (this.getNames().length === 0) {
        this.addName({fullText: 'Unknown', givenName: 'Unknown'});
      }
      // default first name to preferred if no names are preferred
      if (!utils.find(this.getNames(), function(name){ return name.isPreferred(); })) {
        this.getNames()[0].setPreferred(true);
      }
      // default name type to birth name if there is only one name
      if (this.getNames().length === 1 && !this.getNames()[0].type) {
        this.getNames()[0].setType('http://gedcomx.org/BirthName');
      }
      // default living status to false
      if (utils.isUndefined(this.data.living)) {
        this.data.living = false;
      }
    }

    // set global changeMessage
    if (changeMessage) {
      postData.setAttribution(changeMessage);
    }
    
    // if new person, send living status
    if (!this.getId()) {
      postData.data.living = this.data.living;
    }

    // send gender if gender is new or changed
    if (this.data.gender && (!this.data.gender.id || this.data.gender.changed)) {
      postData.data.gender = this.data.gender;
      delete postData.data.gender.changed;
      isChanged = true;
    }

    // send names that are new or updated
    utils.forEach(this.getNames(), function(name) {
      if (!name.getId() || name.changed) {
        // default full text if not set
        if (!name.getFullText()) {
          name.setFullText((spacePrefix(name.getPrefix()) + spacePrefix(name.getGivenName()) +
                             spacePrefix(name.getSurname()) + spacePrefix(name.getSuffix())).trim());
        }
        postData.addName(name);
        isChanged = true;
      }
    });

    // send facts that are new or updated
    utils.forEach(this.getFacts(), function(fact) {
      if (!fact.getId() || fact.changed) {
        postData.addFact(fact);
        isChanged = true;
      }
    });

    var promises = [],
        self = this;

    // post update
    if (isChanged) {
      var urlPromise = postData.getId() ? self.plumbing.getCollectionUrl('FSFT', 'person', {pid: postData.getId()}) : self.plumbing.getCollectionUrl('FSFT', 'persons');
      promises.push(
        urlPromise.then(function(url) {
          return self.plumbing.post(url, { persons: [ postData ] });
        }).then(function(response){
          self.updateFromResponse(response, 'person');
          return response;
        })
      );
    }

    // post deletions
    if (this.getId() && this.deletedConclusions) {
      utils.forEach(this.deletedConclusions, function(value, key) {
        value = value || changeMessage; // default to global change message
        promises.push(self.plumbing.getCollectionUrl('FSFT', 'person', {pid: postData.getId()})
        .then(function(personUrl) {
          // TODO: Conclusions have their url embedded; use that
          return self.plumbing.del(personUrl + '/conclusions/' + key, value ? {'X-Reason': value} : {});
        }));
      });
    }

    // wait for all promises to be fulfilled
    return Promise.all(promises);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#delete
   * @methodOf person.types:constructor.Person

   * @description delete this person - see {@link person.functions:deletePerson deletePerson}
   * @param {string} changeMessage change message
   * @return {Object} promise for the person URL
   */
  delete: function(changeMessage) {
    return this.client.deletePerson(this.getPersonUrl(), changeMessage);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#restore
   * @methodOf person.types:constructor.Person

   *
   * @description
   * Restore a person that was deleted.
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Restore_resource FamilySearch API Docs}
   * 
   *
   * @return {Object} promise for the request
   */
  restore: function() {
    var self = this;
    return self.getLinkPromise('restore').then(function(link){
      return self.plumbing.post(link.href, null, {'Content-Type': 'application/x-fs-v1+json'});
    });
  }
});
