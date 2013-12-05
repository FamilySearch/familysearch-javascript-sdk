define(['FamilySearch'], function(FamilySearch) {
  describe('Source', function() {
    it('references are returned from getPersonSourceReferences', function() {
      FamilySearch.getPersonMemoryReferences('PPPP-PPP').then(function(response) {
        var memories = response.getMemories();
        expect(memories.length).toBe(2);
        expect(memories[0].getMemoryId()).toBe('3649');
        expect(memories[0].getPersonaId()).toBe('1083');
      });
    });
  });
});