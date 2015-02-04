var utils = require('./utils');

/**
 * @ngdoc overview
 * @name changeHistory
 * @description
 * Functions related to change histories
 *
 * {@link https://familysearch.org/developers/docs/api/resources#change-history FamilySearch API Docs}
 */

var ChangeHistory = function(client){
  this.client = client;
  this.helpers = client.helpers;
  this.plumbing = client.plumbing;
};

/**
 * @ngdoc function
 * @name changeHistory.types:constructor.Change
 * @description
 *
 * Change made to a person or relationship
 */
var Change = ChangeHistory.Change = function(client, change) {
  this.client = client;
  this.helpers = client.helpers;
  utils.extend(this, change);
};

Change.prototype = {
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
   * @name changeHistory.types:constructor.Change#$getAgentName
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @return {String} agent (contributor) name
   */
  $getAgentName: function() { return utils.maybe(utils.maybe(this.contributors)[0]).name; },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$getChangeReason
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @return {String} reason for the change
   */
  $getChangeReason: function() { return utils.maybe(utils.maybe(this.changeInfo)[0]).reason; },

  // TODO check for agent id; also add $getAgentId as option in $getAgent (last checked 12 July 14)

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$getAgentUrl
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @return {String} URL of the agent - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentUrl: function() { return this.helpers.removeAccessToken(utils.maybe(utils.maybe(this.links).agent).href); },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$getAgent
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  $getAgent: function() { return this.client.users.getAgent(this.$getAgentUrl()); },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$restore
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the {@link changeHistory.functions:restoreChange restoreChange} response
   */
  $restore: function(opts) {
    return this.client.changeHistory.restoreChange(this.id, opts);
  }

};

ChangeHistory.prototype.changeHistoryResponseMapper = function(){
  var self = this;
  return utils.compose(
    utils.objectExtender({getChanges: function() { return this.entries || []; }}),
    function(response){
      for(var i = 0; i < response.entries.length; i++){
        response.entries[i] = new Change(self.client, response.entries[i]);
      }
      return response;
    }
  )
};

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
ChangeHistory.prototype.getPersonChanges = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-changes-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self.changeHistoryResponseMapper());
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
ChangeHistory.prototype.getChildAndParentsChanges = function(caprid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-changes-template', caprid, {caprid: caprid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self.changeHistoryResponseMapper());
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
ChangeHistory.prototype.getCoupleChanges = function(crid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-changes-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self.changeHistoryResponseMapper());
    });
};

/**
 * @ngdoc function
 * @name changeHistory.functions:restoreChange
 * @function
 *
 * @description
 * Restore the specified change
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Restore_Change_resource}
 *
 * {@link http://jsfiddle.net/DallanQ/JZ29U/ editable example}
 *
 * @param {string} chid change id or full URL of the restore changes endpoint
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the chid
 */
ChangeHistory.prototype.restoreChange = function(chid, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('change-restore-template', chid, {chid: chid}),
    function(url) {
      return self.plumbing.post(url, null, {'Content-Type': void 0}, opts, function() { // don't send a Content-Type header
        return chid;
      });
    });
};

module.exports = ChangeHistory;
