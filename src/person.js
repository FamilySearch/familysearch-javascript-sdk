define([
  'attribution',
  'changeHistory',
  'discussions',
  'globals',
  'helpers',
  'memories',
  'notes',
  'parentsAndChildren',
  'plumbing',
  'sources',
  'spouses'
], function(attribution, changeHistory, discussions, globals, helpers, memories, notes, parentsAndChildren, plumbing, sources, spouses) {
  /**
   * @ngdoc overview
   * @name person
   * @description
   * Functions related to persons
   *
   * {@link https://familysearch.org/developers/docs/api/resources#person FamilySearch API Docs}
   */

  //
  // NOTE I've had to make several things global in this file: Fact, Name, getPerson, and personMapper
  // This is so parentsAndChildren and spouses and memories can access them; otherwise we'd have a circular dependency
  //

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name person.types:constructor.Person
   * @description
   *
   * Person
   */
  var Person = exports.Person = function() {
    this.names = [];
  };

  exports.Person.prototype = {
    constructor: Person,
    /**
     * @ngdoc property
     * @name person.types:constructor.Person#id
     * @propertyOf person.types:constructor.Person
     * @return {String} Id of the person
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Person#living
     * @propertyOf person.types:constructor.Person
     * @return {Boolean} true or false
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Person#display
     * @propertyOf person.types:constructor.Person
     * @return {Object} includes `birthDate`, `birthPlace`, `deathDate`, `deathPlace`, `gender`, `lifespan`, and `name` attributes
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Person#identifers
     * @propertyOf person.types:constructor.Person
     * @return {Object} map of identifers to arrays of values
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Person#gender
     * @propertyOf person.types:constructor.Person
     * @return {Object} gender conclusion with id, type, attribution, and confidence
     */

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getFacts
     * @methodOf person.types:constructor.Person
     * @return {Fact[]} an array of {@link person.types:constructor.Fact Facts}
     */
    $getFacts: function() { return this.facts || []; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBirthDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} birth date
     */
    $getBirthDate: function() { return maybe(this.display).birthDate; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBirthPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} birth place
     */
    $getBirthPlace: function() { return maybe(this.display).birthPlace; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDeathDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} death date
     */
    $getDeathDate: function() { return maybe(this.display).deathDate; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDeathPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} death place
     */
    $getDeathPlace: function() { return maybe(this.display).deathPlace; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getGender
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} gender - Male or Female
     */
    $getGender: function() { return maybe(this.display).gender; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getLifeSpan
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} birth year - death year
     */
    $getLifeSpan: function() { return maybe(this.display).lifespan; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getNames
     * @methodOf person.types:constructor.Person
     * @return {Name[]} an array of {@link person.types:constructor.Name Names}
     */
    $getNames: function() { return this.names || []; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayName
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} display name
     */
    $getDisplayName: function() { return maybe(this.display).name; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getPreferredName
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} preferred {@link person.types:constructor.Name Name}
     */
    $getPreferredName: function() { return helpers.findOrFirst(this.names, {preferred: true}); },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getGivenName
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} preferred given name
     */
    $getGivenName: function() {
      var name = this.$getPreferredName();
      if (name) {
        name = name.$getGivenName();
      }
      return name;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getSurname
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} preferred surname
     */
    $getSurname: function() {
      var name = this.$getPreferredName();
      if (name) {
        name = name.$getSurname();
      }
      return name;
    },

    // TODO add unit tests for the following functions

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getPersistentIdentifier
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} persistent identifier
     */
    $getPersistentIdentifier: function() { return maybe(maybe(this.identifiers)['http://gedcomx.org/Persistent'])[0]; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getChanges
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
     * @return {Object} promise for the {@link changeHistory.functions:getPersonChanges getPersonChanges} response
     */
    $getChanges: function(params) {
      return changeHistory.getPersonChanges(helpers.removeAccessToken(this.links['change-history'].href), params);
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDiscussionRefs
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link discussions.functions:getPersonDiscussionRefs getPersonDiscussionRefs} response
     */
    $getDiscussionRefs: function() {
      return discussions.getPersonDiscussionRefs(helpers.removeAccessToken(this.links['discussion-references'].href));
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getMemoryPersonaRefs
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link memories.functions:getMemoryPersonaRefs getMemoryPersonaRefs} response
     */
    $getMemoryPersonaRefs: function() {
      return memories.getMemoryPersonaRefs(helpers.removeAccessToken(this.links['evidence-references'].href));
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getNoteRefs
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link notes.functions:getPersonNoteRefs getPersonNoteRefs} response
     */
    $getNoteRefs: function() {
      return notes.getPersonNoteRefs(helpers.removeAccessToken(this.links['notes'].href));
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getSourceRefs
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link sources.functions:getPersonSourceRefs getPersonSourceRefs} response
     */
    $getPersonSourceRefs: function() {
      return sources.getPersonSourceRefs(helpers.removeAccessToken(this.links['source-references'].href));
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getRelationshipsToSpouses
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Object=} params set `persons` true to return a person object for each person in the relationships
     * @return {Object} promise for the {@link person.functions:getRelationshipsToSpouses getRelationshipsToSpouses} response
     */
    $getRelationshipsToSpouses: function(params) {
      return exports.getRelationshipsToSpouses(helpers.removeAccessToken(this.links['spouse-relationships'].href), params);
    },

    // TODO add links to ancestry, descendancy, person-with-relationships, child-relationships, parent-relationships, matches, portrait

    /**
     * @ngdoc function
     * @name name person.types:constructor.Person#$addName
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Name|string} name to add
     */
    $addName: function(name) {
      if (!(name instanceof Name)) {
        //noinspection JSValidateTypes
        name = new Name(name);
      }
      this.names.push(name);
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$addMemoryPersonaRef
     * @methodOf person.types:constructor.Person
     * @function
     * @param {MemoryPersonaRef} memoryPersonaRef reference to the memory persona
     * @param {Object=} params `changeMessage` change message
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the persona URL
     */
    $addMemoryPersonaRef: function(memoryPersonaRef, params, opts) {
      return memories.addMemoryPersona(this.id, memoryPersonaRef, params, opts);
    }
  };

  /**
   * @ngdoc function
   * @name person.types:constructor.Name
   * @description
   *
   * Name
   */
  var Name = globals.Name = exports.Name = function(name) {  // put on globals so memories can access it
    this.nameForms = [];
    if (name) {
      this.nameForms.push({
        fullText: name
      });
    }
  };

  exports.Name.prototype = {
    constructor: Name,
    /**
     * @ngdoc property
     * @name person.types:constructor.Name#id
     * @propertyOf person.types:constructor.Name
     * @return {String} Id of the name
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Name#type
     * @propertyOf person.types:constructor.Name
     * @return {String} http://gedcomx.org/BirthName, etc.
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Name#preferred
     * @propertyOf person.types:constructor.Name
     * @return {Boolean} true if this name is preferred
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Name#attribution
     * @propertyOf person.types:constructor.Name
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc function
     * @name person.types:constructor.Name#$getNameFormsCount
     * @methodOf person.types:constructor.Name
     * @function
     * @return {Number} get the number of name forms
     */
    $getNameFormsCount: function() { return this.nameForms ? this.nameForms.length : 0; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Name#$getFullText
     * @methodOf person.types:constructor.Name
     * @function
     * @param {Number=} i i'th name form to read
     * @return {String} get the full text of the `i`'th name form; if `i` is omitted; get the first
     */
    $getFullText: function(i) { return maybe(maybe(this.nameForms)[i || 0]).fullText; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Name#$getGivenName
     * @methodOf person.types:constructor.Name
     * @function
     * @param {Number=} i i'th name form to read
     * @return {String} get the given part of the `i`'th name form; if `i` is omitted; get the first
     */
    $getGivenName: function(i) { return maybe(helpers.find(
      maybe(maybe(this.nameForms)[i || 0]).parts,
      {type: 'http://gedcomx.org/Given'}
    )).value; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Name#$getSurname
     * @methodOf person.types:constructor.Name
     * @function
     * @param {Number=} i i'th name form to read
     * @return {String} get the surname part of the `i`'th name form; if `i` is omitted; get the first
     */
    $getSurname:        function(i) { return maybe(helpers.find(
      maybe(maybe(this.nameForms)[i || 0]).parts,
      {type: 'http://gedcomx.org/Surname'}
    )).value; }
  };

  /**
   * @ngdoc function
   * @name person.types:constructor.Fact
   * @description
   *
   * Fact
   */
  var Fact = globals.Fact = exports.Fact = function() {  // put on globals so parentsAndChildren and spouses can access it

  };

  exports.Fact.prototype = {
    constructor: Fact,
    /**
     * @ngdoc property
     * @name person.types:constructor.Fact#id
     * @propertyOf person.types:constructor.Fact
     * @return {String} Id of the name
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Fact#type
     * @propertyOf person.types:constructor.Fact
     * @return {String} http://gedcomx.org/Birth, etc.
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Fact#attribution
     * @propertyOf person.types:constructor.Fact
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc function
     * @name person.types:constructor.Fact#$getDate
     * @methodOf person.types:constructor.Fact
     * @function
     * @return {String} original date
     */
    $getDate: function() { return maybe(this.date).original; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Fact#$getFormalDate
     * @methodOf person.types:constructor.Fact
     * @function
     * @return {String} standard form; e.g., +1836-04-13
     */
    $getFormalDate: function() { return maybe(this.date).formal; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Fact#$getPlace
     * @methodOf person.types:constructor.Fact
     * @function
     * @return {String} event place
     */
    $getPlace: function() { return maybe(this.place).original; }
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
   * - `getPerson()` - get the {@link person.types:constructor.Person Person} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/cST4L/ editable example}
   *
   * @param {String} pid id or full URL of the person
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  globals.getPerson = exports.getPerson = function(pid, params, opts) { // put on globals so parentsAndChildren and spouses can access it
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getPerson: function() { return this.persons[0]; }}),
            exports.personMapper()
          ));
      });
  };

  /**
   * Return a function that maps a response into a response with Person, Name, and Fact objects
   * @param {Function=} subObjectGenerator generate sub-objects corresponding to parents of persons; used by search/match functions
   * @returns {Function}
   */
  globals.personMapper = exports.personMapper = function(subObjectGenerator) { // put on globals so parentsAndChildren and spouses can access it
    var personsGenerator = function(response) {
      return helpers.flatMap(subObjectGenerator ? subObjectGenerator(response) : [response], function(root) {
        return root.persons;
      });
    };
    return helpers.compose(
      helpers.constructorSetter(Person, 'persons', subObjectGenerator),
      helpers.constructorSetter(Name, 'names', personsGenerator),
      helpers.constructorSetter(Fact, 'facts', personsGenerator),
      helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
        return helpers.flatMap(personsGenerator(response), function(person) {
          return helpers.union(
            person.names || [],
            person.facts || [],
            person.gender ? [person.gender] : []
          );
        });
      })
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
   * {@link http://jsfiddle.net/DallanQ/5Npsh/ editable example}
   *
   * @param {String} pid id of the person
   * @param {Object=} params set `persons` to true to retrieve full person objects for each relative
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person with relationships
   */
  exports.getPersonWithRelationships = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-with-relationships-query'),
      function(url) {
        return plumbing.get(url, helpers.extend({'person': pid}, params), {}, opts,
          helpers.compose(
            helpers.objectExtender({getPrimaryId: function() { return pid; }}), // make id available
            helpers.constructorSetter(Fact, 'fatherFacts', function(response) {
              return maybe(response).childAndParentsRelationships;
            }),
            helpers.constructorSetter(Fact, 'motherFacts', function(response) {
              return maybe(response).childAndParentsRelationships;
            }),
            helpers.constructorSetter(Fact, 'facts', function(response) {
              return maybe(response).relationships;
            }),
            helpers.constructorSetter(parentsAndChildren.ChildAndParents, 'childAndParentsRelationships'),
            helpers.constructorSetter(spouses.Couple, 'relationships'), // some of the relationships are ParentChild relationships, but
            // we don't have a way to change the constructor on only some elements of the array
            helpers.objectExtender(personWithRelationshipsConvenienceFunctions),
            exports.personMapper()
          ));
      });
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
    getSpouseRelationship:  function(spouseId) {
      var primaryId = this.getPrimaryId();
      return helpers.find(this.relationships, function(r) {
        return r.type === 'http://gedcomx.org/Couple' &&
          (primaryId === r.$getHusbandId() ? r.$getWifeId() : r.$getHusbandId()) === spouseId;
      });
    },
    getChildRelationships: function() {
      var primaryId = this.getPrimaryId();
      return helpers.filter(this.childAndParentsRelationships, function(r) {
        return maybe(r.father).resourceId === primaryId || maybe(r.mother).resourceId === primaryId;
      });
    },
    getChildRelationshipsOf: function(spouseId) {
      var primaryId = this.getPrimaryId();
      return helpers.filter(this.childAndParentsRelationships, function(r) {
        /*jshint eqeqeq:false */
        return (maybe(r.father).resourceId === primaryId || maybe(r.mother).resourceId === primaryId) &&
          (maybe(r.father).resourceId == spouseId || maybe(r.mother).resourceId == spouseId); // allow spouseId to be null or undefined
      });
    },
    getFatherIds:  function() {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getParentRelationships(), function(r) {
          return !!r.$getFatherId();
        }),
        function(r) {
          return r.$getFatherId();
        }, this));
    },
    getFathers:    function() { return helpers.map(this.getFatherIds(), this.getPerson, this); },
    getMotherIds:  function() {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getParentRelationships(), function(r) {
          return !!r.$getMotherId();
        }),
        function(r) {
          return r.$getMotherId();
        }, this));
    },
    getMothers:    function() { return helpers.map(this.getMotherIds(), this.getPerson, this); },
    getSpouseIds:  function() {
      return helpers.uniq(helpers.map(
        helpers.filter(this.getSpouseRelationships(), function(r) {
          return r.$getHusbandId() && r.$getWifeId(); // only consider couple relationships with both spouses
        }),
        function(r) {
          return this.getPrimaryId() === r.$getHusbandId() ? r.$getWifeId() : r.$getHusbandId();
        }, this));
    },
    getSpouses:    function() { return helpers.map(this.getSpouseIds(), this.getPerson, this); },
    getChildIds:   function() {
      return helpers.uniq(helpers.map(this.getChildRelationships(),
        function(r) {
          return r.$getChildId();
        }, this));
    },
    getChildren:   function() { return helpers.map(this.getChildIds(), this.getPerson, this); },
    getChildIdsOf:   function(spouseId) {
      return helpers.uniq(helpers.map(this.getChildRelationshipsOf(spouseId),
        function(r) {
          return r.$getChildId();
        }, this));
    },
    getChildrenOf:   function(spouseId) { return helpers.map(this.getChildIdsOf(spouseId), this.getPerson, this); }
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
   * **NOTE The sandbox REST endpoint for this function is broken. Do not use.**
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_Summary_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ga37h/ editable example}
   *
   * @param {String} pid id of the person or full URL of the person-change-summary endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  // TODO check if this has been fixed
  exports.getPersonChangeSummary = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-change-summary-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
          helpers.objectExtender({getChanges: function() { return this.entries || []; }}));
      });
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
   * - `getRelationships()` - an array of {@link spouses.types:constructor.Couple Couple} relationships
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:constructor.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Relationships_to_Spouses_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/7zLEJ/ editable example}
   *
   * @param {String} pid id of the person or full URL of the spouse-relationships endpoint
   * @param {Object=} params set `persons` true to return a person object for each person in the relationships,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getRelationshipsToSpouses = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('spouse-relationships-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getPrimaryId: function() { return pid; }}), // make id available to convenience functions
            helpers.constructorSetter(spouses.Couple, 'relationships'),
            helpers.objectExtender(relationshipsToSpousesConvenienceFunctions),
            helpers.constructorSetter(Fact, 'facts', function(response) {
              return maybe(response).relationships;
            }),
            exports.personMapper()
          ));
      });
  };

  var relationshipsToSpousesConvenienceFunctions = {
    getRelationships: function() { return this.relationships || []; },
    getSpouseIds:  function() {
      var primaryId = this.getPrimaryId();
      return helpers.uniq(helpers.map(this.getRelationships(), function(r) {
        return r.$getHusbandId() === primaryId ? r.$getWifeId() : r.$getHusbandId();
      }, this));
    },
    getPerson:    function(id) { return helpers.find(this.persons, {id: id}); }
  };

  // TODO getPersonMerge
  // TODO getPersonNotAMatch
  // TODO getPreferredSpouse
  // TODO getPreferredParent
  // TODO new Parents endpoint
  // TODO new Children endpoint
  // TODO new Spouses endpoint
  // TODO use X-FS-Feature-Tag: parent-child-relationship-resources-consolidation on parents and children endpoints

  return exports;
});
