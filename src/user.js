define([
  'globals',
  'helpers',
  'plumbing'
], function(globals, helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name user
   * @description
   * Functions related to users
   *
   * {@link https://familysearch.org/developers/docs/api/resources#user FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name user.functions:getCurrentUser
   * @function
   *
   * @description
   * Get the current user with the following convenience functions
   *
   * - `getContactName()`
   * - `getFullName()`
   * - `getEmail()`
   * - `getId()`
   * - `getTreeUserId()`
   *
   * {@link https://familysearch.org/developers/docs/api/users/Current_User_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/3NJFM/ editable example}
   *
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} a promise for the current user
   */
  exports.getCurrentUser = function(params, opts) {
    return plumbing.get('/platform/users/current', params, {}, opts, helpers.objectExtender(currentUserConvenienceFunctions));
  };

  var currentUserConvenienceFunctions = {
    getContactName: function() { return this.users[0].contactName; },
    getFullName:    function() { return this.users[0].fullName; },
    getEmail:       function() { return this.users[0].email; },
    getId:          function() { return this.users[0].id; },
    getTreeUserId:  function() { return this.users[0].treeUserId; }
  };

  /**
   * @ngdoc function
   * @name user.functions:getCurrentUserPerson
   * @function
   *
   * @description
   * Get the id of the current user person in the tree
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Current_User_Person_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/c4puF/ editable example}
   *
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the (string) id of the current user person
   */
  exports.getCurrentUserPerson = function(params, opts) {
    var promise = plumbing.get('/platform/tree/current-person', params, {}, opts);
    var d = globals.deferredWrapper();
    var returnedPromise = helpers.extendHttpPromise(d.promise, promise);
    promise.then(
      function() {
        handleCurrentUserPersonResponse(d, promise);
      },
      function() {
        // in Chrome, the current person response is expected to fail because it involves a redirect and chrome doesn't
        // re-send the Accept header on a CORS redirect, so the response comes back as XML and jQuery can't parse it.
        // That's ok, because we'll pick up the ID from the Content-Location header
        handleCurrentUserPersonResponse(d, promise);
      });

    return returnedPromise;
  };

  // common code for current user person promise fulfillment and failure
  function handleCurrentUserPersonResponse(d, promise) {
    var id = null;
    // this is the expected result for Node.js because it doesn't follow redirects
    var location = promise.getResponseHeader('Location');
    if (!location) {
      // this is the expected result for browsers because they follow redirects
      // NOTE: Chrome doesn't re-send the accept header on CORS redirect requests, so the request fails because we can't
      // parse the returned XML into JSON. We still get a Content-Location header though.
      location = promise.getResponseHeader('Content-Location');
    }

    if (location) {
      var matchResult = location.match(/\/persons\/([^?]*)/);
      if (matchResult) {
        id = matchResult[1];
      }
    }

    if (id) {
      d.resolve(id);
    }
    else {
      d.reject('not found');
    }
  }

  /**
   * @ngdoc function
   * @name user.functions:getAgent
   * @function
   *
   * @description
   * Get information about the specified agent (contributor)
   * The response includes the following convenience functions
   *
   * - `getId()`
   * - `getName()`
   * - `getAccountName()`
   * - `getEmail()`
   *
   * {@link https://familysearch.org/developers/docs/api/users/Agent_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/BpT8c/ editable example}
   *
   * @param {String} id of the contributor; e.g., tree user id
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   */
  exports.getAgent = function(id, params, opts) {
    return plumbing.get('/platform/users/agents/'+encodeURI(id), params, {}, opts, helpers.objectExtender(agentConvenienceFunctions));
  };

  var agentConvenienceFunctions = {
    getId:          function() { return maybe(maybe(this.agents)[0]).id; },
    getName:        function() { return maybe(maybe(maybe(maybe(this.agents)[0]).names)[0]).value; },
    getAccountName: function() { return maybe(maybe(maybe(maybe(this.agents)[0]).accounts)[0]).accountName; },
    getEmail:       function() {
      var email = maybe(maybe(maybe(maybe(this.agents)[0]).emails)[0]).resource;
      return email ? email.replace(/^mailto:/,'') : email;
    }
  };

  return exports;
});
