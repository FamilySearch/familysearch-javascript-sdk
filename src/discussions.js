define([
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
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
   * @name discussions.functions:getPersonDiscussionRefs
   * @function
   *
   * @description
   * Get references to discussions for a person
   * The response includes the following convenience function
   *
   * - `getDiscussionIds()` - get an array of discussion ids from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/kd39K/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonDiscussionRefs = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/discussion-references', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.objectExtender({getDiscussionIds: function() {
        return helpers.map(maybe(maybe(this.persons)[0])['discussion-references'], function(url) {
          return url ? url.replace(/^.*\//, '').replace(/\?.*$/, '') : url; // TODO how else to get the discussion id?
        });
      }}));
  };

  /**
   * @ngdoc function
   * @name discussions.types:type.Discussion
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
     * @name discussions.types:type.Discussion#id
     * @propertyOf discussions.types:type.Discussion
     * @return {String} Id of the discussion
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Discussion#title
     * @propertyOf discussions.types:type.Discussion
     * @return {String} title of the discussion
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Discussion#details
     * @propertyOf discussions.types:type.Discussion
     * @return {String} description / text of the discussion
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Discussion#created
     * @propertyOf discussions.types:type.Discussion
     * @return {Number} timestamp
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Discussion#modified
     * @propertyOf discussions.types:type.Discussion
     * @return {Number} timestamp
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Discussion#numberOfComments
     * @propertyOf discussions.types:type.Discussion
     * @return {Number} number of comments
     */

    /**
     * @ngdoc function
     * @name discussions.types:type.Discussion#getContributorId
     * @methodOf discussions.types:type.Discussion
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(this.contributor).resourceId; }
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
   * - `getDiscussion()` - get the {@link discussions.types:type.Discussion Discussion} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/FzWSu/ editable example}
   *
   * @param {String} did of the discussion to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getDiscussion = function(did, params, opts) {
    return plumbing.get('/platform/discussions/discussions/'+encodeURI(did), params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getDiscussion: function() { return maybe(this.discussions)[0]; }}),
        helpers.constructorSetter(Discussion, 'discussions')
      ));
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
   * @param {Array} dids Ids of the discussions to read
   * @param {Object=} params pass to getDiscussion currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the discussions have been read,
   * returning a map of discussion id to response
   */
  exports.getMultiDiscussion = function(dids, params, opts) {
    var promises = {};
    helpers.forEach(dids, function(did) {
      promises[did] = exports.getDiscussion(did, params, opts);
    });
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name discussions.types:type.Comment
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
     * @name discussions.types:type.Comment#id
     * @propertyOf discussions.types:type.Comment
     * @return {String} Id of the comment
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Comment#text
     * @propertyOf discussions.types:type.Comment
     * @return {String} text of the comment
     */

    /**
     * @ngdoc property
     * @name discussions.types:type.Comment#created
     * @propertyOf discussions.types:type.Comment
     * @return {Number} timestamp
     */

    /**
     * @ngdoc function
     * @name discussions.types:type.Comment#getContributorId
     * @methodOf discussions.types:type.Comment
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(this.contributor).resourceId; }
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
   * - `getComments()` - get an array of {@link discussions.types:type.Comment Comments} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Comments_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/b56hz/ editable example}
   *
   * @param {String} did of the discussion to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getComments = function(did, params, opts) {
    return plumbing.get('/platform/discussions/discussions/'+encodeURI(did)+'/comments', params, {'Accept': 'application/x-fs-v1+json'}, opts,
      helpers.compose(
        helpers.objectExtender({getComments: function() { return maybe(maybe(this.discussions)[0]).comments || []; }}),
        helpers.constructorSetter(Comment, 'comments', function(response) {
          return maybe(maybe(response).discussions)[0];
        })
      ));
  };

  return exports;
});
