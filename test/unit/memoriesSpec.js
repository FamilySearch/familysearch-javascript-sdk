define(['FamilySearch'], function(FamilySearch) {
  describe('Memory', function() {
    it('references are returned from getPersonMemoryRefs', function() {
      FamilySearch.getPersonMemoryRefs('PPPP-PPP').then(function(response) {
        var memoryRefs = response.getMemoryRefs();
        expect(memoryRefs.length).toBe(2);
        expect(memoryRefs[0].getMemoryId()).toBe('3649');
        expect(memoryRefs[0].resourceId).toBe('1083');
      });
    });

    it('is returned from getMemory', function() {
      FamilySearch.getMemory('ARXX-MMM').then(function(response) {
        var memory = response.getMemory();
        expect(memory.id).toBe('ARXX-MMM');
        expect(memory.mediaType).toBe('image/jpeg');
        expect(memory.about).toBe('https://familysearch.org/platform/memories/artifacts/ARXX-MMM');
        expect(memory.getIconURL()).toBe('https://familysearch.org/platform/memories/artifacts/ARXX-MMM?icon');
        expect(memory.getThumbnailURL()).toBe('https://familysearch.org/platform/memories/artifacts/ARXX-MMM?thumbnail');
        expect(memory.getTitle()).toBe('Birth Certificate of Ethel Hollivet');
        expect(memory.getDescription()).toBe('Shows Ethel Hollivet was born 3 Aug 1899');
      });
    });

    it('comments are returned from getMemoryComments', function() {
      FamilySearch.getMemoryComments('AR-1234').then(function(response) {
        var comments = response.getComments();
        expect(comments.length).toBe(1);
        expect(comments[0].id).toBe('CMMM-MMM');
        expect(comments[0].text).toBe('Just a comment.');
      });
    });

    it('personas are returned from getMemoryPersonas', function() {
      FamilySearch.getMemoryPersonas('AR-1234').then(function(response) {
        var personas = response.getPersonas();
        expect(personas.length).toBe(1);
        expect(personas[0].id).toBe('123');
        expect(personas[0].extracted).toBeTruthy();
        expect(personas[0].getName()).toBe('Anastasia Aleksandrova');
      });
    });

    it('portrait URL is returned from getPersonPortraitURL', function() {
      expect(FamilySearch.getPersonPortraitURL('PID')).toBe('https://sandbox.familysearch.org/platform/tree/persons/PID/portrait');
    });

    it('are returned from getPersonMemoriesQuery', function() {
      FamilySearch.getPersonMemoriesQuery('KWCR-JWS', {start: 2, count: 2}).then(function(response) {
        var memories = response.getMemories();
        expect(memories.length).toBe(2);
        expect(memories[0].id).toBe('904106');
        expect(memories[0].about).toBe('https://familysearch.org/photos/images/904106');
        expect(memories[0].getTitle()).toBe('Missionary Portrait');
        expect(memories[0].getDescription()).toBe('Alma Heaton while on a mission to Canada.');
      });
    });

    it('are returned from getUserMemoriesQuery', function() {
      FamilySearch.getUserMemoriesQuery('cis.user.batman', {start: 2, count: 1}).then(function(response) {
        var memories = response.getMemories();
        expect(memories.length).toBe(1);
        expect(memories[0].id).toBe('MMMM-PPP');
        expect(memories[0].about).toBeUndefined();
        expect(memories[0].getTitle()).toBe('NEW ARTIFACT TITLE');
        expect(memories[0].getDescription()).toBeUndefined();
      });
    });
  });
});