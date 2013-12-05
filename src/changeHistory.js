define([
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name changeHistory
   * @description
   * Functions related to change histories
   *
   * {@link https://familysearch.org/developers/docs/api/resources#change-history FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name changeHistory.functions:getPersonChangeHistory
   * @function
   *
   * @description
   * Get change history for a person
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of changes from the response; each change has the following convenience functions
   *
   * ###Change convenience Functions
   *
   * - `getId()` - id of the change
   * - `getContributorNames()` array of contributor name strings
   * - `getTitle()` - title string
   * - `getUpdatedTimestamp()` - timestamp
   * - `getChangeReason()` - string reason for change
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ// editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonChangeHistory = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/changes', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getChanges: function() {
          return this.entries || [];
        }}),
        helpers.objectExtender(changeHistoryConvenienceFunctions, function(response) {
          return response.entries;
        })
      ));
  };

  var changeHistoryConvenienceFunctions = {
    getId:               function() { return this.id; },
    getContributorNames: function() { return helpers.map(this.contributors, function(contributor) {
        return contributor.name;
      }); },
    getTitle:            function() { return this.title; },
    getUpdatedTimestamp: function() { return this.updated; },
    getChangeReason:     function() { return maybe(maybe(this.changeInfo)[0]).reason; }
  };

  // TODO getChildAndParentsRelationshipChangeHistory
  // TODO getCoupleRelationshipChangeHistory

  return exports;
});
