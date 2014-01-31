define([
  'helpers',
  'plumbing',
  'user'
], function(helpers, plumbing, user) {
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
   * @name changeHistory.types:constructor.Change
   * @description
   *
   * Change made to a person or relationship
   */
  var Change = exports.Change = function() {

  };

  exports.Change.prototype = {
    constructor: Change,
    /**
     * @ngdoc property
     * @name changeHistory.types:constructor.Change#id
     * @propertyOf changeHistory.types:constructor.Change
     * @return {String} Id of the change
     */

    /**
     * @ngdoc property
     * @name changeHistory.types:constructor.Change#title
     * @propertyOf changeHistory.types:constructor.Change
     * @return {String} title of the change
     */

    /**
     * @ngdoc property
     * @name changeHistory.types:constructor.Change#updated
     * @propertyOf changeHistory.types:constructor.Change
     * @return {Number} timestamp
     */

    /**
     * @ngdoc function
     * @name changeHistory.types:constructor.Change#$getContributorName
     * @methodOf changeHistory.types:constructor.Change
     * @function
     * @return {String} contributor name
     */
    $getContributorName: function() { return maybe(maybe(this.contributors)[0]).name; },

    /**
     * @ngdoc function
     * @name changeHistory.types:constructor.Change#$getChangeReason
     * @methodOf changeHistory.types:constructor.Change
     * @function
     * @return {String} reason for the change
     */
    $getChangeReason: function() { return maybe(maybe(this.changeInfo)[0]).reason; },

    // TODO check for agent id

    /**
     * @ngdoc function
     * @name changeHistory.types:constructor.Change#$getAgentUrl
     * @methodOf changeHistory.types:constructor.Change
     * @function
     * @return {String} URL of the agent - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentUrl: function() { return helpers.removeAccessToken(this.links.agent.href); },

    /**
     * @ngdoc function
     * @name changeHistory.types:constructor.Change#$getAgent
     * @methodOf changeHistory.types:constructor.Change
     * @function
     * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
     */
    $getAgent: function() { return user.getAgent(this.$getAgentUrl()); }
  };

  var changeHistoryResponseMapper = helpers.compose(
      helpers.objectExtender({getChanges: function() { return this.entries || []; }}),
      helpers.constructorSetter(Change, 'entries')
    );

  /**
   * @ngdoc function
   * @name changeHistory.functions:getPersonChanges
   * @function
   *
   * @description
   * Get change history for a person
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/6SqTH/ editable example}
   *
   * @param {String} pid id of the person or full URL of the person changes endpoint
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonChanges = function(pid, params, opts) {
    return plumbing.getUrl('person-changes-template', pid, {pid: pid}).then(function(url) {
      return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        changeHistoryResponseMapper);
    });
  };

  /**
   * @ngdoc function
   * @name changeHistory.functions:getChildAndParentsChanges
   * @function
   *
   * @description
   * Get change history for a child and parents relationship
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/Uk6HA/ editable example}
   *
   * @param {String} caprid id of the child and parents relationship or full URL of the child and parents relationship changes endpoint
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsChanges = function(caprid, params, opts) {
    return plumbing.getUrl('child-and-parents-relationship-changes-template', caprid, {caprid: caprid}).then(function(url) {
      return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        changeHistoryResponseMapper);
    });
  };

  /**
   * @ngdoc function
   * @name changeHistory.functions:getCoupleChanges
   * @function
   *
   * @description
   * Get change history for a couple relationship
   * The response includes the following convenience function
   *
   * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Change_History_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/csG9t/ editable example}
   *
   * @param {String} crid id of the couple relationship to read or full URL of the couple relationship changes endpoint
   * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleChanges = function(crid, params, opts) {
    return plumbing.getUrl('couple-relationship-changes-template', crid, {crid: crid}).then(function(url) {
      return plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        changeHistoryResponseMapper);
    });
  };

  return exports;
});
