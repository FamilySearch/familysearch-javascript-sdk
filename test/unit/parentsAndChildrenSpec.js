define(['FamilySearch'], function(FamilySearch) {
  describe('Parents and Children', function() {
    it('relationship is returned from getChildAndParents', function() {
      FamilySearch.getChildAndParents('PPPX-PP0').then(function(response) {
        expect(response.getId()).toBe('PPPX-PP0');
        expect(response.getFatherId()).toBe('PPPX-MP1');
        expect(response.getMotherId()).toBe('PPPX-FP2');
        expect(response.getChildId()).toBe('PPPX-PP3');
        expect(response.getFatherType()).toBe('http://gedcomx.org/AdoptiveParent');
        expect(response.getMotherType()).toBe('http://gedcomx.org/BiologicalParent');
      });
    });
  });
});