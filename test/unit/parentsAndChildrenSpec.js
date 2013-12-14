define(['FamilySearch'], function(FamilySearch) {
  describe('Parents and Children', function() {
    it('relationship is returned from getChildAndParents', function() {
      FamilySearch.getChildAndParents('PPPX-PP0').then(function(response) {
        expect(response.getId()).toBe('PPPX-PP0');
        expect(response.getFatherId()).toBe('PPPX-MP1');
        expect(response.getMotherId()).toBe('PPPX-FP2');
        expect(response.getChildId()).toBe('PPPX-PP3');
        expect(response.getFatherFacts().length).toBe(1);
        expect(response.getFatherFacts()[0].getType()).toBe('http://gedcomx.org/AdoptiveParent');
        expect(response.getMotherFacts().length).toBe(1);
        expect(response.getMotherFacts()[0].getType()).toBe('http://gedcomx.org/BiologicalParent');
      });
    });
  });
});