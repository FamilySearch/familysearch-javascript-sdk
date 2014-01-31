define(['FamilySearch'], function(FamilySearch) {
  describe('Parents and Children', function() {
    it('relationship is returned from getChildAndParents', function() {
      FamilySearch.getChildAndParents('PPPX-PP0').then(function(response) {
        var rel = response.getRelationship();
        expect(rel.id).toBe('PPPX-PP0');
        expect(rel.$getFatherId()).toBe('PPPJ-MYY');
        rel.$getFather().then(function(response) {
          var person = response.getPerson();
          expect(person.id).toBe('PPPJ-MYY');
        });
        expect(rel.$getMotherId()).toBe('PPPJ-MYZ');
        rel.$getMother().then(function(response) {
          var person = response.getPerson();
          expect(person.id).toBe('PPPJ-MYZ');
        });
        expect(rel.$getChildId()).toBe('PPPX-PP3');
        expect(rel.$getFatherFacts().length).toBe(1);
        expect(rel.$getFatherFacts()[0].type).toBe('http://gedcomx.org/AdoptiveParent');
        expect(rel.$getFatherFacts()[0] instanceof FamilySearch.Fact).toBeTruthy();
        expect(rel.$getMotherFacts().length).toBe(1);
        expect(rel.$getMotherFacts()[0].type).toBe('http://gedcomx.org/BiologicalParent');
        expect(rel.$getMotherFacts()[0] instanceof FamilySearch.Fact).toBeTruthy();
        rel.$getSourceRefs().then(function(response) {
          var sourceRefs = response.getSourceRefs();
          expect(sourceRefs.length).toBe(2);
          expect(sourceRefs[0].attribution.modified).toBe(123456789);
        });
        rel.$getNoteRefs().then(function(response) {
          var noteRefs = response.getNoteRefs();
          expect(noteRefs.length).toBe(2);
          expect(noteRefs[0].id).toBe('1804317705');
        });
      });
    });
  });
});