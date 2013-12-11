define(['FamilySearch'], function(FamilySearch) {
  describe('Source Box', function() {
    it('user collections are returned from getUserDefinedCollectionsForUser', function() {
      FamilySearch.getUserDefinedCollectionsForUser('UID').then(function(response) {
        expect(response.getCollectionIds()).toEqual(['MMMM-MMM']);
      });
    });
  });
});