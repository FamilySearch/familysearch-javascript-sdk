define([
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name person
   * @description
   * Functions related to persons
   *
   * {@link https://familysearch.org/developers/docs/api/resources#person FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name person.types:type.Person
   * @description
   *
   * Person
   */
  var Person = exports.Person = function() {

  };

  exports.Person.prototype = {
    constructor: Person,
    /**
     * @ngdoc property
     * @name person.types:type.Person#id
     * @propertyOf person.types:type.Person
     * @return {String} Id of the person
     */

    /**
     * @ngdoc property
     * @name person.types:type.Person#living
     * @propertyOf person.types:type.Person
     * @return {Boolean} true or false
     */

    /**
     * @ngdoc property
     * @name person.types:type.Person#display
     * @propertyOf person.types:type.Person
     * @return {Object} includes `birthDate`, `birthPlace`, `deathDate`, `deathPlace`, `gender`, `lifespan`, and `name` attributes
     */

    /**
     * @ngdoc function
     * @name person.types:type.Person#getNames
     * @methodOf person.types:type.Person
     * @return {Name[]} an array of {@link person.types:type.Name Names}
     */
    getNames: function() { return this.names || []; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getFacts
     * @methodOf person.types:type.Person
     * @return {Fact[]} an array of {@link person.types:type.Fact Facts}
     */
    getFacts: function() { return this.facts || []; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getBirthDate
     * @methodOf person.types:type.Person
     * @function
     * @return {String} birth date
     */
    getBirthDate: function() { return maybe(this.display).birthDate; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getBirthPlace
     * @methodOf person.types:type.Person
     * @function
     * @return {String} birth place
     */
    getBirthPlace: function() { return maybe(this.display).birthPlace; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getDeathDate
     * @methodOf person.types:type.Person
     * @function
     * @return {String} death date
     */
    getDeathDate: function() { return maybe(this.display).deathDate; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getDeathPlace
     * @methodOf person.types:type.Person
     * @function
     * @return {String} death place
     */
    getDeathPlace: function() { return maybe(this.display).deathPlace; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getGender
     * @methodOf person.types:type.Person
     * @function
     * @return {String} gender - Male or Female
     */
    getGender: function() { return maybe(this.display).gender; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getLifeSpan
     * @methodOf person.types:type.Person
     * @function
     * @return {String} birth year - death year
     */
    getLifeSpan: function() { return maybe(this.display).lifespan; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getName
     * @methodOf person.types:type.Person
     * @function
     * @return {String} display name
     */
    getName: function() { return maybe(this.display).name; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getGivenName
     * @methodOf person.types:type.Person
     * @function
     * @return {String} preferred given name
     */
    getGivenName: function() { return maybe(helpers.find(
      maybe(maybe(maybe(helpers.findOrFirst(this.names, {preferred: true})).nameForms)[0]).parts,
      {type: 'http://gedcomx.org/Given'}
    )).value; },

    /**
     * @ngdoc function
     * @name person.types:type.Person#getSurname
     * @methodOf person.types:type.Person
     * @function
     * @return {String} preferred surname
     */
    getSurname: function() { return maybe(helpers.find(
      maybe(maybe(maybe(helpers.findOrFirst(this.names, {preferred: true})).nameForms)[0]).parts,
      {type: 'http://gedcomx.org/Surname'}
    )).value; }
  };

  /**
   * @ngdoc function
   * @name person.types:type.Name
   * @description
   *
   * Name
   */
  var Name = exports.Name = function() {

  };

  exports.Name.prototype = {
    constructor: Name,
    /**
     * @ngdoc property
     * @name person.types:type.Name#id
     * @propertyOf person.types:type.Name
     * @return {String} Id of the name
     */

    /**
     * @ngdoc property
     * @name person.types:type.Name#type
     * @propertyOf person.types:type.Name
     * @return {String} http://gedcomx.org/BirthName, etc.
     */

    /**
     * @ngdoc property
     * @name person.types:type.Name#preferred
     * @propertyOf person.types:type.Name
     * @return {Boolean} true if this name is preferred
     */

    /**
     * @ngdoc function
     * @name person.types:type.Name#getContributorId
     * @methodOf person.types:type.Name
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(maybe(this.attribution).contributor).resourceId; },

    /**
     * @ngdoc function
     * @name sources.types:type.SourceRef#getModified
     * @methodOf sources.types:type.SourceRef
     * @function
     * @return {Number} last modified timestamp
     */
    getModified: function() { return maybe(this.attribution).modified; },

    /**
     * @ngdoc function
     * @name person.types:type.Name#getNameFormsCount
     * @methodOf person.types:type.Name
     * @function
     * @return {Number} get the number of name forms
     */
    getNameFormsCount: function() { return this.nameForms ? this.nameForms.length : 0; },

    /**
     * @ngdoc function
     * @name person.types:type.Name#getFullText
     * @methodOf person.types:type.Name
     * @function
     * @param {Number=} i i'th name form to read
     * @return {String} get the full text of the `i`'th name form; if `i` is omitted; get the first
     */
    getFullText: function(i) { return maybe(maybe(this.nameForms)[i || 0]).fullText; },

    /**
     * @ngdoc function
     * @name person.types:type.Name#getGivenName
     * @methodOf person.types:type.Name
     * @function
     * @param {Number=} i i'th name form to read
     * @return {String} get the given part of the `i`'th name form; if `i` is omitted; get the first
     */
    getGivenName: function(i) { return maybe(helpers.find(
      maybe(maybe(this.nameForms)[i || 0]).parts,
      {type: 'http://gedcomx.org/Given'}
    )).value; },

    /**
     * @ngdoc function
     * @name person.types:type.Name#getSurname
     * @methodOf person.types:type.Name
     * @function
     * @param {Number=} i i'th name form to read
     * @return {String} get the surname part of the `i`'th name form; if `i` is omitted; get the first
     */
    getSurname:        function(i) { return maybe(helpers.find(
      maybe(maybe(this.nameForms)[i || 0]).parts,
      {type: 'http://gedcomx.org/Surname'}
    )).value; }
  };

  /**
   * @ngdoc function
   * @name person.types:type.Fact
   * @description
   *
   * Fact
   */
  var Fact = exports.Fact = function() {

  };

  exports.Fact.prototype = {
    constructor: Fact,
    /**
     * @ngdoc property
     * @name person.types:type.Fact#id
     * @propertyOf person.types:type.Fact
     * @return {String} Id of the name
     */

    /**
     * @ngdoc property
     * @name person.types:type.Fact#type
     * @propertyOf person.types:type.Fact
     * @return {String} http://gedcomx.org/Birth, etc.
     */

    /**
     * @ngdoc function
     * @name person.types:type.Fact#getContributorId
     * @methodOf person.types:type.Fact
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(maybe(this.attribution).contributor).resourceId; },

    /**
     * @ngdoc function
     * @name sources.types:type.SourceRef#getModified
     * @methodOf sources.types:type.SourceRef
     * @function
     * @return {Number} last modified timestamp
     */
    getModified: function() { return maybe(this.attribution).modified; },

    /**
     * @ngdoc function
     * @name person.types:type.Fact#getDate
     * @methodOf person.types:type.Fact
     * @function
     * @return {String} original date
     */
    getDate: function() { return maybe(this.date).original; },

    /**
     * @ngdoc function
     * @name person.types:type.Fact#getFormalDate
     * @methodOf person.types:type.Fact
     * @function
     * @return {String} standard form; e.g., +1836-04-13
     */
    getFormalDate: function() { return maybe(this.date).formal; },

    /**
     * @ngdoc function
     * @name person.types:type.Fact#getPlace
     * @methodOf person.types:type.Fact
     * @function
     * @return {String} event place
     */
    getPlace: function() { return maybe(this.place).original; }
  };

  /**
   * @ngdoc function
   * @name person.functions:getPerson
   * @function
   *
   * @description
   * Get the specified person
   * The response includes the following convenience function
   *
   * - `getPerson()` - get the {@link person.types:type.Person Person} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/cST4L/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPerson = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid), params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getPerson: function() { return this.persons[0]; }}),
        exports.personMapper()
      ));
  };

  /**
   * Return a function that maps a response into a response with Person, Name, and Fact objects
   * @param {Function=} subObjectGenerator generate sub-objects corresponding to parents of persons; used by search/match functions
   * @returns {Function}
   */
  exports.personMapper = function(subObjectGenerator) {
    var personsGenerator = function(response) {
      return helpers.flatMap(subObjectGenerator ? subObjectGenerator(response) : [response], function(root) {
        return root.persons;
      });
    };
    return helpers.compose(
      helpers.constructorSetter(Person, 'persons', subObjectGenerator),
      helpers.constructorSetter(Name, 'names', personsGenerator),
      helpers.constructorSetter(Fact, 'facts', personsGenerator)
    );
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
   * {@link http://jsfiddle.net/DallanQ/TF6Lg/ editable example}
   *
   * @param {Array} pids of the people to read
   * @param {Object=} params to pass to getPerson currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the people have been read, returning a map of person id to response
   */
  exports.getMultiPerson = function(pids, params, opts) {
    var promises = {};
    helpers.forEach(pids, function(pid) {
      promises[pid] = exports.getPerson(pid, params, opts);
    });
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name person.types:type.ChildAndParents
   * @description
   *
   * Child and parents relationship *(not to be confused with the ParentChild relationship; in general, ChildAndParents is more useful)*
   */
  var ChildAndParents = exports.ChildAndParents = function() {

  };

  exports.ChildAndParents.prototype = {
    constructor: ChildAndParents,
    /**
     * @ngdoc property
     * @name person.types:type.ChildAndParents#id
     * @propertyOf person.types:type.ChildAndParents
     * @return {String} Id of the relationship
     */

    /**
     * @ngdoc function
     * @name person.types:type.ChildAndParents#getFatherFacts
     * @methodOf person.types:type.ChildAndParents
     * @return {Fact[]} array of {@link person.types:type.Fact Facts}; e.g., parent-relationship type
     */
    getFatherFacts: function() { return this.fatherFacts || []; },

    /**
     * @ngdoc function
     * @name person.types:type.ChildAndParents#getMotherFacts
     * @methodOf person.types:type.ChildAndParents
     * @return {Fact[]} array of {@link person.types:type.Fact Facts}; e.g., parent-relationship type
     */
    getMotherFacts: function() { return this.motherFacts || []; },

    /**
     * @ngdoc function
     * @name person.types:type.ChildAndParents#getFatherId
     * @methodOf person.types:type.ChildAndParents
     * @function
     * @return {String} Id of the father
     */
    getFatherId: function() { return maybe(this.father).resourceId; },

    /**
     * @ngdoc function
     * @name person.types:type.ChildAndParents#getMotherId
     * @methodOf person.types:type.ChildAndParents
     * @function
     * @return {String} Id of the mother
     */
    getMotherId: function() { return maybe(this.mother).resourceId; },

    /**
     * @ngdoc function
     * @name person.types:type.ChildAndParents#getChildId
     * @methodOf person.types:type.ChildAndParents
     * @function
     * @return {String} Id of the child
     */
    getChildId: function() { return maybe(this.child).resourceId; }
  };

  /**
   * @ngdoc function
   * @name person.types:type.Couple
   * @description
   *
   * Couple relationship
   */
  var Couple = exports.Couple = function() {

  };

  exports.Couple.prototype = {
    constructor: Couple,
    /**
     * @ngdoc property
     * @name person.types:type.Couple#id
     * @propertyOf person.types:type.Couple
     * @return {String} Id of the relationship
     */

    /**
     * @ngdoc function
     * @name person.types:type.Couple#getFacts
     * @methodOf person.types:type.Couple
     * @return {Fact[]} array of {@link person.types:type.Fact Facts}; e.g., marriage
     */
    getFacts: function() { return this.facts || []; },

    /**
     * @ngdoc function
     * @name person.types:type.Couple#getHusbandId
     * @methodOf person.types:type.Couple
     * @function
     * @return {String} Id of the husband
     */
    getHusbandId: function() { return maybe(this.person1).resourceId; },

    /**
     * @ngdoc function
     * @name person.types:type.Couple#getWifeId
     * @methodOf person.types:type.Couple
     * @function
     * @return {String} Id of the wife
     */
    getWifeId: function() { return maybe(this.person2).resourceId; }
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
   * - `getChildIds(spouseId)` - array of ids; if `spouseId` is specified, returns only ids of children with spouse as the other parent
   * - `getParentRelationships()` - array of {@link person.types:type.ChildAndParents ChildAndParents} relationship objects
   * - `getSpouseRelationships()` - array of {@link person.types:type.Couple Couple} relationship objects
   * - `getChildRelationships()` - array of {@link person.types:type.ChildAndParents ChildAndParents} relationship objects
   * - `getPrimaryPerson()` - {@link person.types:type.Person Person} object for the primary person
   *
   * In addition, the following functions are available if persons is set to true in params
   *
   * - `getPerson(id)` - {@link person.types:type.Person Person} object for the person with `id`
   * - `getFathers()` - array of father {@link person.types:type.Person Persons}
   * - `getMothers()` - array of mother {@link person.types:type.Person Persons}
   * - `getSpouses()` - array of spouse {@link person.types:type.Person Persons}
   * - `getChildren(spouseId)` - array of child {@link person.types:type.Person Persons};
   * if `spouseId` is specified returns only children with spouse as the other parent
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_With_Relationships_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/5Npsh/ editable example}
   *
   * @param {String} pid person to read
   * @param {Object=} params set `persons` to true to retrieve full person objects for each relative
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person with relationships
   */
  exports.getPersonWithRelationships = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons-with-relationships', helpers.extend({'person': pid}, params), {}, opts,
      helpers.compose(
        helpers.objectExtender({getPrimaryId: function() { return pid; }}), // make id available
        helpers.constructorSetter(Fact, 'fatherFacts', function(response) {
          return response.childAndParentsRelationships;
        }),
        helpers.constructorSetter(Fact, 'motherFacts', function(response) {
          return response.childAndParentsRelationships;
        }),
        helpers.constructorSetter(Fact, 'facts', function(response) {
          return response.relationships;
        }),
        helpers.constructorSetter(ChildAndParents, 'childAndParentsRelationships'),
        helpers.constructorSetter(Couple, 'relationships'), // some of the relationships are ParentChild relationships, but
                                                            // we don't have a way to change the constructor on only some elements of the array
        helpers.objectExtender(personWithRelationshipsConvenienceFunctions),
        exports.personMapper()
      ));
  };

  // Functions to extract various pieces of the response
  // TODO how identify preferred parents?
  var personWithRelationshipsConvenienceFunctions = {
    getPerson:     function(id) { return helpers.find(this.persons, {id: id}); },
    getPrimaryPerson: function() { return this.getPerson(this.getPrimaryId()); },
    getParentRelationships: function() {
      var primaryId = this.getPrimaryId();
      return helpers.filter(this.childAndParentsRelationships, function(r) {
        return maybe(r.child).resourceId === primaryId;
      });
    },
    getSpouseRelationships:  function() {
      return helpers.filter(this.relationships, function(r) {
        return r.type === 'http://gedcomx.org/Couple';
      });
    },
    getChildRelationships: function() {
      var primaryId = this.getPrimaryId();
      return helpers.filter(this.childAndParentsRelationships, function(r) {
        return maybe(r.father).resourceId === primaryId || maybe(r.mother).resourceId === primaryId;
      });
    },
    getFatherIds:  function() {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getParentRelationships(), function(r) {
          return !!r.getFatherId();
        }),
        function(r) {
          return r.getFatherId();
        }, this));
    },
    getFathers:    function() { return helpers.map(this.getFatherIds(), this.getPerson, this); },
    getMotherIds:  function() {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getParentRelationships(), function(r) {
          return !!r.getMotherId();
        }),
        function(r) {
          return r.getMotherId();
        }, this));
    },
    getMothers:    function() { return helpers.map(this.getMotherIds(), this.getPerson, this); },
    getSpouseIds:  function() {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getSpouseRelationships(), function(r) {
          return r.getHusbandId() && r.getWifeId(); // only consider couple relationships with both spouses
        }),
        function(r) {
          return this.getPrimaryId() === r.getHusbandId() ? r.getWifeId() : r.getHusbandId();
        }, this));
    },
    getSpouses:    function() { return helpers.map(this.getSpouseIds(), this.getPerson, this); },
    getChildIds:   function(spouseId) {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getChildRelationships(), function(r) {
          return !!r.getChildId() &&
            (!spouseId || r.getFatherId() === spouseId || r.getMotherId() === spouseId);
        }),
        function(r) {
          return r.getChildId();
        }, this));
    },
    getChildren:   function(spouseId) { return helpers.map(this.getChildIds(spouseId), this.getPerson, this); }
  };

  /**
   * @ngdoc function
   * @name person.functions:getPersonChangeSummary
   * @function
   *
   * @description
   * Get the change summary for a person. For detailed change information see functions in the changeHistory module
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of changes from the response; each change has an `id`, `published` timestamp, `title`, and `updated` timestamp
   *
   * *NOTE* The sandbox REST endpoint for this function is broken so I have been unable to test it. Do not use.
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_Summary_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ga37h/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonChangeSummary = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/change-summary', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      helpers.objectExtender({getChanges: function() { return this.entries || []; }}));
  };

  /**
   * @ngdoc function
   * @name person.functions:getRelationshipsToSpouses
   * @function
   *
   * @description
   * Get the relationships to a person's spouses.
   * The response includes the following convenience functions
   *
   * - `getSpouseIds()` - an array of string ids
   * - `getRelationships()` - an array of {@link person.types:type.Couple Couple} relationships
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:type.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Relationships_to_Spouses_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/7zLEJ/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationships,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getRelationshipsToSpouses = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/spouse-relationships', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getPrimaryId: function() { return pid; }}), // make id available to convenience functions
        helpers.constructorSetter(Couple, 'relationships'),
        helpers.objectExtender(relationshipsToSpousesConvenienceFunctions),
        helpers.constructorSetter(Fact, 'facts', function(response) {
          return response.relationships;
        }),
        exports.personMapper()
      ));
  };

  var relationshipsToSpousesConvenienceFunctions = {
    getRelationships: function() { return this.relationships || []; },
    getSpouseIds:  function() {
      var primaryId = this.getPrimaryId();
      return helpers.uniq(helpers.map(this.getRelationships(), function(r) {
        return r.getHusbandId() === primaryId ? r.getWifeId() : r.getHusbandId();
      }, this));
    },
    getPerson:    function(id) { return helpers.find(this.persons, {id: id}); }
  };

  /**
   * @ngdoc function
   * @name person.functions:getRelationshipsToParents
   * @function
   *
   * @description
   * Get the relationships to a person's parents.
   * The response includes the following convenience function
   *
   * - `getRelationships()` - an array of { `id` - relationship id, `fatherId`, `motherId` }
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:type.Person Person} for a person id in the relationship
   *
   * Pass the relationship id into {@link parentsAndChildren.functions:getChildAndParents getChildAndParents} for more information
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Relationships_to_Parents_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ajxpq/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationships,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getRelationshipsToParents = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/parent-relationships', params, {}, opts,
      helpers.compose(
        // TODO consider adding convenience functions to expose the couple relationship for the parents
        helpers.objectExtender(relationshipsToParentsConvenienceFunctions),
        exports.personMapper()
      ));
  };

  var CHILD_AND_PARENTS_RELATIONSHIP = 'http://familysearch.org/v1/ChildAndParentsRelationship';

  var relationshipsToParentsConvenienceFunctions = {
    getRelationships: function() {
      return helpers.map( // map them to the { id, fatherId, motherId } result objects
        helpers.uniq( // remove duplicates
          helpers.map( // map them to the relationship identifier
            helpers.filter(this.relationships, function(relationship) { // get only the parent-child relationships
              return relationship.type === 'http://gedcomx.org/ParentChild' &&
                !!maybe(relationship.identifiers)[CHILD_AND_PARENTS_RELATIONSHIP];
            }),
            function(relationship) {
              return relationship.identifiers[CHILD_AND_PARENTS_RELATIONSHIP];
            }, this)
        ),
        function(relIdent) {
          return {
            id: relIdent.replace(/^.*\//, '').replace(/\?.*$/, ''), // TODO how else to get the relationship id?
            fatherId: maybe(maybe(helpers.find(this.relationships, function(relationship) { // find this relationship with father link
              return maybe(relationship.identifiers)[CHILD_AND_PARENTS_RELATIONSHIP] === relIdent &&
                !!maybe(relationship.links).father;
            })).person1).resourceId, // and return person1's resource id
            motherId: maybe(maybe(helpers.find(this.relationships, function(relationship) { // find this relationship with mother link
              return maybe(relationship.identifiers)[CHILD_AND_PARENTS_RELATIONSHIP] === relIdent &&
                !!maybe(relationship.links).mother;
            })).person1).resourceId // and return person1's resource id
          };
        }, this);
    },
    getPerson: function(id) { return helpers.find(this.persons, {id: id}); }
  };

  /**
   * @ngdoc function
   * @name person.types:type.ParentChild
   * @description
   *
   * ParentChild relationship *(not to be confused with the ChildAndParents relationship; in general, ChildAndParents is more useful)*
   */
  var ParentChild = exports.ParentChild = function() {

  };

  exports.ParentChild.prototype = {
    constructor: ParentChild,
    /**
     * @ngdoc property
     * @name person.types:type.ParentChild#id
     * @propertyOf person.types:type.ParentChild
     * @return {String} Id of the parent-child relationship
     */

    /**
     * @ngdoc function
     * @name person.types:type.ParentChild#getChildAndParentsId
     * @methodOf person.types:type.ParentChild
     * @function
     * @return {String} Id of the child and parents relationship
     */
    getChildAndParentsId: function() {
      var url = maybe(this.identifiers)[CHILD_AND_PARENTS_RELATIONSHIP];
      return url ? url.replace(/^.*\//, '').replace(/\?.*$/, '') : url; // TODO how else to get the relationship id?
    },

    /**
     * @ngdoc function
     * @name person.types:type.ParentChild#getChildId
     * @methodOf person.types:type.ParentChild
     * @function
     * @return {String} Id of the child
     */
    getChildId: function() { return maybe(this.person2).resourceId; }
  };

  /**
   * @ngdoc function
   * @name person.functions:getRelationshipsToChildren
   * @function
   *
   * @description
   * Get the relationships to a person's children.
   * The response includes the following convenience functions
   *
   * - `getChildIds()` - an array of string ids
   * - `getRelationships()` - an array of {@link person.types:type.ParentChild ParentChild} relationships
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:type.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Relationships_to_Children_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/mUUEK/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params set `persons` true to return a person object for each person in the relationships,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getRelationshipsToChildren = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/child-relationships', params, {}, opts,
      helpers.compose(
        helpers.objectExtender(relationshipsToChildrenConvenienceFunctions),
        helpers.constructorSetter(ParentChild, 'relationships'),
        exports.personMapper()
      ));
  };

  var relationshipsToChildrenConvenienceFunctions = {
    getRelationships: function() { return this.relationships || []; },
    getChildIds:  function() {
      return helpers.uniq(helpers.map(this.getRelationships(), function(r) {
        return r.getChildId();
      }, this));
    },
    getPerson:    function(id) { return helpers.find(this.persons, {id: id}); }
  };

  // TODO getPersonMerge
  // TODO getPersonNotAMatch
  // TODO getPreferredSpouse
  // TODO getPreferredParent

  return exports;
});
