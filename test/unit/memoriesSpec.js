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
        expect(response.getArtifactURL()).toBe('https://familysearch.org/platform/memories/artifacts/ARXX-MMM');
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

    it('personas are returned from getMemoryPersonas', function() {
      FamilySearch.getMemoryPersonas('AR-1234').then(function(response) {
        expect(response.getPersonas().length).toBe(1);
        expect(response.getPersonas()[0].id).toBe('123');
        expect(response.getPersonas()[0].extracted).toBeTruthy();
        expect(response.getPersonas()[0].display.name).toBe('Anastasia Aleksandrova');
      });
    });

    it('portrait URL is returned from getPersonPortraitURL', function() {
      expect(FamilySearch.getPersonPortraitURL('PID')).toBe('https://sandbox.familysearch.org/platform/tree/persons/PID/portrait');
    });

    it('are returned from getPersonMemories', function() {
      FamilySearch.getPersonMemories('KWCR-JWS', {start: 2, count: 2}).then(function(response) {
        var memories = response.getMemories();
        expect(memories.length).toBe(2);
        expect(memories[0].getId()).toBe('904106');
        expect(memories[0].getArtifactURL()).toBe('https://familysearch.org/photos/images/904106');
        expect(memories[0].getTitle()).toBe('Missionary Portrait');
        expect(memories[0].getTitles()).toEqual(['Missionary Portrait']);
        expect(memories[0].getDescription()).toBe('Alma Heaton while on a mission to Canada.');
        expect(memories[0].getDescriptions()).toEqual(['Alma Heaton while on a mission to Canada.']);
      });
    });

    it('are returned from getUserMemories', function() {
      FamilySearch.getUserMemories('cis.user.batman', {start: 2, count: 1}).then(function(response) {
        var memories = response.getMemories();
        expect(memories.length).toBe(1);
        expect(memories[0].getId()).toBe('MMMM-PPP');
        expect(memories[0].getArtifactURL()).toBeUndefined();
        expect(memories[0].getTitle()).toBe('NEW ARTIFACT TITLE');
        expect(memories[0].getTitles()).toEqual(['NEW ARTIFACT TITLE']);
        expect(memories[0].getDescription()).toBeUndefined();
        expect(memories[0].getDescriptions()).toEqual([]);
      });
    });
  });
});