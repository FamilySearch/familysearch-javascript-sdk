define([
  'attribution',
  'changeHistory',
  'discussions',
  'fact',
  'globals',
  'helpers',
  'memories',
  'name',
  'notes',
  'parentsAndChildren',
  'plumbing',
  'sources',
  'spouses',
  'user'
], function(attribution, changeHistory, discussions, fact, globals, helpers, memories, name, notes, parentsAndChildren, plumbing, sources, spouses, user) {
  /**
   * @ngdoc overview
   * @name person
   * @description
   * Functions related to persons
   *
   * {@link https://familysearch.org/developers/docs/api/resources#person FamilySearch API Docs}
   */

  //
  // NOTE I've had to make a few things global in this file: Person, getPerson, and personMapper
  // This is so parentsAndChildren and spouses and memories can access them; otherwise we'd have circular dependencies
  //

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  // TODO see if upgrading to grunt-ngdocs 0.2.1 will allow links to _methods_ like $save and $delete

  /**********************************/
  /**
   * @ngdoc function
   * @name person.types:constructor.Person
   * @description
   *
   * Person
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
   *
   * Two methods to note below are _$save_ and _$delete_.
   * _$save_ persists the changes made to names, facts, and gender;
   * _$delete_ removes the person.
   **********************************/

  var Person = globals.Person = exports.Person = function() {
  };

  function spacePrefix(namePiece) {
    return namePiece ? ' ' + namePiece : '';
  }

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
     * @return {Object} gender conclusion with id, type (value), and attribution
     */

    /**
     * @ngdoc property
     * @name person.types:constructor.Person#attribution
     * @propertyOf person.types:constructor.Person
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getFacts
     * @methodOf person.types:constructor.Person
     * @function
     * @param {string=} type if present, return only facts with this type
     * @return {Fact[]} an array of {@link fact.types:constructor.Fact Facts}
     */
    $getFacts: function(type) {
      return (type ? helpers.filter(this.facts, {type: type}) : this.facts) || [];
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getFact
     * @methodOf person.types:constructor.Person
     * @function
     * @param {string} type fact type; e.g., http://gedcomx.org/Birth
     * @return {Fact} return first {@link fact.types:constructor.Fact Fact} having specified type
     */
    $getFact: function(type) {
      return helpers.find(this.facts, {type: type});
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBirth
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Fact} Birth {@link fact.types:constructor.Fact Fact}
     */
    $getBirth: function() {
      return this.$getFact('http://gedcomx.org/Birth');
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBirthDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Birth date
     */
    $getBirthDate: function() {
      var fact = this.$getBirth();
      return fact ? fact.$getDate() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBirthPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Birth place
     */
    $getBirthPlace: function() {
      var fact = this.$getBirth();
      return fact ? fact.$getPlace() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getChristening
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Fact} Christening {@link fact.types:constructor.Fact Fact}
     */
    $getChristening: function() {
      return this.$getFact('http://gedcomx.org/Christening');
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getChristeningDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Christening date
     */
    $getChristeningDate: function() {
      var fact = this.$getChristening();
      return fact ? fact.$getDate() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getChristeningPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Christning place
     */
    $getChristeningPlace: function() {
      var fact = this.$getChristening();
      return fact ? fact.$getPlace() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDeath
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Fact} Death {@link fact.types:constructor.Fact Fact}
     */
    $getDeath: function() {
      return this.$getFact('http://gedcomx.org/Death');
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDeathDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Death date
     */
    $getDeathDate: function() {
      var fact = this.$getDeath();
      return fact ? fact.$getDate() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDeathPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Death place
     */
    $getDeathPlace: function() {
      var fact = this.$getDeath();
      return fact ? fact.$getPlace() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBurial
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Fact} Burial {@link fact.types:constructor.Fact Fact}
     */
    $getBurial: function() {
      return this.$getFact('http://gedcomx.org/Burial');
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBurialDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Burial date
     */
    $getBurialDate: function() {
      var fact = this.$getBurial();
      return fact ? fact.$getDate() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getBurialPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} Birth place
     */
    $getBurialPlace: function() {
      var fact = this.$getBurial();
      return fact ? fact.$getPlace() : '';
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayBirthDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} birth date
     */
    $getDisplayBirthDate: function() { return maybe(this.display).birthDate; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayBirthPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} birth place
     */
    $getDisplayBirthPlace: function() { return maybe(this.display).birthPlace; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayDeathDate
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} death date
     */
    $getDisplayDeathDate: function() { return maybe(this.display).deathDate; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayDeathPlace
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} death place
     */
    $getDisplayDeathPlace: function() { return maybe(this.display).deathPlace; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayGender
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} gender - Male or Female
     */
    $getDisplayGender: function() { return maybe(this.display).gender; },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getDisplayLifeSpan
     * @methodOf person.types:constructor.Person
     * @function
     * @returns {string} birth year - death year
     */
    $getDisplayLifeSpan: function() { return maybe(this.display).lifespan; },

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
     * @name person.types:constructor.Person#$getNames
     * @methodOf person.types:constructor.Person
     * @function
     * @param {string=} type if present, return only names with this type
     * @return {Name[]} an array of {@link name.types:constructor.Name Names}
     */
    $getNames: function(type) {
      return (type ? helpers.filter(this.names, {type: type}) : this.names) || [];
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getPreferredName
     * @methodOf person.types:constructor.Person
     * @function
     * @return {string} preferred {@link name.types:constructor.Name Name}
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
     * @name person.types:constructor.Person#$getUrl
     * @methodOf person.types:constructor.Person
     * @function
     * @return {String} Url of the person
     */
    $getUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).person).href); },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getChanges
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Object=} params `count` is the number of change entries to return, `from` to return changes following this id
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
     * @name person.types:constructor.Person#$getSpouses
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link person.functions:getSpouses getSpouses} response
     */
    $getSpouses: function() {
      return exports.getSpouses(this.id);
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getParents
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link person.functions:getParents getParents} response
     */
    $getParents: function() {
      return exports.getParents(this.id);
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$getChildren
     * @methodOf person.types:constructor.Person
     * @function
     * @return {Object} promise for the {@link person.functions:getChildren getChildren} response
     */
    $getChildren: function() {
      return exports.getChildren(this.id);
    },

    // TODO add links to ancestry, descendancy, person-with-relationships, matches, portrait

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$addName
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Name|Object|string} value name to add; if value is not a Name, it is passed into the Name constructor
     * @return {Person} this person
     */
    $addName: function(value) {
      if (!helpers.isArray(this.names)) {
        this.names = [];
      }
      if (!(value instanceof name.Name)) {
        value = new name.Name(value);
      }
      this.names.push(value);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$deleteName
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Name|string} value name or name id to remove
     * @param {String=} changeMessage change message
     * @return {Person} this person
     */
    $deleteName: function(value, changeMessage) {
      if (!(value instanceof name.Name)) {
        value = helpers.find(this.names, { id: value });
      }
      var pos = helpers.indexOf(this.names, value);
      if (pos >= 0) {
        // add name to $deleted map
        if (!this.$deletedConclusions) {
          this.$deletedConclusions = {};
        }
        this.$deletedConclusions[value.id] = changeMessage;
        // remove name from array
        this.names.splice(pos,1);
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$addFact
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
     * @return {Person} this person
     */
    $addFact: function(value) {
      if (!helpers.isArray(this.facts)) {
        this.facts = [];
      }
      if (!(value instanceof fact.Fact)) {
        value = new fact.Fact(value);
      }
      this.facts.push(value);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$deleteFact
     * @methodOf person.types:constructor.Person
     * @function
     * @param {Fact|string} value fact or fact id to remove
     * @param {String=} changeMessage change message
     * @return {Person} this person
     */
    $deleteFact: function(value, changeMessage) {
      if (!(value instanceof fact.Fact)) {
        value = helpers.find(this.facts, { id: value });
      }
      var pos = helpers.indexOf(this.facts, value);
      if (pos >= 0) {
        // add fact to $deleted map
        if (!this.$deletedConclusions) {
          this.$deletedConclusions = {};
        }
        this.$deletedConclusions[value.id] = changeMessage;
        // remove fact from array
        this.facts.splice(pos,1);
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$setGender
     * @methodOf person.types:constructor.Person
     * @function
     * @param {String} gender e.g., http://gedcomx.org/Female
     * @param {String=} changeMessage change message
     * @return {Person} this person
     */
    $setGender: function(gender, changeMessage) {
      if (!this.gender) {
        this.gender = {};
      }
      this.gender.$changed = true;
      this.gender.type = gender;
      if (changeMessage) {
        this.gender.attribution = new attribution.Attribution(changeMessage);
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name person.types:constructor.Person#$save
     * @methodOf person.types:constructor.Person
     * @function
     * @description
     * Create a new person (if this person does not have an id) or update the existing person
     *
     * {@link http://jsfiddle.net/DallanQ/CM3Lz/ editable example}
     *
     * @param {String=} changeMessage default change message to use when name/fact/gender-specific changeMessage is not specified
     * @param {boolean=} refresh true to read the person after updating
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the person id, which is fulfilled after person has been updated,
     * and if refresh is true, after the person has been read
     */
    $save: function(changeMessage, refresh, opts) {
      var postData = new Person();
      var isChanged = false;
      if (this.id) {
        postData.id = this.id; // updating existing person
      }

      // TODO don't "push down" attribution to individual conclusions once the global attribution bug has been fixed

      // if person is new, default a few things
      if (!this.id) {
        // default gender to unknown
        if (!this.gender) {
          this.$setGender('http://gedcomx.org/Unknown');
        }
        // default name to Unknown if no names
        if (!helpers.isArray(this.names) || this.names.length === 0) {
          this.$addName({fullText: 'Unknown', givenName: 'Unknown'});
        }
        // default first name to preferred if no names are preferred
        if (!helpers.find(this.names, {preferred: true})) {
          this.names[0].$setPreferred(true);
        }
        // default name type to birth name if there is only one name
        if (this.names.length === 1 && !this.names[0].type) {
          this.names[0].$setType('http://gedcomx.org/BirthName');
        }
      }

      // send gender if gender is new or changed
      if (this.gender && (!this.gender.id || this.gender.$changed)) {
        // set change message if none set
        if (changeMessage && helpers.attributionNeeded(this.gender)) {
          this.gender.attribution = new attribution.Attribution(changeMessage);
        }
        postData.gender = this.gender;
        isChanged = true;
      }

      // send names that are new or updated
      helpers.forEach(this.names, function(name) {
        if (!name.id || name.$changed) {
          // default full text if not set
          if (!name.$getFullText()) {
            name.$setFullText((spacePrefix(name.$getPrefix()) + spacePrefix(name.$getGivenName()) +
                               spacePrefix(name.$getSurname()) + spacePrefix(name.$getSuffix())).trim());
          }
          // set change message if none set
          if (changeMessage && helpers.attributionNeeded(name)) {
            name.$setChangeMessage(changeMessage);
          }
          postData.$addName(name);
          isChanged = true;
        }
      });

      // send facts that are new or updated
      helpers.forEach(this.facts, function(fact) {
        if (!fact.id || fact.$changed) {
          // set change message if none set
          if (changeMessage && helpers.attributionNeeded(fact)) {
            fact.$setChangeMessage(changeMessage);
          }
          postData.$addFact(fact);
          isChanged = true;
        }
      });

      var promises = [];

      // post update
      if (isChanged) {
        promises.push(helpers.chainHttpPromises(
          postData.id ? plumbing.getUrl('person-template', null, {pid: postData.id}) : plumbing.getUrl('persons'),
          function(url) {
            return plumbing.post(url, { persons: [ postData ] }, {}, opts, helpers.getResponseEntityId);
          }));
      }

      // post deletions
      if (this.id && this.$deletedConclusions) {
        helpers.forEach(this.$deletedConclusions, function(value, key) {
          value = value || changeMessage; // default to global change message
          promises.push(helpers.chainHttpPromises(
            plumbing.getUrl('person-conclusion-template', null, {pid: postData.id, cid: key}),
            function(url) {
              return plumbing.del(url, value ? {'X-Reason': value} : {}, opts);
            }
          ));
        });
      }

      var person = this;
      // wait for all promises to be fulfilled
      var promise = helpers.promiseAll(promises).then(function(results) {
        var id = postData.id ? postData.id : results[0]; // if we're adding a new person, get id from the first (only) promise
        helpers.extendHttpPromise(promise, promises[0]); // extend the first promise into the returned promise

        if (refresh) {
          // re-read the person and set this object's properties from response
          return exports.getPerson(id, {}, opts).then(function(response) {
            helpers.deleteProperties(person);
            helpers.extend(person, response.getPerson());
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
     * @name person.types:constructor.Person#$delete
     * @methodOf person.types:constructor.Person
     * @function
     * @description delete this person
     * @param {string} changeMessage change message
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the person URL
     */
    $delete: function(changeMessage, opts) {
      return exports.deletePerson(helpers.removeAccessToken(maybe(maybe(this.links).person).href) || this.id, changeMessage, opts);
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
      return memories.addMemoryPersonaRef(this.id, memoryPersonaRef, params, opts);
    }
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
  globals.getPerson = exports.getPerson = function(pid, params, opts) { // put on globals so parentsAndChildren and spouses
                                                                        // and searchAndMatch can access it
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
  globals.personMapper = exports.personMapper = function(subObjectGenerator) { // put on globals so parentsAndChildren and spouses
                                                                               // and searchAndMatch and pedigree can access it
    var personsGenerator = function(response) {
      return helpers.flatMap(subObjectGenerator ? subObjectGenerator(response) : [response], function(root) {
        return root.persons;
      });
    };
    return helpers.compose(
      helpers.constructorSetter(Person, 'persons', subObjectGenerator),
      helpers.constructorSetter(name.Name, 'names', personsGenerator),
      helpers.constructorSetter(fact.Fact, 'facts', personsGenerator),
      helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
        return helpers.flatMap(personsGenerator(response), function(person) {
          return helpers.union(
            [person],
            person.names,
            person.facts,
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
   * @return {Object} promise that is fulfilled when all of the people have been read,
   * returning a map of person id to {@link person.functions:getPerson getPerson} response
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
            helpers.constructorSetter(fact.Fact, 'fatherFacts', function(response) {
              return response.childAndParentsRelationships;
            }),
            helpers.constructorSetter(fact.Fact, 'motherFacts', function(response) {
              return response.childAndParentsRelationships;
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return helpers.flatMap(response.childAndParentsRelationships, function(rel) {
                return helpers.union(rel.fatherFacts, rel.motherFacts);
              });
            }),
            helpers.constructorSetter(fact.Fact, 'facts', function(response) {
              return response.relationships;
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return helpers.flatMap(response.relationships, function(rel) {
                return rel.facts;
              });
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
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
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
  // TODO check if this has been fixed, and check if the entries really contain changeInfo and contributors attributes
  exports.getPersonChangeSummary = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-change-summary-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getChanges: function() { return this.entries || []; }}),
            helpers.constructorSetter(changeHistory.Change, 'entries')));
      });
  };

  var relationshipsResponseMapper = helpers.compose(
    helpers.constructorSetter(spouses.Couple, 'relationships'),
    helpers.constructorSetter(parentsAndChildren.ChildAndParents, 'childAndParentsRelationships'),
    helpers.objectExtender({
      getCoupleRelationships: function() { return helpers.filter(maybe(this).relationships, {type: 'http://gedcomx.org/Couple'}) || []; },
      getChildAndParentsRelationships: function() { return maybe(this).childAndParentsRelationships || []; },
      getPerson:    function(id) { return helpers.find(this.persons, {id: id}); }
    }),
    helpers.constructorSetter(fact.Fact, 'facts', function(response) {
      return response.relationships;
    }),
    helpers.constructorSetter(fact.Fact, 'fatherFacts', function(response) {
      return response.childAndParentsRelationships;
    }),
    helpers.constructorSetter(fact.Fact, 'motherFacts', function(response) {
      return response.childAndParentsRelationships;
    }),
    helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
      return helpers.union(
        helpers.flatMap(response.relationships, function(rel) {
          return rel.facts;
        }),
        helpers.flatMap(response.childAndParentsRelationships, function(rel) {
          return helpers.union(rel.fatherFacts, rel.motherFacts);
        }));
    }),
    exports.personMapper()
  );

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
   * {@link http://jsfiddle.net/DallanQ/7zLEJ/ editable example}
   *
   * @param {String} pid id of the person or full URL of the spouses endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getSpouses = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('spouses-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts, relationshipsResponseMapper);
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
   * {@link http://jsfiddle.net/DallanQ/L3U3j/ editable example}
   *
   * @param {String} pid id of the person or full URL of the parents endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getParents = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('parents-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts, relationshipsResponseMapper);
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
   * {@link http://jsfiddle.net/DallanQ/F8wVM/ editable example}
   *
   * @param {String} pid id of the person or full URL of the children endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildren = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('children-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts, relationshipsResponseMapper);
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
   * {@link http://jsfiddle.net/DallanQ/N9kzf/ editable example}
   *
   * @param {string} pid id or full URL of the person
   * @param {string} changeMessage reason for the deletion
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person id/URL
   */
  exports.deletePerson = function(pid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-template', pid, {pid: pid}),
      function(url) {
        return plumbing.del(url, changeMessage ? {'X-Reason': changeMessage} : {}, opts, function() {
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
   * {@link http://jsfiddle.net/DallanQ/vBHBD/ editable example}
   *
   * @param {string} pid id of the person
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the preferred couple relationship id or null if no preference
   */
  exports.getPreferredSpouse = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      user.getCurrentUser(),
      function(response) {
        var uid = response.getUser().treeUserId;
        return plumbing.getUrl('preferred-spouse-relationship-template', null, {uid: uid, pid: pid});
      },
      function(url) {
        var promise = plumbing.get(url, params, {}, opts);
        // FamilySearch returns a 303 function to redirect to the preferred relationship, but the response may come back as XML in chrome.
        // So just get the relationship id from the content-location header
        return helpers.handleRedirect(promise, function(promise) {
          return promise.getStatusCode() === 200 ? helpers.getLastUrlSegment(promise.getResponseHeader('Content-Location')) : null;
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
   * {@link http://jsfiddle.net/DallanQ/SnYk9/ editable example}
   *
   * @param {string} pid id of the person
   * @param {string} crid id or URL of the preferred Couple relationship
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person id
   */
  exports.setPreferredSpouse = function(pid, crid, opts) {
    var coupleUrl;
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-template', crid, {crid: crid}),
      function(url) {
        coupleUrl = url;
        return user.getCurrentUser();
      },
      function(response) {
        var uid = response.getUser().treeUserId;
        return plumbing.getUrl('preferred-spouse-relationship-template', null, {uid: uid, pid: pid});
      },
      function(url) {
        return plumbing.put(url, null, {'Location': coupleUrl}, opts, function() {
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
   * {@link http://jsfiddle.net/DallanQ/tzz6U/ editable example}
   *
   * @param {string} pid id of the person
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person id
   */
  exports.deletePreferredSpouse = function(pid, opts) {
    return helpers.chainHttpPromises(
      user.getCurrentUser(),
      function(response) {
        var uid = response.getUser().treeUserId;
        return plumbing.getUrl('preferred-spouse-relationship-template', null, {uid: uid, pid: pid});
      },
      function(url) {
        return plumbing.del(url, {}, opts, function() {
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
   * {@link http://jsfiddle.net/DallanQ/Ldk3q/ editable example}
   *
   * @param {string} pid id of the person
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the preferred ChildAndParents relationship id or null if no preference
   */
  exports.getPreferredParents = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      user.getCurrentUser(),
      function(response) {
        var uid = response.getUser().treeUserId;
        return plumbing.getUrl('preferred-parent-relationship-template', null, {uid: uid, pid: pid});
      },
      function(url) {
        // TODO remove accept header when FS bug is fixed
        var promise = plumbing.get(url, params, {Accept: 'application/x-fs-v1+json'}, opts);
        // FamilySearch returns a 303 function to redirect to the preferred relationship, but the response may come back as XML in chrome.
        // So just get the relationship id from the content-location header
        return helpers.handleRedirect(promise, function(promise) {
          return promise.getStatusCode() === 200 ? helpers.getLastUrlSegment(promise.getResponseHeader('Content-Location')) : null;
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
   * {@link http://jsfiddle.net/DallanQ/4r3Dr/ editable example}
   *
   * @param {string} pid id of the person
   * @param {string} caprid id or URL of the preferred ChildAndParents relationship
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person id
   */
  exports.setPreferredParents = function(pid, caprid, opts) {
    var childAndParentsUrl;
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-template', caprid, {caprid: caprid}),
      function(url) {
        childAndParentsUrl = url;
        return user.getCurrentUser();
      },
      function(response) {
        var uid = response.getUser().treeUserId;
        return plumbing.getUrl('preferred-parent-relationship-template', null, {uid: uid, pid: pid});
      },
      function(url) {
        return plumbing.put(url, null, {'Location': childAndParentsUrl}, opts, function() {
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
   * {@link http://jsfiddle.net/DallanQ/X4dbt/ editable example}
   *
   * @param {string} pid id of the person
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person id
   */
  exports.deletePreferredParents = function(pid, opts) {
    return helpers.chainHttpPromises(
      user.getCurrentUser(),
      function(response) {
        var uid = response.getUser().treeUserId;
        return plumbing.getUrl('preferred-parent-relationship-template', null, {uid: uid, pid: pid});
      },
      function(url) {
        return plumbing.del(url, {}, opts, function() {
          return pid;
        });
      }
    );
  };

  // TODO getPersonMerge
  // TODO getPersonNotAMatch

  return exports;
});
