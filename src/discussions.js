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
   * @name discussions.functions:getPersonDiscussionReferences
   * @function
   *
   * @description
   * Get references to discussions for a person
   * The response includes the following convenience function
   *
   * - `getDiscussionIds()` - get an array of discussion ids from the response; pass the id into `getDiscussion` for more information
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_References_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/kd39K/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonDiscussionReferences = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/discussion-references', params, {}, opts,
      helpers.objectExtender({getDiscussionIds: function() {
        return helpers.map(maybe(maybe(this.persons)[0])['discussion-references'], function(uri) {
          return uri.replace(/^.*\//, '');
        });
      }}));
  };

  /**
   * @ngdoc function
   * @name discussions.functions:getDiscussion
   * @function
   *
   * @description
   * Get information about a discussion
   * The response includes the following convenience functions
   *
   * - `getId()` - discussion id
   * - `getTitle()` - title string
   * - `getDetails()` - details string
   * - `getNumberOfComments()` - number of comments
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/FzWSu/ editable example}
   *
   * @param {String} id of the discussion to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getDiscussion = function(id, params, opts) {
    return plumbing.get('/platform/discussions/discussions/'+encodeURI(id), params, {}, opts,
      helpers.objectExtender(discussionConvenienceFunctions));
  };

  var discussionConvenienceFunctions = {
    getId:               function() { return maybe(maybe(this.discussions)[0]).id; },
    getTitle:            function() { return maybe(maybe(this.discussions)[0]).title; },
    getDetails:          function() { return maybe(maybe(this.discussions)[0]).details; },
    getNumberOfComments: function() { return maybe(maybe(this.discussions)[0]).numberOfComments; }
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
   * - `getComments()` - get the array of comments from the response; each comment has an `id` and `text`
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Comments_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/b56hz/ editable example}
   *
   * @param {String} id of the discussion to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getComments = function(id, params, opts) {
    return plumbing.get('/platform/discussions/discussions/'+encodeURI(id)+'/comments', params, {}, opts,
      helpers.objectExtender({getComments: function() { return maybe(maybe(this.discussions)[0]).comments || []; }}));
  };

  return exports;
});
