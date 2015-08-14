var q = require('q');

describe('Discussion', function() {
  
  it('references are returned from getPersonDiscussionRefs', function(done) {
    FS.getPersonDiscussionRefs('https://familysearch.org/platform/tree/persons/12345/discussion-references').then(function(response) {
      var refs = response.getDiscussionRefs();
      expect(refs.length).toBe(1);
      expect(refs[0].$personId).toBe('12345');
      refs[0].$getDiscussion().then(function(response) {
        var discussion = response.getDiscussion();
        expect(discussion.id).toBe('dis-MMMM-MMM');
        done();
      });
    });
  });

  it('is returned from getDiscussion', function(done) {
    FS.getDiscussion('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM').then(function(response) {
      var discussion = response.getDiscussion();
      expect(discussion.id).toBe('dis-MMMM-MMM');
      expect(discussion.title).toBe('1900 US Census, Ethel Hollivet');
      expect(discussion.details).toBe('Ethel Hollivet (line 75) with husband Albert Hollivet (line 74); also in the dwelling: step-father Joseph E Watkins (line 72), mother Lina Watkins (line 73), and grandmother -- Lina\'s mother -- Mary Sasnett (line 76).  ');
      expect(discussion.numberOfComments).toBe(2);
      expect(discussion.created).toBeUndefined();  // bad example data
      expect(discussion.modified).toBeUndefined(); // bad example data
      expect(discussion.$getAgentId()).toBe('12345');
      q.all([
        discussion.$getComments().then(function(response) {
          var comments = response.getComments();
          expect(comments.length).toBe(1);
          expect(comments[0].id).toBe('CMMM-MMM');
        }),
        discussion.$getAgent().then(function(response) {
          var agent = response.getAgent();
          expect(agent.$getName()).toBe('John Smith');
        })
      ]).then(function(){
        done();
      });
    });
  });

  it('are returned from getMultiDiscussion', function(done) {
    FS.getMultiDiscussion(['https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM']).then(function(response) {
      var discussion = response['https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM'].getDiscussion();
      expect(discussion.id).toBe('dis-MMMM-MMM');
      expect(discussion.title).toBe('1900 US Census, Ethel Hollivet');
      done();
    });
  });

  it('comments are returned from getDiscussionComments', function(done) {
    FS.getDiscussionComments('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM/comments').then(function(response) {
      var comments = response.getComments();
      expect(comments.length).toBe(1);
      expect(comments[0].id).toBe('CMMM-MMM');
      expect(comments[0].text).toBe('Just a comment.');
      expect(comments[0].$discussionId).toBe('dis-MMMM-MMM');
      expect(comments[0].created).toBeUndefined();       // bad example data
      expect(comments[0].$getAgentId()).toBeUndefined(); // bad example data
      done();
    });
  });

  it('is created', function(done) {
    var disc = FS.createDiscussion({title: '1900 US Census, Ethel Hollivet', details: 'details'});
    var promise = disc.$save();
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'discussions' : [ {
          'title' : '1900 US Census, Ethel Hollivet',
          'details' : 'details'
        } ]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('dis-MMMM-MMM');
      // discussion has been refreshed from database
      expect(disc.details).toBe('details');
      done();
    });
  });

  it('is updated', function(done) {
    var disc = FS.createDiscussion({title: '1900 US Census, Ethel Hollivet', details: 'details'});
    disc.id = 'dis-MMMM-MMM';
    var promise = disc.$save('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'discussions' : [ {
          'id' : 'dis-MMMM-MMM',
          'title' : '1900 US Census, Ethel Hollivet',
          'details' : 'details'
        } ]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('dis-MMMM-MMM');
      done();
    });
  });

  it('is deleted', function(done) {
    var disc = FS.createDiscussion({title: 'title', details: 'details'});
    disc.id = 'dis-MMMM-MMM';
    disc.links = {
      discussion: {
        href: 'https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM'
      }
    };
    var promise = disc.$delete();
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM');
      done();
    });
  });

  it('reference is created', function(done) {
    var discRef = FS.createDiscussionRef({$personId: '12345', discussion: 'dis-1'});
    var promise = discRef.$save('https://sandbox.familysearch.org/platform/tree/persons/12345/discussion-references', 'change msg');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'persons' : [ {
          'id' : '12345',
          'discussion-references' : [{
            resource: 'dis-1'
          }],
          'attribution' : { changeMessage: 'change msg' }
        } ]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('https://sandbox.familysearch.org/platform/tree/persons/12345/discussion-references/dis-1');
      done();
    });
  });

  it('reference is deleted', function(done) {
    var promise = FS.deleteDiscussionRef('https://familysearch.org/platform/tree/persons/12345/discussion-references/67890');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://familysearch.org/platform/tree/persons/12345/discussion-references/67890');
      done();
    });
  });

  it('comment is created', function(done) {
    var promise = FS.createComment({text: 'Just a comment.', $discussionId: 'dis-MMMM-MMM'})
      .$save('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM/comments');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'discussions' : [ {
          'comments' : [ {
            'text' : 'Just a comment.'
          } ]
        } ]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('cmt-id');
      done();
    });
  });

  it('comment is updated', function(done) {
    var cmt = FS.createComment({text: 'Just a comment.', $discussionId: 'dis-MMMM-MMU'});
    cmt.id = 'CMMM-MMM';
    var promise = cmt.$save('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMU/comments');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'discussions' : [ {
          'comments' : [ {
            'id' : 'CMMM-MMM',
            'text' : 'Just a comment.'
          } ]
        } ]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('CMMM-MMM');
      done();
    });
  });

  it('comment is deleted', function(done) {
    var promise = FS.deleteComment('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM/comments/1');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM/comments/1');
      done();
    });
  });

});