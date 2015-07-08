var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name discussions
 * @description
 * Functions related to discussions
 *
 * {@link https://familysearch.org/developers/docs/api/resources#discussions FamilySearch API Docs}
 */

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
 * {@link http://jsfiddle.net/gb1y9jdj/1/ Editable Example}
 *
 * @param {String} did id or full URL of the discussion to read
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getDiscussion = function(did, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('discussion-template', did, {did: did}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getDiscussion: function() {
            return maybe(maybe(this).discussions)[0];
          }}),
          function(response){
            for(var i = 0; i < response.discussions.length; i++){
              response.discussions[i] = self.createDiscussion(response.discussions[i]);
            }
            return response;
          }
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
 * {@link http://jsfiddle.net/9je6gfp5/1/ Editable Example}
 *
 * @param {string[]|DiscussionRef[]} dids id's, full URLs, or {@link discussions.types:constructor.DiscussionRef DiscussionRefs} of the discussions
 * @param {Object=} params pass to getDiscussion currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the discussions have been read,
 * returning a map of discussion id (or URL if dids is an array of URLs) to
 * {@link discussions.functions:getDiscussion getDiscussion} response
 */
FS.prototype.getMultiDiscussion = function(dids, params, opts) {
  var self = this,
      promises = {};
  utils.forEach(dids, function(did) {
    var key, url;
    if (did instanceof FS.DiscussionRef) {
      url = did.$getDiscussionUrl();
      key = did.resourceId;
    }
    else {
      url = did;
      key = did;
    }
    promises[key] = self.getDiscussion(url, params, opts);
  });
  return self.helpers.promiseAll(promises);
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
 * {@link http://jsfiddle.net/rx9wd0nz/1/ Editable Example}
 *
 * @param {String} pid id of the person to read or full URL of the person-discussion-references endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonDiscussionRefs = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-discussion-references-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params,
        {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getDiscussionRefs: function() {
            return maybe(maybe(maybe(this).persons)[0])['discussion-references'] || [];
          }}),
          function(response){
            if(response && response.persons && response.persons[0] && utils.isArray(response.persons[0]['discussion-references'])){
              var refs = response.persons[0]['discussion-references'];
              for(var i = 0; i < refs.length; i++){
                refs[i] = self.createDiscussionRef(refs[i]);
              }
            }
            return response;
          },
          utils.objectExtender(function(response) {
            return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
          }, function(response) {
            return maybe(maybe(maybe(response).persons)[0])['discussion-references'];
          })
        ));
    });
};

FS.prototype._commentsResponseMapper = function(){
  var self = this;
  return utils.compose(
    utils.objectExtender({getComments: function() {
      return maybe(maybe(maybe(this).discussions)[0]).comments || [];
    }}),
    function(response){
      if(response && response.discussions && response.discussions[0] && utils.isArray(response.discussions[0].comments)){
        var comments = response.discussions[0].comments;
        for(var i = 0; i < comments.length; i++){
          comments[i] = self.createComment(comments[i]);
        }
      }
      return response;
    }
  );
};

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
 * {@link http://jsfiddle.net/3wfxrkj0/1/ Editable Example}
 *
 * @param {String} did of the discussion or full URL of the discussion-comments endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getDiscussionComments = function(did, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('discussion-comments-template', did, {did: did}),
    function(url) {
      return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          self._commentsResponseMapper(),
          utils.objectExtender(function(response) {
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
 * {@link http://jsfiddle.net/quj3enjs/1/ Editable Example}
 *
 * @param {string} did id or full URL of the discussion
 * @param {string=} changeMessage change message (currently ignored)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the discussion id/URL
 */
FS.prototype.deleteDiscussion = function(did, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('discussion-template', did, {did: did}),
    function(url) {
      return self.plumbing.del(url, {'Content-Type': 'application/x-fs-v1+json'}, opts, function() {
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
 * {@link http://jsfiddle.net/p2sjn4ob/1/ Editable Example}
 *
 * @param {string} pid person id or full URL of the discussion reference
 * @param {string=} drid id of the discussion reference (must be set if pid is a person id and not the full URL)
 * @param {string=} changeMessage change message
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the pid
 */
FS.prototype.deleteDiscussionRef = function(pid, drid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-discussion-reference-template', pid, {pid: pid, drid: drid}),
    function(url) {
      var headers = {'Content-Type': 'application/x-fs-v1+json'};
      if (changeMessage) {
        headers['X-Reason'] = changeMessage;
      }
      return self.plumbing.del(url, headers, opts, function() {
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
 * {@link http://jsfiddle.net/fwnjq1nq/1/ Editable Example}
 *
 * @param {string} did discussion id or full URL of the comment
 * @param {string=} cmid id of the comment (must be set if did is a comment id and not the full URL)
 * @param {string=} changeMessage change message (currently ignored)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the did
 */
FS.prototype.deleteDiscussionComment = function(did, cmid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('discussion-comment-template', did, {did: did, cmid: cmid}),
    function(url) {
      return self.plumbing.del(url, {'Content-Type': 'application/x-fs-v1+json'}, opts, function() {
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
 * {@link http://jsfiddle.net/Lxcy6pcz/1/ Editable Example}
 *
 * @param {string} mid memory id or full URL of the comment
 * @param {string=} cmid id of the comment (must be set if mid is a memory id and not the full URL)
 * @param {string=} changeMessage change message (currently ignored)
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the mid
 */
FS.prototype.deleteMemoryComment = function(mid, cmid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('memory-comment-template', mid, {mid: mid, cmid: cmid}),
    function(url) {
      return self.plumbing.del(url, {}, opts, function() {
        return mid;
      });
    }
  );
};
