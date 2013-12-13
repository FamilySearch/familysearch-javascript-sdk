define([
  'helpers',
  'person',
  'plumbing'
], function(helpers, person, plumbing) {
  /**
   * @ngdoc overview
   * @name pedigree
   * @description
   * Get someone's ancestry or descendancy
   *
   * {@link https://familysearch.org/developers/docs/api/resources#pedigree FamilySearch API Docs}
   */
  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name pedigree.functions:getAncestry
   * @function
   *
   * @description
   * Get the ancestors of a specified person and optionally a specified spouse with the following convenience functions
   *
   * - `exists(ascendancyNumber)` - return true if a person with ascendancy number exists
   *
   * The following functions return person objects decorated with *person convenience functions* {@link person.functions:getPerson as described in getPerson}
   * (with the exception that `getGivenName()` and `getSurname()` functions do not work because the name pieces aren't there)
   * as well as a `getAscendancyNumber()` function that returns the person's ascendancy number
   *
   * - `getPersons()` - returns an array of all persons
   * - `getPerson(ascendancyNumber)`
   *
   * **NOTE:** the `getBirthDate()`, `getBirthPlace()`, `getDeathDate()`, and `getDeathPlace()` person convenience functions
   * are available only if `params` includes `personDetails`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Ancestry_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/gt726/ editable example}
   *
   * @param {String} id of the person
   * @param {Object=} params includes `generations` to retrieve max 8, `spouse` id to get ancestry of person and spouse, `personDetails` set to true to retrieve full person objects for each ancestor
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the ancestry
   */
  exports.getAncestry = function(id, params, opts) {
    return plumbing.get('/platform/tree/ancestry', helpers.removeEmptyProperties(helpers.extend({'person': id}, params)),
      {}, opts,
      helpers.compose(
        helpers.objectExtender(pedigreeConvenienceFunctionGenerator('ascendancyNumber')),
        person.personExtender,
        helpers.objectExtender({getAscendancyNumber: function() { return this.display.ascendancyNumber; }}, person.personExtensionPointGetter)
      ));
  };

  function pedigreeConvenienceFunctionGenerator(numberLabel) {
    return {
      getPersons:    function()    { return this.persons; },
      exists:        function(num) { return !!maybe(helpers.find(this.persons, matchPersonNum(numberLabel, num))).id; },
      getPerson:     function(num) { return helpers.find(this.persons, matchPersonNum(numberLabel, num)); }
    };
  }

  function matchPersonNum(numberLabel, num) {
    return function(p) {
      /*jshint eqeqeq:false */
      return p.display[numberLabel] == num; // == so users can pass in either numbers or strings for ascendancy numbers
    };
  }

  /**
   * @ngdoc function
   * @name pedigree.functions:getDescendancy
   * @function
   *
   * @description
   * Get the descendants of a specified person and optionally a specified spouse with the following convenience functions
   * (similar convenience functions as getAncestry)
   *
   * - `exists(descendancyNumber)` - return true if a person with descendancy number exists
   *
   * The following functions return person objects decorated with *person convenience functions* {@link person.functions:getPerson as described in getPerson}
   * (with the exception that `getGivenName()` and `getSurname()` functions do not work because the name pieces aren't there)
   * as well as a `getDescendancyNumber()` function that returns the person's descendancy number
   *
   * - `getPersons()` - returns all persons
   * - `getPerson(descendancyNumber)`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Descendancy_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/eBNGk/ editable example}
   *
   * @param {String} id of the person
   * @param {Object=} params includes `generations` to retrieve max 2, `spouse` id to get descendency of person and spouse
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the descendancy
   */
  exports.getDescendancy = function(id, params, opts) {
    return plumbing.get('/platform/tree/descendancy', helpers.removeEmptyProperties(helpers.extend({'person': id}, params)),
      {}, opts,
      helpers.compose(
        helpers.objectExtender(pedigreeConvenienceFunctionGenerator('descendancyNumber')),
        person.personExtender,
        helpers.objectExtender({getDescendancyNumber: function() { return this.display.descendancyNumber; }}, person.personExtensionPointGetter)
      ));
  };

  return exports;
});