var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
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
 * {@link http://jsfiddle.net/u7esw4u3/169/ Editable Example}
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
          function(response){
            utils.forEach(response.users, function(user, index, obj){
              obj[index] = self.createUser(user);
            });
            return response;
          }
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
 * {@link http://jsfiddle.net/dcxy9a59/2/ Editable Example}
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
          function(response){
            utils.forEach(response.agents, function(agent, index, obj){
              obj[index] = self.createAgent(agent);
            });
            return response;
          }
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
 * {@link http://jsfiddle.net/88gbgae5/1/ Editable Example}
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
