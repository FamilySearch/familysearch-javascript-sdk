var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**********************************/
/**
 * @ngdoc function
 * @name discussions.types:constructor.Discussion
 * @description
 *
 * Discussion
 *
 * @param {Object=} data an object with optional attributes {title, details}
 **********************************/

// TODO consider disallowing $save()'ing or $delete()'ing discussions
 
var Discussion = FS.Discussion = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

FS.prototype.createDiscussion = function(data){
  return new Discussion(this, data);
};

Discussion.prototype = {
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
   * @return {Number} timestamp in millis
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Discussion#modified
   * @propertyOf discussions.types:constructor.Discussion
   * @return {Number} timestamp in millis
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Discussion#numberOfComments
   * @propertyOf discussions.types:constructor.Discussion
   * @return {Number} number of comments
   */

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$getDiscussionUrl
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @return {String} URL of this discussion
   */
  $getDiscussionUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).discussion).href); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$getCommentsUrl
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @return {String} URL of the comments endpoint - pass into {@link discussions.functions:getDiscussionComments getDiscussionComments} for details
   */
  $getCommentsUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).comments).href); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$getComments
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @return {Object} promise for the {@link discussions.functions:getDiscussionComments getDiscussionComments} response
   */
  $getComments: function() { return this.$client.getDiscussionComments(this.$getCommentsUrl()); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$getAgentId
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @return {String} id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentId: function() { return maybe(this.contributor).resourceId; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$getAgentUrl
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @return {String} URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentUrl: function() { return this.$helpers.removeAccessToken(maybe(this.contributor).resource); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$getAgent
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  $getAgent: function() { return this.$client.getAgent(this.$getAgentUrl() || this.$getAgentId()); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$save
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @description
   * Create a new discussion (if this discussion does not have an id) or update the existing discussion
   *
   * {@link http://jsfiddle.net/DallanQ/t6Yh2/ editable example}
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @param {boolean=} refresh true to read the discussion after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the discussion id, which is fulfilled after the discussion has been updated,
   * and if refresh is true, after the discussion has been read.
   */
  $save: function(changeMessage, refresh, opts) {
    var self = this;
    var promise = self.$helpers.chainHttpPromises(
      self.id ? self.$plumbing.getUrl('discussion-template', null, {did: self.id}) : self.$plumbing.getUrl('discussions'),
      function(url) {
        return self.$plumbing.post(url, { discussions: [ self ] }, {'Content-Type' : 'application/x-fs-v1+json'}, opts, function(data, promise) {
          // x-entity-id and location headers are not set on update, only on create
          return self.id || promise.getResponseHeader('X-ENTITY-ID');
        });
      });
    var returnedPromise = promise.then(function(did) {
      self.$helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
      if (refresh) {
        // re-read the discussion and set this object's properties from response
        return self.$client.getDiscussion(did, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getDiscussion());
          return did;
        });
      }
      else {
        return did;
      }
    });
    return returnedPromise;
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Discussion#$delete
   * @methodOf discussions.types:constructor.Discussion
   * @function
   * @description delete this discussion - see {@link discussions.functions:deleteDiscussion deleteDiscussion}
   *
   * __NOTE__ if you delete a discussion, it's up to you to delete the corresponding Discussion Refs
   * Since there is no way to tell which people a discussion has been linked to, your best best is to
   * attach a discussion to a single person and to delete the discussion when you delete the discussion-reference
   * FamilySearch is aware of this issue but hasn't committed to a fix.
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the discussion id
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteDiscussion(this.$getDiscussionUrl() || this.id, changeMessage, opts);
  }

};