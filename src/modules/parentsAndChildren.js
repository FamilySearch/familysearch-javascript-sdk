var FS = require('../FamilySearch'),
    utils = require('../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc overview
 * @name parentsAndChildren
 * @description
 * Functions related to parents and children relationships
 *
 * {@link https://familysearch.org/developers/docs/api/resources#parents-and-children FamilySearch API Docs}
 */

var childAndParentsConvenienceFunctions = {
  getRelationship: function() { return maybe(this.getData().childAndParentsRelationships)[0]; },
  getPerson:       function(id) { return utils.find(this.getData().persons, {id: id}); }
};

/**
 * @ngdoc function
 * @name parentsAndChildren.functions:getChildAndParents

 *
 * @description
 * Get information about a child and parents relationship.
 * The response includes the following convenience functions
 *
 * - `getRelationship()` - a {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents} relationship
 * - `getPerson(pid)` - if the `persons` parameter has been set, this function will return a
 * {@link person.types:constructor.Person Person} for a person id in the relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/swk1pmo7/10/ Editable Example}
 *
 * @param {String} url full URL of the child-and-parents relationship
 * @param {Object=} params set `persons` true to return a person object for each person in the relationship,
 * which you can access using the `getPerson(id)` convenience function.
 * @return {Object} promise for the response
 */
FS.prototype.getChildAndParents = function(url, params) {
  var self = this;
  return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    utils.forEach(response.getData().persons, function(person, index, obj){
      obj[index] = self.createPerson(person);
    });
    utils.forEach(response.getData().childAndParentsRelationships, function(rel, index, obj){
      obj[index] = self.createChildAndParents(rel);
    });
    return utils.extend(response, childAndParentsConvenienceFunctions);
  });
};

/**
 * @ngdoc function
 * @name parentsAndChildren.functions:deleteChildAndParents

 *
 * @description
 * Delete the specified relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/hguctxyv/1/ Editable Example}
 *
 * @param {string} url full URL of the child-and-parents relationship
 * @param {string} changeMessage reason for the deletion
 * @return {Object} promise for the response
 */
FS.prototype.deleteChildAndParents = function(url, changeMessage) {
  var self = this;
  var headers = {'Content-Type': 'application/x-fs-v1+json'};
  if (changeMessage) {
    headers['X-Reason'] = changeMessage;
  }
  return self.plumbing.del(url, headers);
};

/**
 * @ngdoc function
 * @name parentsAndChildren.functions:restoreChildAndParents

 *
 * @description
 * Restore a deleted child and parents relationship
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Restore_resource FamilySearch API Docs}
 * 
 * {@link http://jsfiddle.net/3n4ro8jd/1/ Editable Example}
 *
 * @param {string} url full URL of the child-and-parents relationship
 * @param {string} changeMessage reason for the deletion
 * @return {Object} promise for the response
 */
FS.prototype.restoreChildAndParents = function(url) {
  return this.plumbing.post(url, null, {'Content-Type': 'application/x-fs-v1+json'});
};
