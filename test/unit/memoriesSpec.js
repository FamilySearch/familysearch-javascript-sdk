define(['FamilySearch'], function(FamilySearch) {
  describe('Memory', function() {
    it('references are returned from getPersonMemoryReferences', function() {
      FamilySearch.getPersonMemoryReferences('PPPP-PPP').then(function(response) {
        var memories = response.getMemories();
        expect(memories.length).toBe(2);
        expect(memories[0].getMemoryId()).toBe('3649');
        expect(memories[0].getPersonaId()).toBe('1083');
      });
    });

    it('is returned from getMemory', function() {
      FamilySearch.getMemory('ARXX-MMM').then(function(response) {
        expect(response.getId()).toBe('ARXX-MMM');
        expect(response.getMediaType()).toBe('image/jpeg');
        expect(response.getObjectURL()).toBe('https://familysearch.org/platform/memories/artifacts/ARXX-MMM');
        expect(response.getIconURL()).toBe('https://familysearch.org/platform/memories/artifacts/ARXX-MMM?icon');
        expect(response.getThumbnailURL()).toBe('https://familysearch.org/platform/memories/artifacts/ARXX-MMM?thumbnail');
        expect(response.getTitle()).toBe('Birth Certificate of Ethel Hollivet');
        expect(response.getTitles()).toEqual(['Birth Certificate of Ethel Hollivet']);
        expect(response.getDescription()).toBe('Shows Ethel Hollivet was born 3 Aug 1899');
        expect(response.getDescriptions()).toEqual(['Shows Ethel Hollivet was born 3 Aug 1899']);
      });
    });

    it('comments are returned from getMemoryComments', function() {
      FamilySearch.getMemoryComments('AR-1234').then(function(response) {
        expect(response.getComments().length).toBe(1);
        expect(response.getComments()[0].id).toBe('CMMM-MMM');
        expect(response.getComments()[0].text).toBe('Just a comment.');
      });
    });
  });
});