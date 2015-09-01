var FS = require('../FamilySearch'),
    utils = require('../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name spouses
 * @description
 * Functions related to spouse relationships
 *
 * {@link https://familysearch.org/developers/docs/api/resources#spouses FamilySearch API Docs}
 */

var coupleConvenienceFunctions = {
  getRelationship: function() { return maybe(this.getData().relationships)[0]; },
  getPerson:       function(id) { 
    return utils.find(this.getData().persons, function(person){
      return person.getId() === id;
    }); 
  }
};

/**
 * @ngdoc function
 * @name spouses.functions:getCouple

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
 *
 * @param {String} url full URL of the couple relationship
 * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
 * which you can access using the `getPerson(id)` convenience function.
 * @return {Object} promise for the response
 */
FS.prototype.getCouple = function(url, params) {
  var self = this;
  return self.plumbing.get(url, params).then(function(response){
    utils.forEach(maybe(response.getData()).persons, function(person, index, obj){
      obj[index] = self.createPerson(person);
    });
    utils.forEach(maybe(response.getData()).relationships, function(rel, index, obj){
      obj[index] = self.createCouple(rel);
    });
    return utils.extend(response, coupleConvenienceFunctions);
  });
};

/**
 * @ngdoc function
 * @name spouses.functions:deleteCouple

 *
 * @description
 * Delete the specified relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the couple relationship
 * @param {string} changeMessage reason for the deletion
 * @return {Object} promise for the response
 */
FS.prototype.deleteCouple = function(url, changeMessage) {
  return this.plumbing.del(url, changeMessage ? {'X-Reason' : changeMessage} : {});
};

/**
 * @ngdoc function
 * @name spouses.functions:restoreCouple

 *
 * @description
 * Restore a deleted couple relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Restore_resource FamilySearch API Docs}
 * 
 *
 * @param {string} crid id or full URL of the couple relationship
 * @return {Object} promise for the response
 */
FS.prototype.restoreCouple = function(url) {
  return this.plumbing.post(url, null, {'Content-Type': 'application/x-fs-v1+json'});
};
