define(['FamilySearch'], function(FamilySearch) {
  describe('Source Box', function() {
    it('user collections are returned from getCollectionsForUser', function() {
      FamilySearch.getCollectionsForUser('UID').then(function(response) {
        expect(response.getCollectionIds()).toEqual(['MMMM-MMM']);
      });
    });

    it('user collection is returned from getCollection', function() {
      FamilySearch.getCollection('sf-MMMM-MMM').then(function(response) {
        expect(response.getId()).toBe('sf-MMMM-MMM');
        expect(response.getTitle()).toBe('Name');
      });
    });

    it('source descriptions are returned from getCollectionSourceDescriptions', function() {
      FamilySearch.getCollectionSourceDescriptions('CMMM-MMM', {start:2, count:1}).then(function(response) {
        var sourceDescriptions = response.getSourceDescriptions();
        expect(sourceDescriptions.length).toBe(1);
        expect(sourceDescriptions[0].getId()).toBe('MMMM-CCC');
        expect(sourceDescriptions[0].getTitle()).toBe('NEW TITLE');
        expect(sourceDescriptions[0].getTitles()).toEqual(['NEW TITLE']);
      });
    });

    it('source descriptions for a user are returned from getCollectionSourceDescriptionsForUser', function() {
      FamilySearch.getCollectionSourceDescriptionsForUser('CCCC-CCC', {start:2, count:1}).then(function(response) {
        var sourceDescriptions = response.getSourceDescriptions();
        expect(sourceDescriptions.length).toBe(1);
        expect(sourceDescriptions[0].getId()).toBe('MMMM-CCC');
        expect(sourceDescriptions[0].getTitle()).toBe('NEW TITLE');
        expect(sourceDescriptions[0].getTitles()).toEqual(['NEW TITLE']);
      });
    });
  });
});