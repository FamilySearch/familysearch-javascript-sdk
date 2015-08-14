var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name user.types:constructor.Agent
 * @description
 *
 * An agent is returned from {@link user.functions:getAgent getAgent}.
 * Contributor Ids are agent ids, not user ids.
 */
var Agent = FS.Agent = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name user.functions:createAgent
 * @param {Object} data [Agent](https://familysearch.org/developers/docs/api/gx/Agent_json) data
 * @return {Object} {@link user.types:constructor.Agent Agent}
 * @description Create an {@link user.types:constructor.Agent Agent} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createAgent = function(data){
  return new Agent(this, data);
};

Agent.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  constructor: Agent,
  /**
   * @ngdoc property
   * @name user.types:constructor.Agent#id
   * @propertyOf user.types:constructor.Agent
   * @return {String} Id of the agent
   */

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#$getName
   * @methodOf user.types:constructor.Agent
   * @function
   * @return {String} name of the agent
   */
  $getName: function() { return maybe(maybe(this.names)[0]).value; },

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#$getAccountName
   * @methodOf user.types:constructor.Agent
   * @function
   * @return {String} account / contact name of the agent
   */
  $getAccountName: function() { return maybe(maybe(this.accounts)[0]).accountName; },


  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#$getEmail
   * @methodOf user.types:constructor.Agent
   * @function
   * @return {String} email of the agent
   */
  $getEmail: function() {
    var email = maybe(maybe(this.emails)[0]).resource;
    return email ? email.replace(/^mailto:/,'') : email;
  },

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#$getPhoneNumber
   * @methodOf user.types:constructor.Agent
   * @function
   * @return {String} phone number of the agent
   */
  $getPhoneNumber: function() {
    return maybe(maybe(this.phones)[0]).resource;
  },

  /**
   * @ngdoc function
   * @name user.types:constructor.Agent#$getAddress
   * @methodOf user.types:constructor.Agent
   * @function
   * @return {String} postal address of the agent
   */
  $getAddress: function() {
    return maybe(maybe(this.addresses)[0]).value;
  }
});