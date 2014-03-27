define(['FamilySearch'], function(FamilySearch) {
  describe('Discussion', function() {
    it('references are returned from getPersonDiscussionRefs', function() {
      FamilySearch.getPersonDiscussionRefs('12345').then(function(response) {
        var refs = response.getDiscussionRefs();
        expect(refs.length).toBe(1);
        expect(refs[0].$personId).toBe('12345');
        refs[0].$getDiscussion().then(function(response) {
          var discussion = response.getDiscussion();
          expect(discussion.id).toBe('dis-MMMM-MMM');
        });
      });
    });

    it('is returned from getDiscussion', function() {
      FamilySearch.getDiscussion('dis-MMMM-MMM').then(function(response) {
        var discussion = response.getDiscussion();
        expect(discussion.id).toBe('dis-MMMM-MMM');
        expect(discussion.title).toBe('1900 US Census, Ethel Hollivet');
        expect(discussion.details).toBe('Ethel Hollivet (line 75) with husband Albert Hollivet (line 74); also in the dwelling: step-father Joseph E Watkins (line 72), mother Lina Watkins (line 73), and grandmother -- Lina\'s mother -- Mary Sasnett (line 76).  ');
        expect(discussion.numberOfComments).toBe(2);
        expect(discussion.created).toBeUndefined();  // bad example data
        expect(discussion.modified).toBeUndefined(); // bad example data
        expect(discussion.$getAgentId()).toBe('12345');
        discussion.$getComments().then(function(response) {
          var comments = response.getComments();
          expect(comments.length).toBe(1);
          expect(comments[0].id).toBe('CMMM-MMM');
        });
        discussion.$getAgent().then(function(response) {
          var agent = response.getAgent();
          expect(agent.$getName()).toBe('John Smith');
        });
      });
    });

    it('are returned from getMultiDiscussion', function() {
      FamilySearch.getMultiDiscussion(['dis-MMMM-MMM']).then(function(response) {
        var discussion = response['dis-MMMM-MMM'].getDiscussion();
        expect(discussion.id).toBe('dis-MMMM-MMM');
        expect(discussion.title).toBe('1900 US Census, Ethel Hollivet');
      });
    });

    it('comments are returned from getDiscussionComments', function() {
      FamilySearch.getDiscussionComments('dis-MMMM-MMM').then(function(response) {
        var comments = response.getComments();
        expect(comments.length).toBe(1);
        expect(comments[0].id).toBe('CMMM-MMM');
        expect(comments[0].text).toBe('Just a comment.');
        expect(comments[0].$discussionId).toBe('dis-MMMM-MMM');
        expect(comments[0].created).toBeUndefined();       // bad example data
        expect(comments[0].$getAgentId()).toBeUndefined(); // bad example data
      });
    });

    it('is created', function() {
      var disc = new FamilySearch.Discussion({title: '1900 US Census, Ethel Hollivet', details: 'details'});
      var promise = disc.$save(true);
      promise.then(function(response) {
        var request = promise.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.data).toEqualJson({
          'discussions' : [ {
            'title' : '1900 US Census, Ethel Hollivet',
            'details' : 'details'
          } ]
        });
        expect(promise.getStatusCode()).toBe(201);
        expect(response).toBe('dis-MMMM-MMM');
        // discussion has been refreshed from database
        expect(disc.details).toBe('Ethel Hollivet (line 75) with husband Albert Hollivet (line 74); also in the dwelling: step-father Joseph E Watkins (line 72), mother Lina Watkins (line 73), and grandmother -- Lina\'s mother -- Mary Sasnett (line 76).  ');
      });
    });

    it('is updated', function() {
      var disc = new FamilySearch.Discussion({title: '1900 US Census, Ethel Hollivet', details: 'details'});
      disc.id = 'dis-MMMM-MMM';
      var promise = disc.$save(true);
      promise.then(function(response) {
        var request = promise.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.data).toEqualJson({
          'discussions' : [ {
            'id' : 'dis-MMMM-MMM',
            'title' : '1900 US Census, Ethel Hollivet',
            'details' : 'details'
          } ]
        });
        expect(promise.getStatusCode()).toBe(201);
        expect(response).toBe('dis-MMMM-MMM');
      });
    });

    it('is deleted', function() {
      var disc = new FamilySearch.Discussion({title: 'title', details: 'details'});
      disc.id = 'dis-MMMM-MMM';
      var promise = disc.$delete();
      promise.then(function(response) {
        expect(promise.getStatusCode()).toBe(204);
        expect(response).toBe('dis-MMMM-MMM');
      });
    });

    it('reference is created', function() {
      var discRef = new FamilySearch.DiscussionRef({$personId: '12345', discussion: 'dis-1'});
      var promise = discRef.$save();
      promise.then(function(response) {
        var request = promise.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.data).toEqualJson({
          'persons' : [ {
            'id' : '12345',
            'discussion-references' : [ 'https://sandbox.familysearch.org/platform/discussions/discussions/dis-1' ]
          } ]
        });
        expect(promise.getStatusCode()).toBe(201);
        expect(response).toBe('https://sandbox.familysearch.org/platform/tree/persons/12345/discussion-references/dis-1');
      });
    });

    it('reference is deleted', function() {
      var promise = FamilySearch.deleteDiscussionRef('12345','67890');
      promise.then(function(response) {
        expect(promise.getStatusCode()).toBe(204);
        expect(response).toBe('12345');
      });
    });

    it('comment is created', function() {
      var promise = new FamilySearch.Comment({text: 'Just a comment.', $discussionId: 'dis-MMMM-MMM'})
        .$save();
      promise.then(function(response) {
        var request = promise.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.data).toEqualJson({
          'discussions' : [ {
            'comments' : [ {
              'text' : 'Just a comment.'
            } ]
          } ]
        });
        expect(promise.getStatusCode()).toBe(201);
        expect(response).toBe('cmt-id');
      });
    });

    it('comment is updated', function() {
      var cmt = new FamilySearch.Comment({text: 'Just a comment.', $discussionId: 'dis-MMMM-MMU'});
      cmt.id = 'CMMM-MMM';
      var promise = cmt.$save();
      promise.then(function(response) {
        var request = promise.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.data).toEqualJson({
          'discussions' : [ {
            'comments' : [ {
              'id' : 'CMMM-MMM',
              'text' : 'Just a comment.'
            } ]
          } ]
        });
        expect(promise.getStatusCode()).toBe(204);
        expect(response).toBe('CMMM-MMM');
      });
    });

    it('comment is deleted', function() {
      var promise = FamilySearch.deleteDiscussionComment('dis-MMMM-MMM', '1');
      promise.then(function(response) {
        expect(promise.getStatusCode()).toBe(204);
        expect(response).toBe('dis-MMMM-MMM');
      });
    });

  });
});