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
   * - `getChanges()` - get the array of changes from the response; each has the following *change convenience functions*
   *
   * ###Change convenience Functions
   *
   * - `getId()` - id of the change
   * - `getContributorName()` name of the contributor
   * - `getTitle()` - title string
   * - `getUpdatedTimestamp()` - timestamp
   * - `getChangeReason()` - string reason for change
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/6SqTH/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonChangeHistory = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/changes', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
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
    getContributorName:  function() { return maybe(maybe(this.contributors)[0]).name; },
    getTitle:            function() { return this.title; },
    getUpdatedTimestamp: function() { return this.updated; },
    getChangeReason:     function() { return maybe(maybe(this.changeInfo)[0]).reason; }
  };

  /**
   * @ngdoc function
   * @name changeHistory.functions:getChildAndParentsChangeHistory
   * @function
   *
   * @description
   * Get change history for a child and parents relationship
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of changes from the response; each has *change convenience functions*
   * as described for {@link changeHistory.functions:getPersonChangeHistory getPersonChangeHistory}
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/Uk6HA/ editable example}
   *
   * @param {String} id of the relationship to read
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsChangeHistory = function(id, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(id)+'/changes', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getChanges: function() {
          return this.entries || [];
        }}),
        helpers.objectExtender(changeHistoryConvenienceFunctions, function(response) {
          return response.entries;
        })
      ));
  };

  /**
   * @ngdoc function
   * @name changeHistory.functions:getCoupleChangeHistory
   * @function
   *
   * @description
   * Get change history for a couple relationship
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of changes from the response; each has *change convenience functions*
   * as described for {@link changeHistory.functions:getPersonChangeHistory getPersonChangeHistory}
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/csG9t/ editable example}
   *
   * @param {String} id of the relationship to read
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleChangeHistory = function(id, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(id)+'/changes', params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getChanges: function() {
          return this.entries || [];
        }}),
        helpers.objectExtender(changeHistoryConvenienceFunctions, function(response) {
          return response.entries;
        })
      ));
  };

  return exports;
});
