describe('Discussion', function() {
  
  it('references are returned from getPersonDiscussionRefs', function(done) {
    FS.getPersonDiscussionRefs('https://familysearch.org/platform/tree/persons/12345/discussion-references').then(function(response) {
      var refs = response.getDiscussionRefs();
      expect(refs.length).toBe(1);
      refs[0].getDiscussion().then(function(response) {
        var discussion = response.getDiscussion();
        expect(discussion.getId()).toBe('dis-MMMM-MMM');
        done();
      });
    });
  });

  it('is returned from getDiscussion', function(done) {
    FS.getDiscussion('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM').then(function(response) {
      var discussion = response.getDiscussion();
      expect(discussion.getId()).toBe('dis-MMMM-MMM');
      expect(discussion.getTitle()).toBe('1900 US Census, Ethel Hollivet');
      expect(discussion.getDetails()).toBe('Ethel Hollivet (line 75) with husband Albert Hollivet (line 74); also in the dwelling: step-father Joseph E Watkins (line 72), mother Lina Watkins (line 73), and grandmother -- Lina\'s mother -- Mary Sasnett (line 76).  ');
      expect(discussion.getNumberOfComments()).toBe(2);
      expect(discussion.getCreatedTimestamp()).toBeUndefined();  // bad example data
      expect(discussion.getModifiedTimestamp()).toBeUndefined(); // bad example data
      expect(discussion.getAgentId()).toBe('12345');
      Promise.all([
        discussion.getComments().then(function(response) {
          var comments = response.getComments();
          expect(comments.length).toBe(1);
          expect(comments[0].getId()).toBe('CMMM-MMM');
        }),
        discussion.getAgent().then(function(response) {
          var agent = response.getAgent();
          expect(agent.getName()).toBe('John Smith');
        })
      ]).then(function(){
        done();
      });
    });
  });

  it('are returned from getMultiDiscussion', function(done) {
    FS.getMultiDiscussion(['https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM']).then(function(responses) {
      var discussion = responses['https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM'].getDiscussion();
      expect(discussion.getId()).toBe('dis-MMMM-MMM');
      expect(discussion.getTitle()).toBe('1900 US Census, Ethel Hollivet');
      done();
    });
  });

  it('comments are returned from getDiscussionComments', function(done) {
    FS.getDiscussionComments('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM/comments').then(function(response) {
      var comments = response.getComments();
      expect(comments.length).toBe(1);
      expect(comments[0].getId()).toBe('CMMM-MMM');
      expect(comments[0].getText()).toBe('Just a comment.');
      expect(comments[0].getCreatedTimestamp()).toBeUndefined();       // bad example data
      expect(comments[0].getAgentId()).toBeUndefined(); // bad example data
      done();
    });
  });

  it('is created', function(done) {
    var disc = FS.createDiscussion({title: '1900 US Census, Ethel Hollivet', details: 'details'});
    disc.save().then(function(response) {
      var request = response.getRequest();
      expect(request.body).toEqualJson({
        'discussions' : [ {
          'title' : '1900 US Census, Ethel Hollivet',
          'details' : 'details'
        } ]
      });
      expect(response.getStatusCode()).toBe(201);
      expect(disc.getId()).toBe('dis-MMMM-MMM');
      expect(disc.getDetails()).toBe('details');
      done();
    });
  });

  it('is updated', function(done) {
    var disc = FS.createDiscussion({title: '1900 US Census, Ethel Hollivet', details: 'details'});
    disc.setId('dis-MMMM-MMM');
    disc.save('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM').then(function(response) {
      var request = response.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'discussions' : [ {
          'id' : 'dis-MMMM-MMM',
          'title' : '1900 US Census, Ethel Hollivet',
          'details' : 'details'
        } ]
      });
      expect(response.getStatusCode()).toBe(201);
      done();
    });
  });

  it('is deleted', function(done) {
    var disc = FS.createDiscussion({title: 'title', details: 'details'});
    disc.addLink('dis-MMMM-MMM');
    disc.addLink('discussion', {
      href: 'https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM'
    });
    disc.delete().then(function(response) {
      expect(response.getStatusCode()).toBe(204);
      done();
    });
  });

  it('reference is created', function(done) {
    var discRef = FS.createDiscussionRef({discussion: 'dis-1'});
    discRef.save('https://sandbox.familysearch.org/platform/tree/persons/12345/discussion-references', '12345', 'change msg')
      .then(function(response) {
        var request = response.getRequest(); 
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
        expect(response.getStatusCode()).toBe(201);
        expect(discRef.getLink('discussion-reference').href).toBe('https://sandbox.familysearch.org/platform/tree/persons/12345/discussion-references/dis-1');
        done();
      });
  });

  it('reference is deleted', function(done) {
    FS.deleteDiscussionRef('https://familysearch.org/platform/tree/persons/12345/discussion-references/67890')
      .then(function(response) {
        expect(response.getStatusCode()).toBe(204);
        done();
      });
  });

  it('comment is created', function(done) {
    var comment = FS.createComment({text: 'Just a comment.'});
    comment.save('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM/comments')
      .then(function(response) {
        var request = response.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.body).toEqualJson({
          'discussions' : [ {
            'comments' : [ {
              'text' : 'Just a comment.'
            } ]
          } ]
        });
        expect(response.getStatusCode()).toBe(201);
        expect(comment.getId()).toBe('cmt-id');
        done();
      });
  });

  it('comment is updated', function(done) {
    var cmt = FS.createComment({text: 'Just a comment.'});
    cmt.setId('CMMM-MMM');
    cmt.save('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMU/comments')
      .then(function(response) {
        var request = response.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.body).toEqualJson({
          'discussions' : [ {
            'comments' : [ {
              'id' : 'CMMM-MMM',
              'text' : 'Just a comment.'
            } ]
          } ]
        });
        expect(response.getStatusCode()).toBe(204);
        done();
      });
  });

  it('comment is deleted', function(done) {
    FS.deleteComment('https://familysearch.org/platform/discussions/discussions/dis-MMMM-MMM/comments/1')
      .then(function(response) {
        expect(response.getStatusCode()).toBe(204);
        done();
      });
  });

});