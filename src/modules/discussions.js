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

 *
 * @description
 * Get information about a discussion
 * The response includes the following convenience function
 *
 * - `getDiscussion()` - get the {@link discussions.types:constructor.Discussion Discussion} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the discussion to read
 * @return {Object} promise for the response
 */
FS.prototype.getDiscussion = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    utils.forEach(response.getData().discussions, function(discussion, i, obj){
      obj[i] = self.createDiscussion(discussion);
    });
    return utils.extend(response, {
      getDiscussion: function() {
        return maybe(maybe(this.getData()).discussions)[0];
      }
    });
  });
};

/**
 * @ngdoc function
 * @name discussions.functions:getMultiDiscussion

 *
 * @description
 * Get multiple discussions at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/discussions/Discussion_resource FamilySearch API Docs}
 *
 *
 * @param {string[]|DiscussionRef[]} full URLs, or {@link discussions.types:constructor.DiscussionRef DiscussionRefs} of the discussions
 * @return {Object} promise that is fulfilled when all of the discussions have been read,
 * returning a map of {@link discussions.functions:getDiscussion getDiscussion} responses keyed by url
 */
FS.prototype.getMultiDiscussion = function(urls) {
  var self = this,
      promises = [],
      responses = {};
  utils.forEach(urls, function(url) {
    if (url instanceof FS.DiscussionRef) {
      url = url.$getDiscussionUrl();
    }
    promises.push(
      self.getDiscussion(url).then(function(response){
        responses[url] = response;
      })
    );
  });
  return Promise.all(promises).then(function(){
    return responses;
  });
};

/**
 * @ngdoc function
 * @name discussions.functions:getPersonDiscussionRefs
 * @deprecated
 * @description
 * 
 * __This method is deprecated as of {@link https://familysearch.org/developers/news/2016-09 December 6, 2016}. Use {@link person.functions:getPerson getPerson()} to retrieve discussion references.__
 * 
 * Get references to discussions for a person
 * The response includes the following convenience function
 *
 * - `getDiscussionRefs()` - get an array of {@link discussions.types:constructor.DiscussionRef DiscussionRefs} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_References_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the person-discussion-references endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getPersonDiscussionRefs = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {
    'Accept': 'application/x-fs-v1+json',
    'X-FS-Feature-Tag': 'consolidate-redundant-resources',
    'X-Expect-Override': '200-ok'
  })
  .then(function(response){
    return self.plumbing.get(response.getHeader('Location'));
  })
  .then(function(response){
    var data = response.getData();
    if(data.persons && data.persons[0] && utils.isArray(data.persons[0]['discussion-references'])){
      var refs = data.persons[0]['discussion-references'];
      for(var i = 0; i < refs.length; i++){
        refs[i] = self.createDiscussionRef(refs[i]);
      }
    }
    return utils.extend(response, {
      getDiscussionRefs: function() {
        return maybe(maybe(maybe(this.getData()).persons)[0])['discussion-references'] || [];
      }
    });
  });
};

FS.prototype._commentsResponseMapper = function(response){
  var self = this,
      data = response.getData();
  if(data.discussions && data.discussions[0] && utils.isArray(data.discussions[0].comments)){
    var comments = data.discussions[0].comments;
    for(var i = 0; i < comments.length; i++){
      comments[i] = self.createComment(comments[i]);
    }
  }
  return utils.extend(response, {
    getComments: function() {
      return maybe(maybe(maybe(this.getData()).discussions)[0]).comments || [];
    }
  });
};

/**
 * @ngdoc function
 * @name discussions.functions:getDiscussionComments

 *
 * @description
 * Get comments for a discussion
 * The response includes the following convenience function
 *
 * - `getComments()` - get an array of {@link discussions.types:constructor.Comment Comments} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/discussions/Comments_resource FamilySearch API Docs}
 *
 *
 * @param {String} url full URL of the discussion-comments endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getDiscussionComments = function(url) {
  var self = this;
  return self.plumbing.get(url, null, {'Accept': 'application/x-fs-v1+json'}).then(function(response){
    return self._commentsResponseMapper(response);
  });
};

/**
 * @ngdoc function
 * @name discussions.functions:deleteDiscussion

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
 *
 * @param {string} url full URL of the discussion
 * @param {string=} changeMessage change message (currently ignored)
 * @return {Object} promise for the response
 */
FS.prototype.deleteDiscussion = function(url) {
  return this.plumbing.del(url, {'Content-Type': 'application/x-fs-v1+json'});
};

/**
 * @ngdoc function
 * @name discussions.functions:deleteDiscussionRef

 *
 * @description
 * Delete the specified discussion reference
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Discussion_Reference_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the discussion reference
 * @param {string=} drid id of the discussion reference (must be set if pid is a person id and not the full URL)
 * @param {string=} changeMessage change message
 * @return {Object} promise for the response
 */
FS.prototype.deleteDiscussionRef = function(url, changeMessage) {
  var headers = {'Content-Type': 'application/x-fs-v1+json'};
  if (changeMessage) {
    headers['X-Reason'] = changeMessage;
  }
  return this.plumbing.del(url, headers);
};

/**
 * @ngdoc function
 * @name discussions.functions:deleteComment

 *
 * @description
 * Delete the specified discussion or memory comment
 *
 * {@link https://familysearch.org/developers/docs/api/memories/Memory_Comment_resource FamilySearch API Docs}
 * {@link https://familysearch.org/developers/docs/api/discussions/Comment_resource FamilySearch API Docs}
 *
 *
 * @param {string} url full URL of the comment
 * @return {Object} promise for the response
 */
FS.prototype.deleteComment = function(url) {
  return this.plumbing.del(url);
};
