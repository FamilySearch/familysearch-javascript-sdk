define(['FamilySearch'], function(FamilySearch) {
  describe('Discussion', function() {
    it('references are returned from getPersonDiscussionRefs', function() {
      FamilySearch.getPersonDiscussionRefs('12345').then(function(response) {
        var refs = response.getDiscussionRefs();
        expect(refs.length).toBe(1);
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

    it('comments are returned from getComments', function() {
      FamilySearch.getComments('dis-MMMM-MMM').then(function(response) {
        var comments = response.getComments();
        expect(comments.length).toBe(1);
        expect(comments[0].id).toBe('CMMM-MMM');
        expect(comments[0].text).toBe('Just a comment.');
        expect(comments[0].created).toBeUndefined();       // bad example data
        expect(comments[0].$getAgentId()).toBeUndefined(); // bad example data
      });
    });
  });
});