var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc overview
 * @name changeHistory
 * @description
 * Functions related to change histories
 *
 * {@link https://familysearch.org/developers/docs/api/resources#change-history FamilySearch API Docs}
 */

FS.prototype._changeHistoryResponseMapper = function(){
  var self = this;
  return utils.compose(
    utils.objectExtender({getChanges: function() { return this.entries || []; }}),
    function(response){
      for(var i = 0; i < response.entries.length; i++){
        response.entries[i] = self.createChange(response.entries[i]);
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
FS.prototype.getPersonChanges = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-changes-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self._changeHistoryResponseMapper());
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
FS.prototype.getChildAndParentsChanges = function(caprid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-changes-template', caprid, {caprid: caprid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self._changeHistoryResponseMapper());
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
FS.prototype.getCoupleChanges = function(crid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-changes-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}, opts,
        self._changeHistoryResponseMapper());
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
FS.prototype.restoreChange = function(chid, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('change-restore-template', chid, {chid: chid}),
    function(url) {
      return self.plumbing.post(url, null, {'Content-Type': void 0}, opts, function() { // don't send a Content-Type header
        return chid;
      });
    });
};
