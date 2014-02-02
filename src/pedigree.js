define([
  'globals',
  'helpers',
  'plumbing'
], function(globals, helpers, plumbing) {
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
   * Generate ancestry or descendancy convenience functions
   *
   * @param numberLabel ascendancyNumber or descendancyNumber
   * @returns {{getPersons: Function, exists: Function, getPerson: Function}}
   */
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
   * @name pedigree.functions:getAncestry
   * @function
   *
   * @description
   * Get the ancestors of a specified person and optionally a specified spouse with the following convenience functions
   *
   * - `getPersons()` - return an array of {@link person.types:constructor.Person Persons}
   * - `getPerson(ascendancyNumber)` - return a {@link person.types:constructor.Person Person}
   * - `exists(ascendancyNumber)` - return true if a person with ascendancy number exists
   *
   * ### Notes
   *
   * * Each Person object has an additional `getAscendancyNumber()` function that returns the person's ascendancy number.
   * * Some information on the Person objects is available only if `params` includes `personDetails`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Ancestry_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/gt726/ editable example}
   *
   * @param {string} pid id of the person
   * @param {Object=} params includes `generations` to retrieve max 8, `spouse` id to get ancestry of person and spouse,
   * `personDetails` set to true to retrieve full person objects for each ancestor
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the ancestry
   */
  exports.getAncestry = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('ancestry-query'),
      function(url) {
        return plumbing.get(url, helpers.extend({'person': pid}, params), {}, opts,
          helpers.compose(
            helpers.objectExtender(pedigreeConvenienceFunctionGenerator('ascendancyNumber')),
            globals.personMapper(),
            helpers.objectExtender({getAscendancyNumber: function() { return this.display.ascendancyNumber; }}, function(response) {
              return maybe(response).persons;
            })
          ));
      });
  };

  // TODO add marriageDetails query parameter and convenience functions

  /**
   * @ngdoc function
   * @name pedigree.functions:getDescendancy
   * @function
   *
   * @description
   * Get the descendants of a specified person and optionally a specified spouse with the following convenience functions
   * (similar convenience functions as getAncestry)
   *
   * - `getPersons()` - return an array of {@link person.types:constructor.Person Persons}
   * - `getPerson(descendancyNumber)` - return a {@link person.types:constructor.Person Person}
   * - `exists(descendancyNumber)` - return true if a person with ascendancy number exists
   *
   * ### Notes
   *
   * * Each Person object has an additional `getDescendancyNumber()` function that returns the person's descendancy number.
   * * Some information on the Person objects is unavailable; e.g., separate given name and surname name parts.
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Descendancy_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/eBNGk/ editable example}
   *
   * @param {string} pid id of the person
   * @param {Object=} params includes `generations` to retrieve max 2, `spouse` id to get descendency of person and spouse
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the descendancy
   */
  exports.getDescendancy = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('descendancy-query'),
      function(url) {
        return plumbing.get(url, helpers.extend({'person': pid}, params), {}, opts,
          helpers.compose(
            helpers.objectExtender(pedigreeConvenienceFunctionGenerator('descendancyNumber')),
            globals.personMapper(),
            helpers.objectExtender({getDescendancyNumber: function() { return this.display.descendancyNumber; }}, function(response) {
              return maybe(response).persons;
            })
          ));
      });
  };

  return exports;
});