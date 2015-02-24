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
 * Two methods to note below are _$save_ and _$delete_.
 * _$save_ persists the changes made to names, facts, and gender;
 * _$delete_ removes the person.
 *
 * @param {Object=} data an object with optional attributes {$gender, names, facts}.
 * _$gender_ is a string.
 * _names_ is an array of Name's, or Objects or strings to pass into the Name constructor.
 * _facts_ is an array of Fact's or Objects to pass into the Fact constructor.
 */
var Person = FS.Person = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.$gender) {
      //noinspection JSUnresolvedFunction
      this.$setGender(data.$gender);
      delete this.$gender;
    }
    if (data.names) {
      //noinspection JSUnresolvedFunction
      this.$setNames(data.names);
    }
    if (data.facts) {
      //noinspection JSUnresolvedFunction
      this.$setFacts(data.facts);
    }
    if (data.attribution && !(data.attribution instanceof FS.Attribution)) {
      this.attribution = client.createAttribution(data.attribution);
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

Person.prototype = {
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
   * @name person.types:constructor.Person#$isReadOnly
   * @methodOf person.types:constructor.Person
   * @description
   * This function is available only if the person is read with `getPerson` or `getPersonWithRelationships`.
   * @returns {Boolean} true if the person is read-only
   */
  // this function is added in the getPerson() function below

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getFacts
   * @methodOf person.types:constructor.Person
   * @function
   * @param {string=} type if present, return only facts with this type
   * @return {Fact[]} an array of {@link fact.types:constructor.Fact Facts}
   */
  $getFacts: function(type) {
    return (type ? utils.filter(this.facts, {type: type}) : this.facts) || [];
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
    return utils.find(this.facts, {type: type});
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
    return (type ? utils.filter(this.names, {type: type}) : this.names) || [];
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getPreferredName
   * @methodOf person.types:constructor.Person
   * @function
   * @return {string} preferred {@link name.types:constructor.Name Name}
   */
  $getPreferredName: function() { return utils.findOrFirst(this.names, {preferred: true}); },

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
   * @name person.types:constructor.Person#$getPersonUrl
   * @methodOf person.types:constructor.Person
   * @function
   * @return {String} Url of the person
   */
  $getPersonUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).person).href); },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getChanges
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Object=} params `count` is the number of change entries to return, `from` to return changes following this id
   * @return {Object} promise for the {@link changeHistory.functions:getPersonChanges getPersonChanges} response
   */
  $getChanges: function(params) {
    return this.$client.getPersonChanges(this.$helpers.removeAccessToken(this.links['change-history'].href), params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDiscussionRefs
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link discussions.functions:getPersonDiscussionRefs getPersonDiscussionRefs} response
   */
  $getDiscussionRefs: function() {
    return this.$client.getPersonDiscussionRefs(this.$helpers.removeAccessToken(this.links['discussion-references'].href));
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getMemoryPersonaRefs
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link memories.functions:getMemoryPersonaRefs getMemoryPersonaRefs} response
   */
  $getMemoryPersonaRefs: function() {
    return this.$client.getMemoryPersonaRefs(this.$helpers.removeAccessToken(this.links['evidence-references'].href));
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getNotes
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link notes.functions:getPersonNotes getPersonNotes} response
   */
  $getNotes: function() {
    return this.$client.getPersonNotes(this.$helpers.removeAccessToken(this.links['notes'].href));
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getSourceRefs
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link sources.functions:getPersonSourceRefs getPersonSourceRefs} response
   */
  $getSourceRefs: function() {
    return this.$client.getPersonSourceRefs(this.id);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getSources
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link sources.functions:getPersonSourcesQuery getPersonSourcesQuery} response
   */
  $getSources: function() {
    return this.$client.getPersonSourcesQuery(this.id);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getSpouses
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link person.functions:getSpouses getSpouses} response
   */
  $getSpouses: function() {
    return this.$client.getSpouses(this.id);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getParents
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link person.functions:getParents getParents} response
   */
  $getParents: function() {
    return this.$client.getParents(this.id);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getChildren
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link person.functions:getChildren getChildren} response
   */
  $getChildren: function() {
    return this.$client.getChildren(this.id);
  },
  
  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getMatches
   * @methodOf person.types:constructor.Person
   * @function
   * @return {Object} promise for the {@link searchAndMatch.functions:getPersonMatches getPersonMatches} response
   */
  $getMatches: function() {
    return this.$client.getPersonMatches(this.id);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getAncestry
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Object=} params includes `generations` to retrieve max 8, `spouse` id to get ancestry of person and spouse,
   * `personDetails` set to true to retrieve full person objects for each ancestor
   * @return {Object} promise for the {@link pedigree.functions:getAncestry getAncestry} response
   */
  $getAncestry: function(params) {
    return this.$client.getAncestry(this.id, params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getDescendancy
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Object=} params includes `generations` to retrieve max 2, `spouse` id to get descendency of person and spouse
   * @return {Object} promise for the {@link pedigree.functions:getDescendancy getDescendancy} response
   */
  $getDescendancy: function(params) {
    return this.$client.getDescendancy(this.id, params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$getPersonPortraitUrl
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Object=} params `default` URL to redirect to if portrait doesn't exist;
   * `followRedirect` if true, follow the redirect and return the final URL
   * @return {Object} promise for the {@link memories.functions:getPersonPortraitUrl getPersonPortraitUrl} response
   */
  $getPersonPortraitUrl: function(params) {
    return this.$client.getPersonPortraitUrl(this.id, params);
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$setNames
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Name[]|Object[]|string[]} values names to set; if an array element is not a Name, it is passed into the Name constructor
   * @param {string=} changeMessage change message to use for deleted names if any
   * @return {Person} this person
   */
  $setNames: function(values, changeMessage) {
    if (utils.isArray(this.names)) {
      utils.forEach(this.names, function(name) {
        this.$deleteName(name, changeMessage);
      }, this);
    }
    this.names = [];
    utils.forEach(values, function(value) {
      this.$addName(value);
    }, this);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name person.types:constructor.Person#$addName
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Name|Object|string} value name to add; if value is not a Name, it is passed into the Name constructor
   * @return {Person} this person
   */
  $addName: function(value) {
    if (!utils.isArray(this.names)) {
      this.names = [];
    }
    if (!(value instanceof FS.Name)) {
      value = this.$client.createName(value);
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
    if (!(value instanceof FS.Name)) {
      value = utils.find(this.names, { id: value });
    }
    var pos = utils.indexOf(this.names, value);
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
   * @name person.types:constructor.Person#$setFacts
   * @methodOf person.types:constructor.Person
   * @function
   * @param {Fact[]|Object[]} values facts to set; if an array element is not a Fact, it is passed into the Fact constructor
   * @param {string=} changeMessage change message to use for deleted facts if any
   * @return {Person} this person
   */
  $setFacts: function(values, changeMessage) {
    if (utils.isArray(this.facts)) {
      utils.forEach(this.facts, function(fact) {
        this.$deleteFact(fact, changeMessage);
      }, this);
    }
    this.facts = [];
    utils.forEach(values, function(value) {
      this.$addFact(value);
    }, this);
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
    if (!utils.isArray(this.facts)) {
      this.facts = [];
    }
    if (!(value instanceof FS.Fact)) {
      value = this.$client.createFact(value);
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
    if (!(value instanceof FS.Fact)) {
      value = utils.find(this.facts, { id: value });
    }
    var pos = utils.indexOf(this.facts, value);
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
      this.gender.attribution = this.$client.createAttribution(changeMessage);
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
   * {@link http://jsfiddle.net/v4840hjt/ editable example}
   *
   * @param {String=} changeMessage default change message to use when name/fact/gender-specific changeMessage is not specified
   * @param {boolean=} refresh true to read the person after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the person id, which is fulfilled after person has been updated,
   * and if refresh is true, after the person has been read
   */
  $save: function(changeMessage, refresh, opts) {
    var postData = this.$client.createPerson();
    var isChanged = false;
    if (this.id) {
      postData.id = this.id; // updating existing person
    }

    // if person is new, default a few things
    if (!this.id) {
      // default gender to unknown
      if (!this.gender) {
        this.$setGender('http://gedcomx.org/Unknown');
      }
      // default name to Unknown if no names
      if (!utils.isArray(this.names) || this.names.length === 0) {
        this.$addName({$fullText: 'Unknown', $givenName: 'Unknown'});
      }
      // default first name to preferred if no names are preferred
      if (!utils.find(this.names, {preferred: true})) {
        this.names[0].$setPreferred(true);
      }
      // default name type to birth name if there is only one name
      if (this.names.length === 1 && !this.names[0].type) {
        this.names[0].$setType('http://gedcomx.org/BirthName');
      }
      // default living status to false
      if (utils.isUndefined(this.living)) {
        this.living = false;
      }
    }

    // set global changeMessage
    if (changeMessage) {
      postData.attribution = this.$client.createAttribution(changeMessage);
    }
    
    // if new person, send living status
    if (!this.id) {
      postData.living = this.living;
    }

    // send gender if gender is new or changed
    if (this.gender && (!this.gender.id || this.gender.$changed)) {
      postData.gender = this.gender;
      isChanged = true;
    }

    // send names that are new or updated
    utils.forEach(this.names, function(name) {
      if (!name.id || name.$changed) {
        // default full text if not set
        if (!name.$getFullText()) {
          name.$setFullText((spacePrefix(name.$getPrefix()) + spacePrefix(name.$getGivenName()) +
                             spacePrefix(name.$getSurname()) + spacePrefix(name.$getSuffix())).trim());
        }
        postData.$addName(name);
        isChanged = true;
      }
    });

    // send facts that are new or updated
    utils.forEach(this.facts, function(fact) {
      if (!fact.id || fact.$changed) {
        postData.$addFact(fact);
        isChanged = true;
      }
    });

    var promises = [],
        self = this;

    // post update
    if (isChanged) {
      promises.push(self.$helpers.chainHttpPromises(
        postData.id ? self.$plumbing.getUrl('person-template', null, {pid: postData.id}) : self.$plumbing.getUrl('persons'),
        function(url) {
          return self.$plumbing.post(url, { persons: [ postData ] }, {}, opts, self.$helpers.getResponseEntityId);
        }));
    }

    // post deletions
    if (this.id && this.$deletedConclusions) {
      utils.forEach(this.$deletedConclusions, function(value, key) {
        value = value || changeMessage; // default to global change message
        promises.push(self.$helpers.chainHttpPromises(
          self.$plumbing.getUrl('person-conclusion-template', null, {pid: postData.id, cid: key}),
          function(url) {
            return self.$plumbing.del(url, value ? {'X-Reason': value} : {}, opts);
          }
        ));
      });
    }

    var person = this;
    // wait for all promises to be fulfilled
    var promise = self.$helpers.promiseAll(promises).then(function(results) {
      var id = postData.id ? postData.id : results[0]; // if we're adding a new person, get id from the first (only) promise
      self.$helpers.extendHttpPromise(promise, promises[0]); // extend the first promise into the returned promise

      if (refresh) {
        // re-read the person and set this object's properties from response
        return self.$client.getPerson(id, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(person, utils.appFieldRejector);
          utils.extend(person, response.getPerson());
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
   * @description delete this person - see {@link person.functions:deletePerson deletePerson}
   * @param {string} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person URL
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deletePerson(this.$getPersonUrl() || this.id, changeMessage, opts);
  }
};