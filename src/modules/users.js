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

 *
 * @description
 * Get the current user with the following convenience function
 *
 * - `getUser()` - get the {@link user.types:constructor.User User} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/users/Current_User_resource FamilySearch API Docs}
 *
 *
 * @return {Object} a promise for the current user response
 */
FS.prototype.getCurrentUser = function() {
  var self = this;
  return self.plumbing.getCollectionUrl('FSFT', 'current-user').then(function(url) {
    return self.plumbing.get(url);
  }).then(function(response){
    utils.forEach(response.getData().users, function(user, index, obj){
      obj[index] = self.createUser(user);
    });
    response.getUser = function() { return maybe(response.getData().users)[0]; };
    return response;
  });
};

/**
 * @ngdoc function
 * @name user.functions:getAgent

 *
 * @description
 * Get information about the specified agent (contributor)
 * The response includes the following convenience function
 *
 * - `getAgent()` - get the {@link user.types:constructor.Agent Agent} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the agent (contributor)
 */
FS.prototype.getAgent = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    utils.forEach(response.getData().agents, function(agent, index, obj){
      obj[index] = self.createAgent(agent);
    });
    return utils.extend(response, {
      getAgent: function() { return maybe(response.getData().agents)[0]; }
    });
  });
};

/**
 * @ngdoc function
 * @name user.functions:getMultiAgent

 *
 * @description
 * Get multiple agents at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
 *
 *
 * @param {Array} urls an array of full URLs of the agents (contributors) to read
 * @return {Object} promise that is fulfilled when all of the agents have been read,
 * returning a map of agent id to {@link user.functions:getAgent getAgent} response
 */
FS.prototype.getMultiAgent = function(urls, params) {
  var self = this,
      promises = [],
      responses = {};
  utils.forEach(urls, function(url) {
    promises.push(self.getAgent(url, params).then(function(response){
      responses[url] = response;
    }));
  });
  return Promise.all(promises).then(function(){
    return responses;
  });
};
