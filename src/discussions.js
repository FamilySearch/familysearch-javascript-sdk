define([
  'globals',
  'helpers',
  'plumbing',
  'user'
], function(globals, helpers, plumbing, user) {
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

  var Discussion = exports.Discussion = function(data) {
    if (data) {
      this.title = data.title;
      this.details = data.details;
    }
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
    $getAgentUrl: function() { return helpers.removeAccessToken(maybe(this.contributor).resource); },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getAgent
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
     */
    $getAgent: function() { return user.getAgent(this.$getAgentUrl()); },

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
     * @param {boolean=} refresh true to read the discussion after updating
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the discussion id, which is fulfilled after the discussion has been updated,
     * and if refresh is true, after the discussion has been read.
     */
    $save: function(refresh, opts) {
      var self = this;
      var promise = helpers.chainHttpPromises(
        self.id ? plumbing.getUrl('discussion-template', null, {did: self.id}) : plumbing.getUrl('discussions'),
        function(url) {
          return plumbing.post(url, { discussions: [ self ] }, {'Content-Type' : 'application/x-fs-v1+json'}, opts, function(data, promise) {
            // x-entity-id and location headers are not set on update, only on create
            return self.id || promise.getResponseHeader('X-ENTITY-ID');
          });
        });
      var returnedPromise = promise.then(function(did) {
        helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
        if (refresh) {
          // re-read the discussion and set this object's properties from response
          return exports.getDiscussion(did, {}, opts).then(function(response) {
            helpers.deleteProperties(self);
            helpers.extend(self, response.getDiscussion());
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
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the discussion id
     */
    $delete: function(opts) {
      // TODO use self link when it is added
      return exports.deleteDiscussion(this.id, opts);
    }

  };

  /**********************************/
  /**
   * @ngdoc function
   * @name discussions.types:constructor.DiscussionRef
   * @description
   *
   * Reference to a discussion on a person.
   * To create a new discussion reference, you must set $personId and either discussionUrl or resourceId.
   * _NOTE_: discussion references cannot be updated. They can only be created or deleted.
   *
   * @param {Object=} data an object with optional attributes {$personId, discussionUrl, resourceId}
   * _resourceId_ is the discussion id
   **********************************/

  var DiscussionRef = exports.DiscussionRef = function(data) {
    if (data) {
      this.$personId = data.$personId;
      this.resourceId = data.resourceId;
      if (data.discussionUrl) {
        //noinspection JSUnresolvedFunction
        this.$setDiscussionUrl(data.discussionUrl);
      }
    }
  };

  exports.DiscussionRef.prototype = {
    constructor: DiscussionRef,

    /**
     * @ngdoc property
     * @name discussions.types:constructor.DiscussionRef#resourceId
     * @propertyOf discussions.types:constructor.DiscussionRef
     * @return {String} Discussion Id
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.DiscussionRef#$personId
     * @propertyOf discussions.types:constructor.DiscussionRef
     * @return {String} Id of the person to whom this discussion is attached
     */

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
    },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.DiscussionRef#$setDiscussionUrl
     * @methodOf discussions.types:constructor.DiscussionRef
     * @function
     * @param {String} url URL of the discussion
     * @return {Discussion} this discussion
     */
    $setDiscussionUrl: function(url) {
      this.resource = url;
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
     * NOTE: there's no _refresh_ parameter because it's not possible to read individual discussion references
     *
     * {@link http://jsfiddle.net/DallanQ/UarXL/ editable example}
     *
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the discussion reference url
     * (note however that individual discussion references cannot be read).
     */
    $save: function(opts) {
      var self = this;
      return helpers.chainHttpPromises(
        plumbing.getUrl('person-discussion-references-template', null, {pid: self.$personId}),
        function(url) {
          if (!self.resource && self.resourceId) {
            // the discovery resource is guaranteed to be set due to the getUrl statement
            self.resource = helpers.getUrlFromDiscoveryResource(globals.discoveryResource, 'discussion-template', {did: self.resourceId});
          }
          var payload = {
            persons: [{
              id: self.$personId,
              'discussion-references' : [ self.resource ]
            }]
          };
          return plumbing.post(url, payload, {'Content-Type' : 'application/x-fs-v1+json'}, opts, helpers.getResponseLocation);
        });
    },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.DiscussionRef#$delete
     * @methodOf discussions.types:constructor.DiscussionRef
     * @function
     * @description delete this discussion reference - see {@link discussions.functions:deleteDiscussionRef deleteDiscussionRef}
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the discussion reference url
     */
    $delete: function(opts) {
      var selfLink = helpers.removeAccessToken(helpers.find(this.links, {title: 'Discussion Reference'}).href);
      return exports.deleteDiscussionRef(selfLink, null, opts);
    }

  };

  /**********************************/
  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment
   * @description
   *
   * Comment on a discussion
   * To create a new comment, you must set text and either $discussionId or $memoryId.
   *
   * @param {Object=} data an object with optional attributes {text, $discussionId, $memoryId}
   **********************************/

  var Comment = exports.Comment = function(data) {
    if (data) {
      this.text = data.text;
      this.$discussionId = data.$discussionId;
      this.$memoryId = data.$memoryId;
    }
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

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Comment#$discussionId
     * @propertyOf discussions.types:constructor.Comment
     * @return {String} Id of the discussion if this is a discussion comment
     */

    /**
     * @ngdoc property
     * @name discussions.types:constructor.Comment#$memoryId
     * @propertyOf discussions.types:constructor.Comment
     * @return {String} Id of the memory if this is a memory comment
     */

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Comment#$getAgentId
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @return {String} id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentId: function() { return maybe(this.contributor).resourceId; },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Comment#$getAgentUrl
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @return {String} URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    $getAgentUrl: function() { return helpers.removeAccessToken(maybe(this.contributor).resource); },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Comment#$getAgent
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
     */
    $getAgent: function() { return user.getAgent(this.$getAgentUrl()); },

    // TODO check whether it's possible to update memory comments now and remove the note

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Comment#$save
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @description
     * Create a new comment or update an existing comment
     *
     * NOTE: there's no _refresh_ parameter because it's not possible to read individual comments;
     * however, the comment's id is set when creating a new comment
     *
     * NOTE: it is not currently possible to update memory comments.
     *
     * {@link http://jsfiddle.net/DallanQ/9YHfX/ editable example}
     *
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the comment id __BROKEN__ currently promise result is empty
     */
    $save: function(opts) {
      var self = this;
      var template = this.$memoryId ? 'memory-comments-template' : 'discussion-comments-template';
      return helpers.chainHttpPromises(
        plumbing.getUrl(template, null, {did: self.$discussionId, mid: self.$memoryId}),
        function(url) {
          var payload = {discussions: [{ comments: [ self ] }] };
          return plumbing.post(url, payload, {'Content-Type' : 'application/x-fs-v1+json'}, opts, function(data, promise) {
            self.id = self.id || promise.getResponseHeader('X-ENTITY-ID');
            return self.id;
          });
        });
    },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Comment#$delete
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @description delete this comment
     * @description delete this comment - see {@link discussions.functions:deleteDiscussionComment deleteDiscussionComment}
     * or {@link memories.functions:deleteMemoryComment deleteMemoryComment}
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the comment url
     */
    $delete: function(opts) {
      // since we're passing in the full url we can delete memory comments with this function as well
      return exports.deleteDiscussionComment(helpers.removeAccessToken(maybe(maybe(this.links).comment).href), null, opts);
    }

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
            helpers.objectExtender({getDiscussion: function() {
              return maybe(maybe(this).discussions)[0];
            }}),
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
            helpers.objectExtender({getDiscussionRefs: function() {
              return maybe(maybe(maybe(this).persons)[0])['discussion-references'] || [];
            }}),
            helpers.constructorSetter(DiscussionRef, 'discussion-references', function(response) {
              return maybe(maybe(response).persons)[0];
            }),
            helpers.objectExtender(function(response) {
              return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).persons)[0])['discussion-references'];
            })
          ));
      });
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
          // TODO - combine with memories getComments response mapper
          helpers.compose(
            helpers.objectExtender({getComments: function() {
              return maybe(maybe(maybe(this).discussions)[0]).comments || [];
            }}),
            helpers.constructorSetter(Comment, 'comments', function(response) {
              return maybe(maybe(response).discussions)[0];
            }),
            helpers.objectExtender(function(response) {
              return { $discussionId: maybe(maybe(maybe(response).discussions)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).discussions)[0])['comments'];
            })
          ));
      });
  };

  /**
   * @ngdoc function
   * @name discussions.functions:deleteDiscussion
   * @function
   *
   * @description
   * Delete the specified discussion
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/LTm24/ editable example}
   *
   * @param {string} did id or full URL of the discussion
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the discussion id/URL
   */
  exports.deleteDiscussion = function(did, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('discussion-template', did, {did: did}),
      function(url) {
        return plumbing.del(url, {'Content-Type': 'application/x-fs-v1+json'}, opts, function() {
          return did;
        });
      }
    );
  };

  // TODO is drid the id of the discussion?

  /**
   * @ngdoc function
   * @name discussions.functions:deleteDiscussionRef
   * @function
   *
   * @description
   * Delete the specified discussion reference
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_Reference_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/UFn4T/ editable example}
   *
   * @param {string} pid person id or full URL of the discussion reference
   * @param {string=} drid id of the discussion reference (must be set if pid is a person id and not the full URL)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the pid
   */
  exports.deleteDiscussionRef = function(pid, drid, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-discussion-reference-template', pid, {pid: pid, drid: drid}),
      function(url) {
        return plumbing.del(url, {'Content-Type': 'application/x-fs-v1+json'}, opts, function() {
          return pid;
        });
      }
    );
  };

  /**
   * @ngdoc function
   * @name discussions.functions:deleteDiscussionComment
   * @function
   *
   * @description
   * Delete the specified discussion comment
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Comment_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/D2r7h/ editable example}
   *
   * @param {string} did discussion id or full URL of the comment
   * @param {string=} cmid id of the comment (must be set if did is a comment id and not the full URL)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the did
   */
  exports.deleteDiscussionComment = function(did, cmid, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('discussion-comment-template', did, {did: did, cmid: cmid}),
      function(url) {
        return plumbing.del(url, {'Content-Type': 'application/x-fs-v1+json'}, opts, function() {
          return did;
        });
      }
    );
  };

  return exports;
});
