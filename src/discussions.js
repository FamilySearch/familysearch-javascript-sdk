define([
  'helpers',
  'plumbing',
  'user'
], function(helpers, plumbing, user) {
  /**
   * @ngdoc overview
   * @name discussions
   * @description
   * Functions related to discussions
   *
   * {@link https://familysearch.org/developers/docs/api/resources#discussions FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef
   * @description
   *
   * Reference to a discussion on a person
   */
  var DiscussionRef = exports.DiscussionRef = function() {

  };

  exports.DiscussionRef.prototype = {
    constructor: DiscussionRef,
    // TODO look for resourceId property if it becomes available
    /**
     * @ngdoc function
     * @name discussions.types:constructor.DiscussionRef#$getDiscussionUrl
     * @methodOf discussions.types:constructor.DiscussionRef
     * @function
     * @return {string} URL of the discussion - pass into {@link discussions.functions:getDiscussion getDiscussion} for details
     */
    $getDiscussionUrl: function() {
      return helpers.removeAccessToken(this.resource);
    },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.DiscussionRef#$getDiscussion
     * @methodOf discussions.types:constructor.DiscussionRef
     * @function
     * @return {Object} promise for the {@link discussions.functions:getDiscussion getDiscussion} response
     */
    $getDiscussion: function() {
      return exports.getDiscussion(this.$getDiscussionUrl());
    }
  };

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion
   * @description
   *
   * Discussion
   */
  var Discussion = exports.Discussion = function() {

  };

  exports.Discussion.prototype = {
    constructor: Discussion,
    /**
     * @ngdoc property
     * @name discussions.types:constructor.Discussion#id
     * @propertyOf discussions.types:constructor.Discussion
     * @return {String} Id of the discussion
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Discussion#title
     * @propertyOf discussions.types:constructor.Discussion
     * @return {String} title of the discussion
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Discussion#details
     * @propertyOf discussions.types:constructor.Discussion
     * @return {String} description / text of the discussion
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Discussion#created
     * @propertyOf discussions.types:constructor.Discussion
     * @return {Number} timestamp
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Discussion#modified
     * @propertyOf discussions.types:constructor.Discussion
     * @return {Number} timestamp
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Discussion#numberOfComments
     * @propertyOf discussions.types:constructor.Discussion
     * @return {Number} number of comments
     */

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getCommentsUrl
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {String} URL of the comments endpoint - pass into {@link discussions.functions:getComments getComments} for details
     */
    $getCommentsUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).comments).href); },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getComments
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {Object} promise for the {@link discussions.functions:getComments getComments} response
     */
    $getComments: function() { return exports.getComments(this.$getCommentsUrl()); },

    // TODO check for familysearch fixing the resource and resourceId fields to be the agent id, not the user id

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getAgentId
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {String}  __BROKEN__ id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentId: function() { return maybe(this.contributor).resourceId; },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getAgentUrl
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {String} __BROKEN__ URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentUrl: function() { return helpers.removeAccessToken(maybe(this.contributor).resource); },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getAgent
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {Object} __BROKEN__ promise for the {@link user.functions:getAgent getAgent} response
     */
    $getAgent: function() { return user.getAgent(this.$getAgentUrl()); }
  };

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment
   * @description
   *
   * Comment on a discussion
   */
  var Comment = exports.Comment = function() {

  };

  exports.Comment.prototype = {
    constructor: Comment,
    /**
     * @ngdoc property
     * @name discussions.types:constructor.Comment#id
     * @propertyOf discussions.types:constructor.Comment
     * @return {String} Id of the comment
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Comment#text
     * @propertyOf discussions.types:constructor.Comment
     * @return {String} text of the comment
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Comment#created
     * @propertyOf discussions.types:constructor.Comment
     * @return {Number} timestamp
     */

    // TODO check for familysearch fixing the resource and resourceId fields to be the agent id, not the user id

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Comment#$getAgentId
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @return {String}  __BROKEN__ id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentId: function() { return maybe(this.contributor).resourceId; },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Comment#$getAgentUrl
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @return {String} __BROKEN__ URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentUrl: function() { return helpers.removeAccessToken(maybe(this.contributor).resource); },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Comment#$getAgent
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @return {Object} __BROKEN__ promise for the {@link user.functions:getAgent getAgent} response
     */
    $getAgent: function() { return user.getAgent(this.$getAgentUrl()); }
  };

  /**
   * @ngdoc function
   * @name discussions.functions:getPersonDiscussionRefs
   * @function
   *
   * @description
   * Get references to discussions for a person
   * The response includes the following convenience function
   *
   * - `getDiscussionRefs()` - get an array of {@link discussions.types:constructor.DiscussionRef DiscussionRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/kd39K/ editable example}
   *
   * @param {String} pid id of the person to read or full URL of the person-discussion-references endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonDiscussionRefs = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-discussion-references-template', pid, {pid: pid}),
      function(url) {
        // TODO remove discussion-reference-json-fix header when it becomes standard
        return plumbing.get(url, params,
          {'Accept': 'application/x-fs-v1+json', 'X-FS-Feature-Tag': 'discussion-reference-json-fix'}, opts,
          helpers.compose(
            helpers.objectExtender({getDiscussionRefs: function() { return maybe(maybe(this.persons)[0])['discussion-references'] || []; }}),
            helpers.constructorSetter(DiscussionRef, 'discussion-references', function(response) {
              return maybe(maybe(response).persons)[0];
            })
          ));
      });
  };

  /**
   * @ngdoc function
   * @name discussions.functions:getDiscussion
   * @function
   *
   * @description
   * Get information about a discussion
   * The response includes the following convenience function
   *
   * - `getDiscussion()` - get the {@link discussions.types:constructor.Discussion Discussion} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/FzWSu/ editable example}
   *
   * @param {String} did id or full URL of the discussion to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getDiscussion = function(did, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('discussion-template', did, {did: did}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getDiscussion: function() { return maybe(this.discussions)[0]; }}),
            helpers.constructorSetter(Discussion, 'discussions')
          ));
      });
  };

  /**
   * @ngdoc function
   * @name discussions.functions:getMultiDiscussion
   * @function
   *
   * @description
   * Get multiple discussions at once by requesting them in parallel
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/7GMBT/ editable example}
   *
   * @param {string[]|DiscussionRef[]} dids id's, full URLs, or {@link discussions.types:constructor.DiscussionRef DiscussionRefs} of the discussions
   * @param {Object=} params pass to getDiscussion currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the discussions have been read,
   * returning a map of discussion id or URL to {@link discussions.functions:getDiscussion getDiscussion} response
   */
  exports.getMultiDiscussion = function(dids, params, opts) {
    var promises = {};
    helpers.forEach(dids, function(did) {
      var key, url;
      if (did instanceof DiscussionRef) {
        url = did.$getDiscussionUrl();
        // TODO use resourceId when it becomes available
        key = url;
      }
      else {
        url = did;
        key = did;
      }
      promises[key] = exports.getDiscussion(url, params, opts);
    });
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name discussions.functions:getComments
   * @function
   *
   * @description
   * Get comments for a discussion
   * The response includes the following convenience function
   *
   * - `getComments()` - get an array of {@link discussions.types:constructor.Comment Comments} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Comments_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/b56hz/ editable example}
   *
   * @param {String} did of the discussion or full URL of the discussion-comments endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getComments = function(did, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('discussion-comments-template', did, {did: did}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getComments: function() { return maybe(maybe(this.discussions)[0]).comments || []; }}),
            helpers.constructorSetter(Comment, 'comments', function(response) {
              return maybe(maybe(response).discussions)[0];
            })
          ));
      });
  };

  return exports;
});
