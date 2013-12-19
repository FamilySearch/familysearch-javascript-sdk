define(['FamilySearch'], function(FamilySearch) {
  describe('Discussion', function() {
    it('references are returned from getPersonDiscussionRefs', function() {
      FamilySearch.getPersonDiscussionRefs('12345').then(function(response) {
        var ids = response.getDiscussionIds();
        expect(ids.length).toBe(2);
        expect(ids[0]).toEqual('67890');
      });
    });

    it('is returned from getDiscussion', function() {
      FamilySearch.getDiscussion('dis-MMMM-MMM').then(function(response) {
        var discussion = response.getDiscussion();
        expect(discussion.id).toBe('dis-MMMM-MMM');
        expect(discussion.title).toBe('1900 US Census, Ethel Hollivet');
        expect(discussion.details).toBe('Ethel Hollivet (line 75) with husband Albert Hollivet (line 74); also in the dwelling: step-father Joseph E Watkins (line 72), mother Lina Watkins (line 73), and grandmother -- Lina\'s mother -- Mary Sasnett (line 76).  ');
        expect(discussion.numberOfComments).toBe(2);
        expect(discussion.getContributorId()).toBeUndefined();
      });
    });

    it('comments are returned from getComments', function() {
      FamilySearch.getComments('dis-MMMM-MMM').then(function(response) {
        var comments = response.getComments();
        expect(comments.length).toBe(1);
        expect(comments[0].id).toBe('CMMM-MMM');
        expect(comments[0].text).toBe('Just a comment.');
        expect(comments[0].created).toBeUndefined();
        expect(comments[0].getContributorId()).toBeUndefined();
      });
    });
  });
});