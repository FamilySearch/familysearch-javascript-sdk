var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**********************************/
/**
 * @ngdoc function
 * @name discussions.types:constructor.DiscussionRef
 * @description
 *
 * Reference to a discussion on a person.
 * To create a new discussion reference, you must set $personId and discussion.
 * _NOTE_: discussion references cannot be updated. They can only be created or deleted.
 *
 * @param {Object=} data an object with optional attributes {$personId, discussion}
 * _discussion_ can be a {@link discussions.types:constructor.Discussion Discussion} or a discussion URL or a discussion id
 **********************************/

var DiscussionRef = FS.DiscussionRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
  if (data && data.discussion) {
    //noinspection JSUnresolvedFunction
    this.$setDiscussion(data.discussion);
  }
};

FS.prototype.createDiscussionRef = function(data){
  return new DiscussionRef(this, data);
};

DiscussionRef.prototype = {
  constructor: DiscussionRef,

  /**
   * @ngdoc property
   * @name discussions.types:constructor.DiscussionRef#id
   * @propertyOf discussions.types:constructor.DiscussionRef
   * @return {String} Discussion Ref Id
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.DiscussionRef#resourceId
   * @propertyOf discussions.types:constructor.DiscussionRef
   * @return {String} Discussion Id
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.DiscussionRef#resource
   * @propertyOf discussions.types:constructor.DiscussionRef
   * @return {String} Discussion URL
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.DiscussionRef#attribution
   * @propertyOf discussions.types:constructor.DiscussionRef
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.DiscussionRef#$personId
   * @propertyOf discussions.types:constructor.DiscussionRef
   * @return {String} Id of the person to whom this discussion is attached
   */

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#$getDiscussionRefUrl
   * @methodOf discussions.types:constructor.DiscussionRef
   * @function
   * @return {String} URL of this discussion reference; _NOTE_ however, that individual discussion references cannot be read
   */
  $getDiscussionRefUrl: function() {
    return this.$helpers.removeAccessToken(maybe(maybe(this.links)['discussion-reference']).href);
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#$getDiscussionUrl
   * @methodOf discussions.types:constructor.DiscussionRef
   * @function
   * @return {string} URL of the discussion (without the access token) -
   * pass into {@link discussions.functions:getDiscussion getDiscussion} for details
   */
  $getDiscussionUrl: function() {
    return this.$helpers.removeAccessToken(this.resource);
  },

/**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#$getDiscussion
   * @methodOf discussions.types:constructor.DiscussionRef
   * @function
   * @return {Object} promise for the {@link discussions.functions:getDiscussion getDiscussion} response
   */
  $getDiscussion: function() {
    return this.$client.getDiscussion(this.$getDiscussionUrl() || this.resourceId);
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#$setDiscussion
   * @methodOf discussions.types:constructor.DiscussionRef
   * @function
   * @param {Discussion|string} discussion Discussion object or discussion url or discussion id
   * @return {DiscussionRef} this discussion ref
   */
  $setDiscussion: function(discussion) {
    if (discussion instanceof FS.Discussion) {
      this.resource = discussion.$getDiscussionUrl();
      this.resourceId = discussion.id;
    }
    else if (this.$helpers.isAbsoluteUrl(discussion)) {
      this.resource = this.$helpers.removeAccessToken(discussion);
    }
    else {
      this.resourceId = discussion;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#$save
   * @methodOf discussions.types:constructor.DiscussionRef
   * @function
   * @description
   * Create a new discussion reference
   *
   * NOTE: there's no _refresh_ parameter because it's not possible to read individual discussion references;
   * however, the discussion reference's URL is set when creating a new discussion reference
   *
   * {@link http://jsfiddle.net/DallanQ/UarXL/ editable example}
   *
   * @param {string} changeMessage change message - unused - discussion reference attributions do not contain change messages
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the discussion reference url
   * (note however that individual discussion references cannot be read).
   */
  $save: function(changeMessage, opts) {
    var self = this;
    return self.$helpers.chainHttpPromises(
      self.$plumbing.getUrl('person-discussion-references-template', null, {pid: self.$personId}),
      function(url) {
        if (!self.resource && self.resourceId) {
          self.resource = self.resourceId;
        }
        var payload = {
          persons: [{
            id: self.$personId,
            'discussion-references' : [ { resource: self.resource } ]
          }]
        };
        if (changeMessage) {
          payload.persons[0].attribution = self.$client.createAttribution(changeMessage);
        }
        var headers = {'Content-Type': 'application/x-fs-v1+json'};
        return self.$plumbing.post(url, payload, headers, opts, function(data, promise) {
          if (!self.$getDiscussionRefUrl()) {
            self.links = {
              'discussion-reference': {
                href: promise.getResponseHeader('Location'),
                title: 'Discussion Reference'
              }
            };
          }
          return self.$getDiscussionRefUrl();
        });
      });
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef#$delete
   * @methodOf discussions.types:constructor.DiscussionRef
   * @function
   * @description delete this discussion reference - see {@link discussions.functions:deleteDiscussionRef deleteDiscussionRef}
   * @param {string=} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the discussion reference url
   */
  $delete: function(changeMessage, opts) {
    return this.$client.deleteDiscussionRef(this.$getDiscussionRefUrl() || this.$personId, this.id, changeMessage, opts);
  }

};