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

FS.prototype._changeHistoryResponseMapper = function(response){
  var self = this,
      data = utils.maybe(response.getData());
  for(var i = 0; i < data.entries.length; i++){
    data.entries[i] = self.createChange(data.entries[i]);
  }
  return utils.extend({
    getChanges: function() { 
      return data.entries || []; 
    }
  });
};

/**
 * @ngdoc function
 * @name changeHistory.functions:getPersonChanges

 *
 * @description
 * Get change history for a person
 * The response includes the following convenience function
 *
 * - `getChanges()` - get the array of {@link changeHistory.types:constructor.Change Changes} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Change_History_resource Person Changes API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Change_History_resource Child and Parents Changes API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Change_History_resource Couple Changes API Docs}
 *
 * {@link http://jsfiddle.net/s90nqqLs/1/ Editable Example}
 *
 * @param {String} url full URL of the person changes. child and parent changes, or couple changes endpoint
 * @param {Object=} params: `count` is the number of change entries to return, `from` to return changes following this id
 * @return {Object} promise for the response
 */
FS.prototype.getChanges = function(url, params) {
  var self = this;
  return self.plumbing.get(url, params, {'Accept': 'application/x-gedcomx-atom+json'}).then(function(response){
    return self._changeHistoryResponseMapper(response);
  });
};

/**
 * @ngdoc function
 * @name changeHistory.functions:restoreChange

 *
 * @description
 * Restore the specified change
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Restore_Change_resource}
 *
 * {@link http://jsfiddle.net/xL50x20d/1/ Editable Example}
 *
 * @param {string} url full URL of the restore changes endpoint
 * @return {Object} promise for the response
 */
FS.prototype.restoreChange = function(url) {
  return this.plumbing.post(url, null, {'Content-Type': void 0});
};