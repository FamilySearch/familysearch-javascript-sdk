define(['FamilySearch'], function(FamilySearch) {
  describe('Spouses', function() {
    it('relationship is returned from getCouple', function() {
      FamilySearch.getCouple('12345').then(function(response) {
        var rel = response.getRelationship();
        expect(rel.id).toBe('12345');
        expect(rel.$getHusbandId()).toBe('PPPJ-MYY');
        rel.$getHusband().then(function(response) {
          var person = response.getPerson();
          expect(person.id).toBe('PPPJ-MYY');
        });
        expect(rel.$getWifeId()).toBe('PPPJ-MYZ');
        rel.$getWife().then(function(response) {
          var person = response.getPerson();
          expect(person.id).toBe('PPPJ-MYZ');
        });
        expect(rel.$getFacts().length).toBe(1);
        var fact = rel.$getFacts()[0];
        expect(fact.type).toBe('http://gedcomx.org/Marriage');
        expect(rel.$getMarriageFact().$getDate()).toBe('June 1800');
        expect(fact.$getDate()).toBe('June 1800');
        expect(fact.$getFormalDate()).toBe('+1800-06');
        expect(fact.$getPlace()).toBe('Provo, Utah, Utah, United States');
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
        rel.$getChanges().then(function(response) {
          var changes = response.getChanges();
          expect(changes.length).toBe(3);
          expect(changes[0].id).toBe('1386863423023');
        });
      });
    });
  });
});
