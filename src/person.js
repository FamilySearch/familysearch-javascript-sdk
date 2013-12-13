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
   * @name person.functions:getPerson
   * @function
   *
   * @description
   * Get the specified person
   * The response includes the following convenience function
   *
   * - `getPerson()` - get the person object from the response, which has been extended with the *person convenience functions* listed below
   *
   * ###Person Convenience Functions
   *
   * - `getId()`
   * - `getBirthDate()`
   * - `getBirthPlace()`
   * - `getDeathDate()`
   * - `getDeathPlace()`
   * - `getGender()`
   * - `getLifeSpan()`
   * - `isLiving()`
   * - `getName()` - display name
   * - `getGivenName()` - preferred
   * - `getSurname()` - preferred
   * - `getNames()` - array of name objects decorated with *name convenience functions* described below
   * - `getFacts()` - array of fact objects decorated with *fact convenience functions* described below
   * - `getDisplayAttrs()` - returns an object with birthDate, birthPlace, deathDate, deathPlace, gender, lifespan, and name
   *
   * ###Name Convenience Functions
   * - `getId()` - name id
   * - `getContributor()` - id of the contributor
   * - `getType()` - http://gedcomx.org/BirthName, etc.
   * - `getNameFormsCount()` - get the number of name forms
   * - `getFullText(i)` - get the full text of the `i`'th name form; if `i` is omitted; get the first
   * - `getGivenName(i)` - get the given part of the `i`'th name form; if `i` is omitted; get the first
   * - `getSurname(i)` - get the surname part of the `i`'th name form; if `i` is omitted; get the first
   * - `isPreferred()` - true if this name is preferred
   *
   * ###Fact Convenience Functions
   * - `getId()` - fact id
   * - `getContributor()` - id of the contributor
   * - `getType()` - http://gedcomx.org/Birth, etc.
   * - `getDate()` - original string
   * - `getFormalDate()` - standard form; e.g., +1836-04-13
   * - `getPlace()` - original string
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/cST4L/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPerson = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id), params, {}, opts,
      helpers.compose(helpers.objectExtender({getPerson: function() { return this.persons[0]; }}), exports.personExtender));
  };

  exports.personExtensionPointGetter = function(response) {
    return response.persons;
  };

  exports.personConvenienceFunctions = {
    getId:         function() { return this.id; },
    getBirthDate:  function() { return this.display.birthDate; },
    getBirthPlace: function() { return this.display.birthPlace; },
    getDeathDate:  function() { return this.display.deathDate; },
    getDeathPlace: function() { return this.display.deathPlace; },
    getGender:     function() { return this.display.gender; },
    getLifeSpan:   function() { return this.display.lifespan; },
    isLiving:      function() { return this.living; },
    getName:       function() { return this.display.name; },
    getGivenName:  function() { return maybe(helpers.find(
      maybe(maybe(maybe(helpers.findOrFirst(this.names, {preferred: true})).nameForms)[0]).parts,
      {type: 'http://gedcomx.org/Given'}
    )).value; },
    getSurname:    function() { return maybe(helpers.find(
      maybe(maybe(maybe(helpers.findOrFirst(this.names, {preferred: true})).nameForms)[0]).parts,
      {type: 'http://gedcomx.org/Surname'}
    )).value; },
    getNames:      function() { return this.names; },
    getFacts:      function() { return this.facts; },
    getDisplayAttrs: function() { return this.display; }
  };

  var nameConvenienceFunctions = {
    getId:             function() { return this.id; },
    getContributor:    function() { return maybe(maybe(this.attribution).contributor).resourceId; },
    getType:           function() { return this.type; },
    getNameFormsCount: function() { return this.nameForms ? this.nameForms.length : 0; },
    getFullText:       function(i) { return maybe(maybe(this.nameForms)[i || 0]).fullText; },
    getGivenName:      function(i) { return maybe(helpers.find(
      maybe(maybe(this.nameForms)[i || 0]).parts,
      {type: 'http://gedcomx.org/Given'}
    )).value; },
    getSurname:        function(i) { return maybe(helpers.find(
      maybe(maybe(this.nameForms)[i || 0]).parts,
      {type: 'http://gedcomx.org/Surname'}
    )).value; },
    isPreferred:       function() { return this.preferred; }
  };

  exports.factConvenienceFunctions = {
    getId:             function() { return this.id; },
    getContributor:    function() { return maybe(maybe(this.attribution).contributor).resourceId; },
    getType:           function() { return this.type; },
    getDate:           function() { return maybe(this.date).original; },
    getFormalDate:     function() { return maybe(this.date).formal; },
    getPlace:          function() { return maybe(this.place).original; }
  };

  exports.personExtender = helpers.compose(
    helpers.objectExtender(exports.personConvenienceFunctions, exports.personExtensionPointGetter),
    helpers.objectExtender(nameConvenienceFunctions, function(response) {
      return helpers.flatMap(response.persons, function(person) { return person.names; });
    }),
    helpers.objectExtender(exports.factConvenienceFunctions, function(response) {
      return helpers.flatMap(response.persons, function(person) { return person.facts; });
    })
  );

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
   * @param {Array} ids of the people to read
   * @param {Object=} params to pass to getPerson currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the people have been read, returning a map of person id to response
   */
  exports.getMultiPerson = function(ids, params, opts) {
    var promises = {};
    helpers.forEach(ids, function(id) {
      promises[id] = exports.getPerson(id, params, opts);
    });
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name person.functions:getPersonWithRelationships
   * @function
   *
   * @description
   * Get a person and their children, spouses, and parents with the following convenience functions
   *
   * - `getPrimaryId()` - id of the person requested
   * - `getFatherIds()` - array of ids
   * - `getMotherIds()` - array of ids
   * - `getParentRelationships()` - array of { `id` - relationship id, `fatherId`, `motherId`,
   * `fatherType` - http://gedcomx.org/AdoptiveParent, http://gedcomx.org/BiologicalParent, etc,
   * `motherType` - same values as `fatherType` }
   * - `getSpouseRelationships()` - array of { `id` - relationship id, `spouseId` }
   * - `getSpouseIds()` - array of ids
   * - `getChildIds(spouseId)` - array of ids; if spouseId is specified, returns only ids of children with spouse as the other parent
   *
   * The following functions return person objects decorated with *person convenience functions* as described for {@link person.functions:getPerson getPerson}
   *
   * - `getPrimaryPerson()`
   * - `getPerson(id)` - works only for the primary person unless persons is set to true in params
   *
   *   In addition, the following functions are available if persons is set to true in params
   * - `getFathers()` - array of father persons
   * - `getMothers()` - array of mother persons
   * - `getParents()` - array of [father person, mother person]
   * - `getSpouses()` - array of spouse persons
   * - `getChildren(spouseId)` - array of child persons; if spouseId is specified returns only children with spouse as the other parent
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_With_Relationships_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/5Npsh/ editable example}
   *
   * @param {String} id person to read
   * @param {Object=} params set `persons` to true to retrieve full person objects for each relative
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the person with relationships
   */
  exports.getPersonWithRelationships = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons-with-relationships', helpers.removeEmptyProperties(helpers.extend({'person': id}, params)),
      {}, opts,
      helpers.compose(helpers.objectExtender(personWithRelationshipsConvenienceFunctions), exports.personExtender));
  };

  // TODO how identify preferred parents?
  var personWithRelationshipsConvenienceFunctions = {
    getPerson:     function(id) { return helpers.find(this.persons, {id: id}); },
    getPrimaryId:  function() { return maybe(helpers.find(this.persons, function(p) { return p.display.ascendancyNumber === '1';})).id; },
    getPrimaryPerson: function() { //noinspection JSValidateTypes
      return this.getPerson(this.getPrimaryId());
    },
    getFatherIds:  function() {
      var primaryId = this.getPrimaryId();
      return helpers.uniq(helpers.map(helpers.filter(this.childAndParentsRelationships,
        function(r) { return r.child.resourceId === primaryId && r.father; }),
        function(r) { return r.father.resourceId; }));
    },
    getFathers:    function() { return helpers.map(this.getFatherIds(), this.getPerson, this); },
    getMotherIds:  function() {
      var primaryId = this.getPrimaryId();
      return helpers.uniq(helpers.map(helpers.filter(this.childAndParentsRelationships,
        function(r) { return r.child.resourceId === primaryId && r.mother; }),
        function(r) { return r.mother.resourceId; }));
    },
    getMothers:    function() { return helpers.map(this.getMotherIds(), this.getPerson, this); },
    getParentRelationships: function() {
      var primaryId = this.getPrimaryId();
      return helpers.map(helpers.filter(this.childAndParentsRelationships,
        function(r) { return r.child.resourceId === primaryId && (r.father || r.mother); }),
        function(r) { return {
          id: r.id,
          fatherId: maybe(r.father).resourceId,
          motherId: maybe(r.mother).resourceId,
          fatherType: r.fatherFacts[0].type,
          motherType: r.motherFacts[0].type
        }; }, this);
    },
    getSpouseRelationships:  function() {
      var primaryId = this.getPrimaryId();
      return helpers.map(helpers.filter(this.relationships, function(r) {
          return r.type === 'http://gedcomx.org/Couple' &&
            (r.person1.resourceId === primaryId || r.person2.resourceId === primaryId);
        }),
        function(r) { return {
          id: r.id,
          spouseId: r.person1.resourceId === primaryId ? r.person2.resourceId : r.person1.resourceId
        }; });
    },
    getSpouseIds: function() {
      return helpers.map(this.getSpouseRelationships(), function(r) { return r.spouseId; });
    },
    getSpouses:  function() {
      var primaryId = this.getPrimaryId();
      return helpers.uniq(helpers.map(helpers.filter(this.relationships, function(r) {
        return r.type === 'http://gedcomx.org/Couple' &&
          (r.person1.resourceId === primaryId || r.person2.resourceId === primaryId);
      }),
        function(r) {
          return this.getPerson(r.person1.resourceId === primaryId ? r.person2.resourceId : r.person1.resourceId);
        }, this));
    },
    getChildIds:   function(spouseId) {
      var primaryId = this.getPrimaryId();
      return helpers.uniq(helpers.map(helpers.filter(this.childAndParentsRelationships, function(r) {
        return childParentRelationshipHasParent(r, primaryId) &&
          (!spouseId || childParentRelationshipHasParent(r, spouseId));
      }),
        function(r) { return r.child.resourceId; }));
    },
    getChildren:   function(spouseId) { return helpers.map(this.getChildIds(spouseId), this.getPerson, this); }
  };

  function childParentRelationshipHasParent(r, parentId) {
    return (r.father && r.father.resourceId === parentId) || (r.mother && r.mother.resourceId === parentId);
  }

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
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_Summary_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ga37h/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonChangeSummary = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/change-summary', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      helpers.objectExtender({getChanges: function() { return this.entries || []; }}));
  };

  // TODO getPersonMerge
  // TODO getPersonNotAMatch
  // TODO getRelationshipsToParents
  // TODO getRelationshipsToChildren
  // TODO getRelationshipsToSpouses

  return exports;
});
