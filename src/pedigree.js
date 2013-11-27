define([
  './helpers.js',
  './FamilySearch.js',
  './person.js',
  './plumbing.js'
], function(helpers, FamilySearch, person, plumbing) {
  /**
   * @ngdoc overview
   * @name pedigree
   * @description
   * Get someone's ancestry or descendancy
   *
   * {@link https://familysearch.org/developers/docs/api/resources#pedigree FamilySearch API Docs}
   */

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
   * as well as a `getAscendancyNumber()` function that returns the person's ascendancy number
   *
   * - `getPersons()` - returns an array of all persons
   * - `getPerson(ascendancyNumber)`
   *
   * **NOTE:** the `getBirthDate()`, `getBirthPlace()`, `getDeathDate()`, and `getDeathPlace()` person convenience functions
   * are available only if the `components` parameter is set to `['personDetails']`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Ancestry_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/gt726/ editable example}
   *
   * @param {String} id of the person
   * @param {Number=} generations number of generations to retrieve (max 8)
   * @param {String=} spouseId spouse id
   * @param {Array=} components set to `['personDetails']` if you want to include full person objects for each ancestor
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the ancestry
   */
  FamilySearch.getAncestry = function(id, generations, spouseId, components, opts) {
    var args = helpers.getOptionalArgs(Array.prototype.slice.call(arguments, 1), [helpers.isNumber, helpers.isString, helpers.isArray, helpers.isObject]);
    generations = args[0]; spouseId = args[1]; components = args[2]; opts = args[3];
    var personDetails = helpers.isArray(components) && components.indexOf('personDetails') >= 0 ? true : '';

    return plumbing.get('/platform/tree/ancestry', helpers.removeEmptyProperties({
      'person': id,
      'generations': generations,
      'spouse': spouseId,
      'personDetails': personDetails}),
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
      exists:        function(num) { return !!helpers.findOrEmpty(this.persons, matchPersonNum(numberLabel, num)).id; },
      getPerson:     function(num) { return helpers.findOrEmpty(this.persons, matchPersonNum(numberLabel, num)); }
    };
  }

  function matchPersonNum(numberLabel, num) {
    return function(p) {
      /*jshint eqeqeq:false */
      return p.display[numberLabel] == num; // == so users can pass in either numbers or strings for ascendancy numbers
    };
  }

  //noinspection JSUnusedLocalSymbols
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
   * @param {Number=} generations number of generations to retrieve (max 2)
   * @param {String=} spouseId spouse id
   * @param {Array=} components currently not used
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the descendancy
   */
  FamilySearch.getDescendancy = function(id, generations, spouseId, components, opts) {
    return plumbing.get('/platform/tree/descendancy', helpers.removeEmptyProperties({
      'person': id,
      'generations': generations,
      'spouse': spouseId}),
      {}, opts,
      helpers.compose(
        helpers.objectExtender(pedigreeConvenienceFunctionGenerator('descendancyNumber')),
        person.personExtender,
        helpers.objectExtender({getDescendancyNumber: function() { return this.display.descendancyNumber; }}, person.personExtensionPointGetter)
      ));
  };
});