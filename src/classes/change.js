var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name changeHistory.types:constructor.Change
 * @description
 *
 * Change made to a person or relationship
 */
var Change = FS.Change = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name changeHistory.functions:createChange
 * @param {Object} data change data which is an [Entry](https://familysearch.org/developers/docs/api/atom/Entry_json) with a [ChangeInfo](https://familysearch.org/developers/docs/api/fs/ChangeInfo_json) field.
 * @return {Object} {@link changeHistory.types:constructor.Change Change}
 * @description Create a {@link changeHistory.types:constructor.Change Change} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createChange = function(data){
  return new Change(this, data);
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
  $getAgentName: function() { return maybe(maybe(this.contributors)[0]).name; },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$getChangeReason
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @return {String} reason for the change
   */
  $getChangeReason: function() { return maybe(maybe(this.changeInfo)[0]).reason; },

  // TODO check for agent id; also add $getAgentId as option in $getAgent (last checked 12 July 14)

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$getAgentUrl
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @return {String} URL of the agent - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).agent).href); },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$getAgent
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  $getAgent: function() { return this.$client.getAgent(this.$getAgentUrl()); },

  /**
   * @ngdoc function
   * @name changeHistory.types:constructor.Change#$restore
   * @methodOf changeHistory.types:constructor.Change
   * @function
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the {@link changeHistory.functions:restoreChange restoreChange} response
   */
  $restore: function(opts) {
    return this.$client.changeHistory.restoreChange(this.id, opts);
  }

};