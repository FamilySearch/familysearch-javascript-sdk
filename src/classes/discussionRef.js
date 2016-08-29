var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name discussions.types:constructor.DiscussionRef
 * @description
 *
 * Reference to a discussion on a person.
 * To create a new discussion reference, you must set personId and discussion.
 * _NOTE_: discussion references cannot be updated. They can only be created or deleted.
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object
 * _discussion_ can be a {@link discussions.types:constructor.Discussion Discussion} or a discussion URL or a discussion id
 */
var DiscussionRef = FS.DiscussionRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
  if (data && data.discussion) {
    //noinspection JSUnresolvedFunction
    this.setDiscussion(data.discussion);
    delete data.discussion;
  }
};

/**
 * @ngdoc function
 * @name discussions.functions:createDiscussionRef
 * @param {Object} data [DiscussionReference](https://familysearch.org/developers/docs/api/fs/DiscussionReference_json) data
 * @return {Object} {@link discussions.types:constructor.DiscussionRef DiscussionRef}
 * @description Create a {@link discussions.types:constructor.DiscussionRef DiscussionRef} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createDiscussionRef = function(data){
  return new DiscussionRef(this, data);
};

DiscussionRef.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: DiscussionRef,

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getId
   * @methodOf discussions.types:constructor.DiscussionRef
   * @return {String} Discussion Ref Id
   */

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getResourceId
   * @methodOf discussions.types:constructor.DiscussionRef
   * @return {String} Discussion Id
   */
  getResourceId: function(){ return this.data.resourceId; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getResource
   * @methodOf discussions.types:constructor.DiscussionRef
   * @return {String} Discussion URL
   */
  getResource: function(){ return this.data.resource; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getAttribution
   * @methodOf discussions.types:constructor.DiscussionRef
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getDiscussionRefUrl
   * @methodOf discussions.types:constructor.DiscussionRef

   * @return {String} URL of this discussion reference; _NOTE_ however, that individual discussion references cannot be read
   */
  getDiscussionRefUrl: function() {
    return this.helpers.removeAccessToken(maybe(this.getLink('discussion-reference')).href);
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getDiscussionUrl
   * @methodOf discussions.types:constructor.DiscussionRef

   * @return {string} URL of the discussion (without the access token) -
   * pass into {@link discussions.functions:getDiscussion getDiscussion} for details
   */
  getDiscussionUrl: function() {
    return this.helpers.removeAccessToken(this.data.resource);
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#getDiscussion
   * @methodOf discussions.types:constructor.DiscussionRef

   * @return {Object} promise for the {@link discussions.functions:getDiscussion getDiscussion} response
   */
  getDiscussion: function() {
    return this.client.getDiscussion(this.getDiscussionUrl() || this.resourceId);
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#setDiscussion
   * @methodOf discussions.types:constructor.DiscussionRef

   * @param {Discussion|string} discussion Discussion object or discussion url or discussion id
   * @return {DiscussionRef} this discussion ref
   */
  setDiscussion: function(discussion) {
    if (discussion instanceof FS.Discussion) {
      this.data.resource = discussion.getDiscussionUrl();
      this.data.resourceId = discussion.getId();
    }
    else if (this.helpers.isAbsoluteUrl(discussion)) {
      this.data.resource = this.helpers.removeAccessToken(discussion);
    }
    else {
      this.data.resourceId = discussion;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#save
   * @methodOf discussions.types:constructor.DiscussionRef

   * @description
   * Create a new discussion reference
   *
   * @param {string} url URL of the discussions references list. This is only needed for new discussion refs. You can set it to null (or anything else) for existing refs that you are updating
   * @return {Object} promise for the response
   */
  save: function(url) {
    var self = this;
    if (self.getDiscussionRefUrl()) {
      url = self.getDiscussionRefUrl();
    }
    if (!self.data.resource && self.data.resourceId) {
      self.data.resource = self.data.resourceId;
    }
    var payload = {
      persons: [{
        'discussion-references' : [ { resource: self.data.resource } ]
      }]
    };
    var headers = {'Content-Type': 'application/x-fs-v1+json'};
    return self.plumbing.post(url, payload, headers).then(function(response){
      self.updateFromResponse(response, 'discussion-reference');
      return response;
    });
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#delete
   * @methodOf discussions.types:constructor.DiscussionRef

   * @description delete this discussion reference - see {@link discussions.functions:deleteDiscussionRef deleteDiscussionRef}
   * @param {string=} changeMessage change message
   * @return {Object} promise for the response
   */
  delete: function(changeMessage) {
    return this.client.deleteDiscussionRef(this.getDiscussionRefUrl(), changeMessage);
  }

});