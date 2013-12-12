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

    it('source descriptions are returned from getUserDefinedCollectionSourceDescriptions', function() {
      FamilySearch.getUserDefinedCollectionSourceDescriptions('CMMM-MMM', {start:2, count:1}).then(function(response) {
        var sourceDescriptions = response.getSourceDescriptions();
        expect(sourceDescriptions.length).toBe(1);
        expect(sourceDescriptions[0].getId()).toBe('MMMM-CCC');
        expect(sourceDescriptions[0].getTitle()).toBe('NEW TITLE');
        expect(sourceDescriptions[0].getTitles()).toEqual(['NEW TITLE']);
      });
    });

    it('source descriptions for a user are returned from getUserDefinedCollectionSourceDescriptionsForUser', function() {
      FamilySearch.getUserDefinedCollectionSourceDescriptionsForUser('CCCC-CCC', {start:2, count:1}).then(function(response) {
        var sourceDescriptions = response.getSourceDescriptions();
        expect(sourceDescriptions.length).toBe(1);
        expect(sourceDescriptions[0].getId()).toBe('MMMM-CCC');
        expect(sourceDescriptions[0].getTitle()).toBe('NEW TITLE');
        expect(sourceDescriptions[0].getTitles()).toEqual(['NEW TITLE']);
      });
    });
  });
});