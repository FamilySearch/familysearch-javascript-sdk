define([
  'attribution',
  'changeHistory',
  'fact',
  'globals',
  'helpers',
  'parentsAndChildren',
  'plumbing',
  'notes',
  'sources'
], function(attribution, changeHistory, fact, globals, helpers, parentsAndChildren, plumbing, notes, sources) {
  /**
   * @ngdoc overview
   * @name spouses
   * @description
   * Functions related to spouse relationships
   *
   * {@link https://familysearch.org/developers/docs/api/resources#spouses FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name spouses.types:constructor.Couple
   * @description
   *
   * Couple relationship
   *
   * Two methods to note below are _$save_ and _$delete_.
   * _$save_ persists the changes made to husband, wife, and facts;
   * _$delete_ removes the relationship.
   *
   * @param {Object=} data an object with optional attributes {husband, wife, facts}.
   * _husband_ and _wife_ are Person objects, URLs, or ids.
   * _facts_ is an array of Facts or objects to be passed into the Fact constructor.
   */
  var Couple = exports.Couple = function(data) {
    if (data) {
      if (data.husband) {
        //noinspection JSUnresolvedFunction
        this.$setHusband(data.husband);
      }
      if (data.wife) {
        //noinspection JSUnresolvedFunction
        this.$setWife(data.wife);
      }
      if (data.facts) {
        //noinspection JSUnresolvedFunction
        this.$setFacts(data.facts);
      }
    }
  };

  exports.Couple.prototype = {
    constructor: Couple,
    /**
     * @ngdoc property
     * @name spouses.types:constructor.Couple#id
     * @propertyOf spouses.types:constructor.Couple
     * @return {String} Id of the relationship
     */

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getCoupleUrl
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} Url of this couple relationship
     */
    $getCoupleUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).relationship).href); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getFacts
     * @methodOf spouses.types:constructor.Couple
     * @return {Fact[]} array of {@link fact.types:constructor.Fact Facts}; e.g., marriage
     */
    $getFacts: function() { return this.facts || []; },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getMarriageFact
     * @methodOf spouses.types:constructor.Couple
     * @return {Fact} {@link fact.types:constructor.Fact Fact} of type http://gedcomx.org/Marriage (first one if multiple)
     */
    $getMarriageFact: function() { return helpers.find(this.facts, {type: 'http://gedcomx.org/Marriage'}); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getHusbandId
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} Id of the husband
     */
    $getHusbandId: function() { return maybe(this.person1).resourceId; },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getHusbandUrl
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} URL of the husband
     */
    $getHusbandUrl: function() { return helpers.removeAccessToken(maybe(this.person1).resource); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getHusband
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
     */
    $getHusband: function() { return globals.getPerson(this.$getHusbandUrl() || this.$getHusbandId()); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getWifeId
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} Id of the wife
     */
    $getWifeId: function() { return maybe(this.person2).resourceId; },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getWifeUrl
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {String} URL of the wife
     */
    $getWifeUrl: function() { return helpers.removeAccessToken(maybe(this.person2).resource); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getWife
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
     */
    $getWife: function() { return globals.getPerson(this.$getWifeUrl() || this.$getWifeId()); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getSpouseId
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @description Use this method when you know the ID of one person in the relationship and you want to fetch the ID of the other person.
     * @param {string} ID of the spouse which you already know
     * @return {String} Id of the other spouse
     */
    $getSpouseId: function(knownSpouseId) { 
      if(maybe(this.person1).resourceId === knownSpouseId) {
        return maybe(this.person2).resourceId;
      } else {
        return maybe(this.person1).resourceId;
      }
    },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getSpouseUrl
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @description Use this method when you know the ID of one person in the relationship and you want to fetch the URL of the other person.
     * @param {string} ID of the spouse which you already know
     * @return {String} URL of the other spouse
     */
    $getSpouseUrl: function(knownSpouseId) {
      if(maybe(this.person1).resourceId === knownSpouseId) {
        return helpers.removeAccessToken(maybe(this.person2).resource);
      } else {
        return helpers.removeAccessToken(maybe(this.person1).resource);
      }
    },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getSpouse
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @description Use this method when you know the ID of one person in the relationship and you want to fetch the other person.
     * @param {string} ID of the spouse which you already know
     * @return {Object} promise for the {@link exports.functions:getPerson getPerson} response
     */
    $getSpouse: function(knownSpouseId) { 
      return globals.getPerson(this.$getSpouseUrl(knownSpouseId) || this.$getSpouseId(knownSpouseId));
    },
    
    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getNoteRefs
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link notes.functions:getCoupleNoteRefs getCoupleNoteRefs} response
     */
    $getNoteRefs: function() { return notes.getCoupleNoteRefs(helpers.removeAccessToken(this.links.notes.href)); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getSourceRefs
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link sources.functions:getCoupleSourceRefs getCoupleSourceRefs} response
     */
    $getSourceRefs: function() { return sources.getCoupleSourceRefs(this.id); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getSources
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link sources.functions:getCoupleSourcesQuery getCoupleSourcesQuery} response
     */
    $getSources: function() { return sources.getCoupleSourcesQuery(this.id); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$getChanges
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @return {Object} promise for the {@link sources.functions:getCoupleChanges getCoupleChanges} response
     */
    $getChanges: function() { return changeHistory.getCoupleChanges(helpers.removeAccessToken(maybe(this.links['change-history']).href)); },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$setHusband
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
     * @param {Person|string} husband person or URL or id
     * @return {Couple} this relationship
     */
    $setHusband: function(husband) {
      parentsAndChildren.setMember.call(this, 'person1', husband);
      this.$husbandChanged = true;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$setWife
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @description NOTE: if you plan call this function within a few seconds of initializing the SDK, pass in a Person or a URL, not an id
     * @param {Person|string} wife person or URL or id
     * @return {Couple} this relationship
     */
    $setWife: function(wife) {
      parentsAndChildren.setMember.call(this, 'person2', wife);
      this.$wifeChanged = true;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$setFacts
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @param {Fact[]|Object[]} facts facts to set; if array elements are not Facts, they are passed into the Fact constructor
     * @param {string=} changeMessage change message to use for deleted facts if any
     * @return {Couple} this relationship
     */
    $setFacts: function(facts, changeMessage) {
      parentsAndChildren.setFacts.call(this, 'facts', facts, changeMessage);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$addFact
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @param {Fact|Object} value fact to add; if value is not a Fact, it is passed into the Fact constructor
     * @return {Couple} this relationship
     */
    $addFact: function(value) {
      parentsAndChildren.addFact.call(this, 'facts', value);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$deleteFact
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @param {Fact|string} value fact or fact id to remove
     * @param {String=} changeMessage change message
     * @return {Couple} this relationship
     */
    $deleteFact: function(value, changeMessage) {
      parentsAndChildren.deleteFact.call(this, 'facts', value, changeMessage);
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name spouses.types:constructor.Couple#$save
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @description
     * Create a new relationship if this relationship does not have an id, or update the existing relationship
     *
     * {@link http://jsfiddle.net/DallanQ/vgS9Q/ editable example}
     *
     * @param {String=} changeMessage default change message to use when fact/deletion-specific changeMessage was not specified
     * @param {boolean=} refresh true to read the relationship after updating
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the relationship id, which is fulfilled after the relationship has been updated,
     * and if refresh is true, after the relationship has been read
     */
    $save: function(changeMessage, refresh, opts) {
      var postData = new Couple();
      var isChanged = false;
      var crid = this.id;

      // send husband and wife if new or either has changed
      if (!this.id || this.$husbandChanged || this.$wifeChanged) {
        postData.person1 = this.person1;
        postData.person2 = this.person2;
        isChanged = true;
      }

      // set global changeMessage
      if (changeMessage) {
        postData.attribution = new attribution.Attribution(changeMessage);
      }

      helpers.forEach(this.facts, function(fact) {
        if (!crid || !fact.id || fact.$changed) {
          parentsAndChildren.addFact.call(postData, 'facts', fact);
          isChanged = true;
        }
      });

      var promises = [];

      // post update
      if (isChanged) {
        if (!crid) {
          postData.type = 'http://gedcomx.org/Couple'; // set type on new relationships
        }
        // as of 9 July 2014 it's possible to update relationships using the relationships endpoint,
        // but the way we're doing it is fine as well
        promises.push(helpers.chainHttpPromises(
          crid ? plumbing.getUrl('couple-relationship-template', null, {crid: crid}) :
            plumbing.getUrl('relationships'),
          function(url) {
            // set url from id now that discovery resource is guaranteed to be loaded
            helpers.forEach(['person1', 'person2'], function(role) {
              if (postData[role] && !postData[role].resource && postData[role].resourceId) {
                postData[role].resource =
                  helpers.getUrlFromDiscoveryResource(globals.discoveryResource, 'person-template', {pid: postData[role].resourceId});
              }
            });
            return plumbing.post(url,
              { relationships: [ postData ] },
              {},
              opts,
              helpers.getResponseEntityId);
          }));
      }

      // post deleted facts
      if (crid && this.$deletedFacts) {
        helpers.forEach(this.$deletedFacts, function(value, key) {
          value = value || changeMessage; // default to global change message
          promises.push(plumbing.del(key, value ? {'X-Reason' : value} : {}, opts));
        });
      }

      var relationship = this;
      // wait for all promises to be fulfilled
      var promise = helpers.promiseAll(promises).then(function(results) {
        var id = crid ? crid : results[0]; // if we're adding a new relationship, get id from the first (only) promise
        helpers.extendHttpPromise(promise, promises[0]); // extend the first promise into the returned promise

        if (refresh) {
          // re-read the relationship and set this object's properties from response
          return exports.getCouple(id, {}, opts).then(function(response) {
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
     * @name spouses.types:constructor.Couple#$delete
     * @methodOf spouses.types:constructor.Couple
     * @function
     * @description delete this relationship - see {@link spouses.functions:deleteCouple deleteCouple}
     * @param {string} changeMessage change message
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the relationship URL
     */
    $delete: function(changeMessage, opts) {
      return exports.deleteCouple(this.$getCoupleUrl() || this.id, changeMessage, opts);
    }
  };

  /**
   * @ngdoc function
   * @name spouses.functions:getCouple
   * @function
   *
   * @description
   * Get information about a couple relationship
   * The response includes the following convenience functions
   *
   * - `getRelationship()` - a {@link spouses.types:constructor.Couple Couple} relationship
   * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
   * {@link person.types:constructor.Person Person} for a person id in the relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/a2vUg/ editable example}
   *
   * @param {String} crid id or full URL of the couple relationship
   * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
   * which you can access using the `getPerson(id)` convenience function.
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCouple = function(crid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-template', crid, {crid: crid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.constructorSetter(Couple, 'relationships'),
            helpers.objectExtender(coupleConvenienceFunctions),
            helpers.constructorSetter(fact.Fact, 'facts', function(response) {
              return maybe(response).relationships;
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return helpers.flatMap(response.relationships, function(relationship) {
                return relationship.facts;
              });
            }),
            globals.personMapper()
          ));
      });
  };

  var coupleConvenienceFunctions = {
    getRelationship: function() { return maybe(this.relationships)[0]; },
    getPerson:       function(id) { return helpers.find(this.persons, {id: id}); }
  };

  /**
   * @ngdoc function
   * @name spouses.functions:deleteCouple
   * @function
   *
   * @description
   * Delete the specified relationship
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/ypHgL/ editable example}
   *
   * @param {string} crid id or full URL of the couple relationship
   * @param {string} changeMessage reason for the deletion
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the relationship id/URL
   */
  exports.deleteCouple = function(crid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-template', crid, {crid: crid}),
      function(url) {
        return plumbing.del(url, changeMessage ? {'X-Reason' : changeMessage} : {}, opts, function() {
          return crid;
        });
      }
    );
  };

  return exports;
});
