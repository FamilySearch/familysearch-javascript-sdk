define(['FamilySearch'], function(FamilySearch) {
  describe('Discussion', function() {
    it('references are returned from getPersonDiscussionReferences', function() {
      FamilySearch.getPersonDiscussionReferences('12345').then(function(response) {
        expect(response.getIds()).toEqual(['67890','67891']);
      });
    });

    it('is returned from getDiscussion', function() {
      FamilySearch.getDiscussion('dis-MMMM-MMM').then(function(response) {
        expect(response.getId()).toBe('dis-MMMM-MMM');
        expect(response.getTitle()).toBe('1900 US Census, Ethel Hollivet');
        expect(response.getDetails()).toBe('Ethel Hollivet (line 75) with husband Albert Hollivet (line 74); also in the dwelling: step-father Joseph E Watkins (line 72), mother Lina Watkins (line 73), and grandmother -- Lina\'s mother -- Mary Sasnett (line 76).  ');
        expect(response.getNumberOfComments()).toBe(2);
      });
    });

    it('comments are returned from getComments', function() {
      FamilySearch.getComments('dis-MMMM-MMM').then(function(response) {
        expect(response.getComments().length).toBe(1);
        expect(response.getComments()[0].id).toBe('CMMM-MMM');
        expect(response.getComments()[0].text).toBe('Just a comment.');
      });
    });
  });
});