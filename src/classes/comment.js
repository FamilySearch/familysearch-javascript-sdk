var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name discussions.types:constructor.Comment
 * @description
 *
 * Comment on a discussion or memory
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */

var Comment = FS.Comment = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name discussions.functions:createComment
 * @param {Object} data [Comment](https://familysearch.org/developers/docs/api/fs/Comment_json) data
 * @return {Object} {@link discussions.types:constructor.Comment Comment}
 * @description Create a {@link discussions.types:constructor.Comment Comment} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createComment = function(data){
  return new Comment(this, data);
};

Comment.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Comment,
  
  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#getId
   * @methodOf discussions.types:constructor.Comment
   * @return {String} Id of the comment
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#getText
   * @methodOf discussions.types:constructor.Comment
   * @return {String} text of the comment
   */
  getText: function(){ return this.data.text; },

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#getCreatedTimestamp
   * @methodOf discussions.types:constructor.Comment
   * @return {Number} timestamp
   */
  getCreatedTimestamp: function(){ return this.data.created; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#getCommentUrl
   * @methodOf discussions.types:constructor.Comment

   * @return {String} URL of this comment; _NOTE_ however, that individual comments cannot be read
   */
  getCommentUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('comment')).href); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#getAgentId
   * @methodOf discussions.types:constructor.Comment

   * @return {String} id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentId: function() { return maybe(this.data.contributor).resourceId; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#getAgentUrl
   * @methodOf discussions.types:constructor.Comment

   * @return {String} URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.contributor).resource); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#getAgent
   * @methodOf discussions.types:constructor.Comment

   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  getAgent: function() { return this.client.getAgent(this.getAgentUrl() || this.getAgentId()); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#save
   * @methodOf discussions.types:constructor.Comment

   * @description
   * Create a new comment or update an existing comment
   *
   * _NOTE_: there's no _refresh_ parameter because it's not possible to read individual comments;
   * however, the comment's id and URL is set when creating a new comment
   *
   *
   * @param {string} url url of the discussion or memory comments list; required for both creating and updating comments; updating is distinguished from creating by the presence of an id on the comment.
   * @return {Object} promise for the response
   */
  save: function(url) {
    var self = this;
    var payload = {discussions: [{ comments: [ self ] }] };
    return self.plumbing.post(url, payload, {'Content-Type' : 'application/x-fs-v1+json'}).then(function(response){
      self.updateFromResponse(response, 'comment');
      return response;  
    });
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#delete
   * @methodOf discussions.types:constructor.Comment

   * @description delete this comment
   * @description delete this comment - see {@link discussions.functions:deleteDiscussionComment deleteDiscussionComment}
   * or {@link memories.functions:deleteMemoryComment deleteMemoryComment}
   * @param {string=} changeMessage change message (currently ignored)
   * @return {Object} promise for the response
   */
  delete: function(url, changeMessage) {
    return this.client.deleteComment(this.getCommentUrl(), changeMessage);
  }

});