if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
  './attribution',
  './globals',
  './helpers',
  './plumbing',
  './user'
], function(attribution, globals, helpers, plumbing, user) {
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

  // TODO consider disallowing $save()'ing or $delete()'ing discussions

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
     * @name discussions.types:constructor.Discussion#$getDiscussionUrl
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {String} URL of this discussion
     */
    $getDiscussionUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).discussion).href); },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getCommentsUrl
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {String} URL of the comments endpoint - pass into {@link discussions.functions:getDiscussionComments getDiscussionComments} for details
     */
    $getCommentsUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).comments).href); },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Discussion#$getComments
     * @methodOf discussions.types:constructor.Discussion
     * @function
     * @return {Object} promise for the {@link discussions.functions:getDiscussionComments getDiscussionComments} response
     */
    $getComments: function() { return exports.getDiscussionComments(this.$getCommentsUrl()); },

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
    $getAgent: function() { return user.getAgent(this.$getAgentUrl() || this.$getAgentId()); },

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
            helpers.deletePropertiesPartial(self, helpers.appFieldRejector);
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
      return exports.deleteDiscussion(this.$getDiscussionUrl() || this.id, changeMessage, opts);
    }

  };

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

  var DiscussionRef = exports.DiscussionRef = function(data) {
    if (data) {
      this.$personId = data.$personId;
      if (data.discussion) {
        //noinspection JSUnresolvedFunction
        this.$setDiscussion(data.discussion);
      }
    }
  };

  exports.DiscussionRef.prototype = {
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
      return helpers.removeAccessToken(maybe(maybe(this.links)['discussion-reference']).href);
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
      return exports.getDiscussion(this.$getDiscussionUrl() || this.resourceId);
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
      if (discussion instanceof Discussion) {
        this.resource = discussion.$getDiscussionUrl();
        this.resourceId = discussion.id;
      }
      else if (helpers.isAbsoluteUrl(discussion)) {
        this.resource = helpers.removeAccessToken(discussion);
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
      return helpers.chainHttpPromises(
        plumbing.getUrl('person-discussion-references-template', null, {pid: self.$personId}),
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
            payload.persons[0].attribution = new attribution.Attribution(changeMessage);
          }
          var headers = {'Content-Type': 'application/x-fs-v1+json'};
          return plumbing.post(url, payload, headers, opts, function(data, promise) {
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
      return exports.deleteDiscussionRef(this.$getDiscussionRefUrl() || this.$personId, this.id, changeMessage, opts);
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
     * @name discussions.types:constructor.Comment#$getCommentUrl
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @return {String} URL of this comment; _NOTE_ however, that individual comments cannot be read
     */
    $getCommentUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).comment).href); },

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
    $getAgent: function() { return user.getAgent(this.$getAgentUrl() || this.$getAgentId()); },

    /**
     * @ngdoc function
     * @name discussions.types:constructor.Comment#$save
     * @methodOf discussions.types:constructor.Comment
     * @function
     * @description
     * Create a new comment or update an existing comment
     *
     * _NOTE_: there's no _refresh_ parameter because it's not possible to read individual comments;
     * however, the comment's id and URL is set when creating a new comment
     *
     * {@link http://jsfiddle.net/DallanQ/9YHfX/ editable example}
     *
     * @param {string=} changeMessage change message (currently ignored)
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the comment id
     */
    $save: function(changeMessage, opts) {
      var self = this;
      var template = this.$memoryId ? 'memory-comments-template' : 'discussion-comments-template';
      return helpers.chainHttpPromises(
        plumbing.getUrl(template, null, {did: self.$discussionId, mid: self.$memoryId}),
        function(url) {
          var payload = {discussions: [{ comments: [ self ] }] };
          return plumbing.post(url, payload, {'Content-Type' : 'application/x-fs-v1+json'}, opts, function(data, promise) {
            if (!self.id) {
              self.id = promise.getResponseHeader('X-ENTITY-ID');
            }
            if (!self.$getCommentUrl()) {
              self.links = { comment: { href: promise.getResponseHeader('Location') } };
            }
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
     * @param {string=} changeMessage change message (currently ignored)
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the comment url
     */
    $delete: function(changeMessage, opts) {
      if (this.$discussionId) {
        return exports.deleteDiscussionComment(this.$getCommentUrl() || this.$discussionId, this.id, changeMessage, opts);
      }
      else {
        return exports.deleteMemoryComment(this.$getCommentUrl() || this.$memoryId, this.id, changeMessage, opts);
      }
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
   * returning a map of discussion id (or URL if dids is an array of URLs) to
   * {@link discussions.functions:getDiscussion getDiscussion} response
   */
  exports.getMultiDiscussion = function(dids, params, opts) {
    var promises = {};
    helpers.forEach(dids, function(did) {
      var key, url;
      if (did instanceof DiscussionRef) {
        url = did.$getDiscussionUrl();
        key = did.resourceId;
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
        return plumbing.get(url, params,
          {'Accept': 'application/x-fs-v1+json'}, opts,
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
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return maybe(maybe(maybe(response).persons)[0])['discussion-references'];
            })
          ));
      });
  };

  exports.commentsResponseMapper = helpers.compose(
    helpers.objectExtender({getComments: function() {
      return maybe(maybe(maybe(this).discussions)[0]).comments || [];
    }}),
    helpers.constructorSetter(Comment, 'comments', function(response) {
      return maybe(maybe(response).discussions)[0];
    })
  );

  /**
   * @ngdoc function
   * @name discussions.functions:getDiscussionComments
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
  exports.getDiscussionComments = function(did, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('discussion-comments-template', did, {did: did}),
      function(url) {
        return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            exports.commentsResponseMapper,
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
   * __NOTE__ if you delete a discussion, it's up to you to delete the corresponding Discussion Refs
   * Since there is no way to tell which people a discussion has been linked to, your best best is to
   * attach a discussion to a single person and to delete the discussion when you delete the discussion-reference.
   * FamilySearch is aware of this issue but hasn't committed to a fix.
   *
   * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/LTm24/ editable example}
   *
   * @param {string} did id or full URL of the discussion
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the discussion id/URL
   */
  exports.deleteDiscussion = function(did, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('discussion-template', did, {did: did}),
      function(url) {
        return plumbing.del(url, {'Content-Type': 'application/x-fs-v1+json'}, opts, function() {
          return did;
        });
      }
    );
  };

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
   * @param {string=} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the pid
   */
  exports.deleteDiscussionRef = function(pid, drid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-discussion-reference-template', pid, {pid: pid, drid: drid}),
      function(url) {
        var headers = {'Content-Type': 'application/x-fs-v1+json'};
        if (changeMessage) {
          headers['X-Reason'] = changeMessage;
        }
        return plumbing.del(url, headers, opts, function() {
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
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the did
   */
  exports.deleteDiscussionComment = function(did, cmid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('discussion-comment-template', did, {did: did, cmid: cmid}),
      function(url) {
        return plumbing.del(url, {'Content-Type': 'application/x-fs-v1+json'}, opts, function() {
          return did;
        });
      }
    );
  };

  /**
   * @ngdoc function
   * @name discussions.functions:deleteMemoryComment
   * @function
   *
   * @description
   * Delete the specified memory comment
   *
   * {@link https://familysearch.org/developers/docs/api/memories/Memory_Comment_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/5bbuQ/ editable example}
   *
   * @param {string} mid memory id or full URL of the comment
   * @param {string=} cmid id of the comment (must be set if mid is a memory id and not the full URL)
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the mid
   */
  exports.deleteMemoryComment = function(mid, cmid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('memory-comment-template', mid, {mid: mid, cmid: cmid}),
      function(url) {
        return plumbing.del(url, {}, opts, function() {
          return mid;
        });
      }
    );
  };

  return exports;
});
