var FS = require('./FamilySearch'),
    utils = require('./utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name user
 * @description
 * Functions related to users
 *
 * {@link https://familysearch.org/developers/docs/api/resources#user FamilySearch API Docs}
 */

/**
 * @ngdoc function
 * @name user.types:constructor.User
 * @description
 *
 * User - a user is returned from {@link user.functions:getCurrentUser getCurrentUser};
 * Contributor Ids are agent ids, not user ids.
 */
var User = function() {

};

User.prototype = {
  constructor: User
  /**
   * @ngdoc property
   * @name user.types:constructor.User#id
   * @propertyOf user.types:constructor.User
   * @return {String} Id of the user
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#personId
   * @propertyOf user.types:constructor.User
   * @return {String} id of the {@link person.types:constructor.Person Person} for this user
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#treeUserId
   * @propertyOf user.types:constructor.User
   * @return {String} agent (contributor) id of the user
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#contactName
   * @propertyOf user.types:constructor.User
   * @return {String} contact name
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#displayName
   * @propertyOf user.types:constructor.User
   * @return {String} full display name
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#givenName
   * @propertyOf user.types:constructor.User
   * @return {String} given name
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#familyName
   * @propertyOf user.types:constructor.User
   * @return {String} family name
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#gender
   * @propertyOf user.types:constructor.User
   * @return {String} MALE or FEMALE
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#email
   * @propertyOf user.types:constructor.User
   * @return {String} email address
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#preferredLanguage
   * @propertyOf user.types:constructor.User
   * @return {String} e.g., en
   */
};

/**
 * @ngdoc function
 * @name user.types:constructor.Agent
 * @description
 *
 * An agent is returned from {@link user.functions:getAgent getAgent}.
 * Contributor Ids are agent ids, not user ids.
 */
var Agent = function() {

};

Agent.prototype = {
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
};

/**
 * @ngdoc function
 * @name user.functions:getCurrentUser
 * @function
 *
 * @description
 * Get the current user with the following convenience function
 *
 * - `getUser()` - get the {@link user.types:constructor.User User} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/users/Current_User_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/3NJFM/ editable example}
 *
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} a promise for the current user
 */
FS.prototype.getCurrentUser = function(params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('current-user'),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getUser: function() { return maybe(this.users)[0]; }}),
          utils.constructorSetter(User, 'users')
        ));
    });
};

/**
 * @ngdoc function
 * @name user.functions:getAgent
 * @function
 *
 * @description
 * Get information about the specified agent (contributor)
 * The response includes the following convenience function
 *
 * - `getAgent()` - get the {@link user.types:constructor.Agent Agent} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/BpT8c/ editable example}
 *
 * @param {String} aid id or full URL of the agent (contributor)
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 */
FS.prototype.getAgent = function(aid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('agent-template', aid, {uid: aid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getAgent: function() { return maybe(this.agents)[0]; }}),
          utils.constructorSetter(Agent, 'agents')
        ));
    });
};

/**
 * @ngdoc function
 * @name user.functions:getMultiAgent
 * @function
 *
 * @description
 * Get multiple agents at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/hMhas/ editable example}
 *
 * @param {Array} aids Ids or full URLs of the agents (contributors) to read
 * @param {Object=} params pass to getAgent currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the agents have been read,
 * returning a map of agent id to {@link user.functions:getAgent getAgent} response
 */
FS.prototype.getMultiAgent = function(aids, params, opts) {
  var self = this,
      promises = {};
  utils.forEach(aids, function(aid) {
    promises[aid] = self.getAgent(aid, params, opts);
  });
  return self.helpers.promiseAll(promises);
};

FS.Agent = Agent;
FS.User = User;
