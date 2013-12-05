define(['FamilySearch'], function(FamilySearch) {
  describe('A source', function() {
    it('reference is returned from getPersonSourceReferences', function() {
      FamilySearch.getPersonSourceReferences('PPPP-PPP').then(function(response) {
        var refs = response.getReferences();
        expect(refs[0].getTags().length).toBe(3);
        expect(refs[1].getSourceId()).toBe('BBBB-BBB');
        expect(refs[1].getTags().length).toBe(0);
        expect(refs[1].getContributorId()).toBe('UUUU-UUU');
        expect(refs[1].getModifiedTimestamp()).toBe(987654321);
        expect(refs[1].getChangeMessage()).toBe('Dates and location match with other sources.');
      });
    });
  });
});