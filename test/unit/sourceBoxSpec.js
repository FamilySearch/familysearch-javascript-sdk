define(['FamilySearch'], function(FamilySearch) {
  describe('Source Box', function() {
    it('user collections are returned from getUserDefinedCollectionsForUser', function() {
      FamilySearch.getUserDefinedCollectionsForUser('UID').then(function(response) {
        expect(response.getCollectionIds()).toEqual(['MMMM-MMM']);
      });
    });

    it('user collection is returned from getUserDefinedCollection', function() {
      FamilySearch.getUserDefinedCollection('sf-MMMM-MMM').then(function(response) {
        expect(response.getId()).toBe('sf-MMMM-MMM');
        expect(response.getTitle()).toBe('Name');
      });
    });
  });
});