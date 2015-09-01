var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc overview
 * @name pedigree
 * @description
 * Get someone's ancestry or descendancy
 *
 * {@link https://familysearch.org/developers/docs/api/resources#pedigree FamilySearch API Docs}
 */

/**
 * Generate ancestry or descendancy convenience functions
 *
 * @param numberLabel ascendancyNumber or descendancyNumber
 * @returns {{getPersons: Function, exists: Function, getPerson: Function}}
 */
function pedigreeConvenienceFunctionGenerator(numberLabel) {
  return {
    getPersons:    function()    { return maybe(this.getData()).persons; },
    exists:        function(num) { return !!maybe(maybe(utils.find(maybe(this.getData()).persons, matchPersonNum(numberLabel, num))).data).id; },
    getPerson:     function(num) { return utils.find(maybe(this.getData()).persons, matchPersonNum(numberLabel, num)); }
  };
}

function matchPersonNum(numberLabel, num) {
  return function(p) {
    /*jshint eqeqeq:false */
    return p.getDisplay()[numberLabel] == num; // == so users can pass in either numbers or strings for ascendancy numbers
  };
}

/**
 * @ngdoc function
 * @name pedigree.functions:getAncestry

 *
 * @description
 * Get the ancestors of a specified person and optionally a specified spouse with the following convenience functions
 *
 * - `getPersons()` - return an array of {@link person.types:constructor.Person Persons}
 * - `getPerson(ascendancyNumber)` - return a {@link person.types:constructor.Person Person}
 * - `exists(ascendancyNumber)` - return true if a person with ascendancy number exists
 * - `getDescendant(descendancyNumber)` - return a {@link person.types:constructor.Person Person} if the descendants parameter is true
 * - `existsDescendant(ascendancyNumber)` - return true if a person with descendancy number exists if the descendants parameter is true
 *
 * ### Notes
 *
 * * Each Person object has an additional `getAscendancyNumber()` function that returns the person's ascendancy number,
 * and if the descendants parameter is true, a getDescendancyNumber() function that returns the person's descendancy number
 * * Some information on the Person objects is available only if `params` includes `personDetails`
 * * If `params` includes `marriageDetails`, then `person.display` includes `marriageDate` and `marriagePlace`.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Ancestry_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @param {Object=} params includes `generations` to retrieve (max 8),
 * `spouse` id to get ancestry of person and spouse,
 * `personDetails` set to true to retrieve full person objects for each ancestor,
 * `descendants` set to true to retrieve one generation of descendants
 * @return {Object} promise for the ancestry response
 */
FS.prototype.getAncestry = function(pid, params) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSFT', 'ancestry-query').then(function(url) {
    return self.plumbing.get(url, utils.extend({'person': pid}, params));
  }).then(function(response){
    var data = maybe(response.getData());
    
    utils.forEach(data.persons, function(person, index, obj){
      obj[index] = self.createPerson(person);
    });
    
    // Add getAscendancyNumber method to persons
    utils.forEach(data.persons, function(person){
      person.getAscendancyNumber = function() { 
        return this.data.display.ascendancyNumber; 
      };
    });
    
    // Add getDescendancyNumber method to persons
    // and other helpers to the response if the descendants were requested
    if(!!params && !!params.descendants){
      utils.forEach(data.persons, function(person){
        person.getDescendancyNumber = function() { 
          return this.data.display.descendancyNumber; 
        };
      });
      
      utils.extend(response, {
        getDescendant:    function(num) { return utils.find(data.persons, matchPersonNum('descendancyNumber', num)); },
        existsDescendant: function(num) { return !!maybe(utils.find(data.persons, matchPersonNum('descendancyNumber', num))).id; }
      });
    }
    
    return utils.extend(response, pedigreeConvenienceFunctionGenerator('ascendancyNumber'));
  });
};

/**
 * @ngdoc function
 * @name pedigree.functions:getDescendancy

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
 * * Some information on the Person objects is available only if `params` includes `personDetails`
 * * If `params` includes `marriageDetails`, then `person.display` includes `marriageDate` and `marriagePlace`.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Descendancy_resource FamilySearch API Docs}
 *
 *
 * @param {string} pid id of the person
 * @param {Object=} params includes
 * `generations` to retrieve max 2,
 * `spouse` id to get descendency of person and spouse (set to null to get descendants of unknown spouse),
 * `marriageDetails` set to true to provide marriage details, and
 * `personDetails` set to true to provide person details.
 * @return {Object} promise for the descendancy
 */
FS.prototype.getDescendancy = function(pid, params) {
  var self = this;
  // descendancy query is not yet available (14 August 2015) so it's hard-coded for now
  // return self.plumbing.getCollectionUrl('FSFT', 'descendancy-query'),
  return Promise.resolve(self.helpers.getAPIServerUrl('/platform/tree/descendancy')).then(function(url) {
    return self.plumbing.get(url, utils.extend({'person': pid}, params));
  }).then(function(response){
    var data = maybe(response.getData());
    utils.forEach(data.persons, function(person, index, obj){
      obj[index] = self.createPerson(person);
      obj[index].getDescendancyNumber = function() { return this.data.display.descendancyNumber; };
    });
    return utils.extend(response, pedigreeConvenienceFunctionGenerator('descendancyNumber'));
  });
};
