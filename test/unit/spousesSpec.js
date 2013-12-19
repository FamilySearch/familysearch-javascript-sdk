define(['FamilySearch'], function(FamilySearch) {
  describe('Spouses', function() {
    it('relationship is returned from getCouple', function() {
      FamilySearch.getCouple('12345').then(function(response) {
        var rel = response.getRelationship();
        expect(rel.id).toBe('12345');
        expect(rel.getHusbandId()).toBe('pid-1');
        expect(rel.getWifeId()).toBe('pid-2');
        expect(rel.getFacts().length).toBe(1);
        var fact = rel.getFacts()[0];
        expect(fact.type).toBe('http://gedcomx.org/Marriage');
        expect(fact.getDate()).toBe('June 1800');
        expect(fact.getFormalDate()).toBe('+1800-06');
        expect(fact.getPlace()).toBe('Provo, Utah, Utah, United States');
      });
    });
  });
});
