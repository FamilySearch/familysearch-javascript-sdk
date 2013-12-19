define(['FamilySearch'], function(FamilySearch) {
  describe('Parents and Children', function() {
    it('relationship is returned from getChildAndParents', function() {
      FamilySearch.getChildAndParents('PPPX-PP0').then(function(response) {
        var rel = response.getRelationship();
        expect(rel.id).toBe('PPPX-PP0');
        expect(rel.getFatherId()).toBe('PPPX-MP1');
        expect(rel.getMotherId()).toBe('PPPX-FP2');
        expect(rel.getChildId()).toBe('PPPX-PP3');
        expect(rel.getFatherFacts().length).toBe(1);
        expect(rel.getFatherFacts()[0].type).toBe('http://gedcomx.org/AdoptiveParent');
        expect(rel.getMotherFacts().length).toBe(1);
        expect(rel.getMotherFacts()[0].type).toBe('http://gedcomx.org/BiologicalParent');
      });
    });
  });
});