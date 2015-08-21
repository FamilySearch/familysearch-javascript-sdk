var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name discussions.types:constructor.Discussion
 * @description
 *
 * Discussion
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */ 
var Discussion = FS.Discussion = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name discussions.functions:createDiscussion
 * @param {Object} data [Discussion](https://familysearch.org/developers/docs/api/fs/Discussion_json) data
 * @return {Object} {@link discussions.types:constructor.Discussion Discussion}
 * @description Create a {@link discussions.types:constructor.Discussion Discussion} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createDiscussion = function(data){
  return new Discussion(this, data);
};

// TODO consider disallowing save()'ing or delete()'ing discussions

Discussion.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Discussion,
  
  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getId
   * @methodOf discussions.types:constructor.Discussion
   * @return {String} Id of the discussion
   */

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getTitle
   * @methodOf discussions.types:constructor.Discussion
   * @return {String} title of the discussion
   */
  getTitle: function(){ return this.data.title; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getDetails
   * @methodOf discussions.types:constructor.Discussion
   * @return {String} description / text of the discussion
   */
  getDetails: function(){ return this.data.details; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getCreatedTimestamp
   * @methodOf discussions.types:constructor.Discussion
   * @return {Number} timestamp in millis
   */
  getCreatedTimestamp: function(){ return this.data.created; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getModifiedTimestamp
   * @methodOf discussions.types:constructor.Discussion
   * @return {Number} timestamp in millis
   */
  getModifiedTimestamp: function(){ return this.data.modified; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getNumberOfComments
   * @methodOf discussions.types:constructor.Discussion
   * @return {Number} number of comments
   */
  getNumberOfComments: function(){ return this.data.numberOfComments; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getDiscussionUrl
   * @methodOf discussions.types:constructor.Discussion

   * @return {String} URL of this discussion
   */
  getDiscussionUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('discussion')).href); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getCommentsUrl
   * @methodOf discussions.types:constructor.Discussion

   * @return {String} URL of the comments endpoint - pass into {@link discussions.functions:getDiscussionComments getDiscussionComments} for details
   */
  getCommentsUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('comments')).href); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getComments
   * @methodOf discussions.types:constructor.Discussion

   * @return {Object} promise for the {@link discussions.functions:getDiscussionComments getDiscussionComments} response
   */
  getComments: function() { return this.client.getDiscussionComments(this.getCommentsUrl()); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getAgentId
   * @methodOf discussions.types:constructor.Discussion

   * @return {String} id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentId: function() { return maybe(this.data.contributor).resourceId; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getAgentUrl
   * @methodOf discussions.types:constructor.Discussion

   * @return {String} URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  getAgentUrl: function() { return this.helpers.removeAccessToken(maybe(this.data.contributor).resource); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#getAgent
   * @methodOf discussions.types:constructor.Discussion

   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  getAgent: function() { return this.client.getAgent(this.getAgentUrl()); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#save
   * @methodOf discussions.types:constructor.Discussion

   * @description
   * Create a new discussion (if this discussion does not have an id) or update the existing discussion
   *
   * {@link http://jsfiddle.net/fsy9z6kx/1/ Editable Example}
   *
   * @return {Object} promise of the discussion id, which is fulfilled after the discussion has been updated or,
   * if refresh is true, after the discussion has been read.
   */
  save: function() {
    var self = this,
        urlPromise = self.getDiscussionUrl() ? Promise.resolve(self.getDiscussionUrl()) : self.plumbing.getCollectionUrl('FSDF', 'discussions');
    return urlPromise.then(function(url){
        return self.plumbing.post(url, { discussions: [ self ] }, {'Content-Type' : 'application/x-fs-v1+json'});
    }).then(function(response){
      self.updateFromResponse(response, 'discussion');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#delete
   * @methodOf discussions.types:constructor.Discussion

   * @description delete this discussion - see {@link discussions.functions:deleteDiscussion deleteDiscussion}
   *
   * __NOTE__ if you delete a discussion, it's up to you to delete the corresponding Discussion Refs
   * Since there is no way to tell which people a discussion has been linked to, your best best is to
   * attach a discussion to a single person and to delete the discussion when you delete the discussion-reference
   * FamilySearch is aware of this issue but hasn't committed to a fix.
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @return {Object} promise for the discussion id
   */
  delete: function(changeMessage) {
    return this.client.deleteDiscussion(this.getDiscussionUrl(), changeMessage);
  }

});