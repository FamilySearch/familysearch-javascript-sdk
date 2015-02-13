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
FS.prototype.getCouple = function(crid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender(coupleConvenienceFunctions),
          function(response){
            utils.forEach(response.persons, function(person, index, obj){
              obj[index] = self.createPerson(person);
            });
            utils.forEach(response.relationships, function(rel, index, obj){
              obj[index] = self.createCouple(rel);
            });
            return response;
          }
        ));
    });
};

var coupleConvenienceFunctions = {
  getRelationship: function() { return maybe(this.relationships)[0]; },
  getPerson:       function(id) { return utils.find(this.persons, {id: id}); }
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
FS.prototype.deleteCouple = function(crid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.del(url, changeMessage ? {'X-Reason' : changeMessage} : {}, opts, function() {
        return crid;
      });
    }
  );
};
