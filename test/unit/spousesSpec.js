define(['FamilySearch'], function(FamilySearch) {
  describe('Spouses', function() {
    it('relationship is returned from getCouple', function() {
      FamilySearch.getCouple('12345').then(function(response) {
        expect(response.getId()).toBe('12345');
        expect(response.getHusbandId()).toBe('pid-1');
        expect(response.getWifeId()).toBe('pid-2');
        expect(response.getFacts().length).toBe(1);
        var fact = response.getFacts()[0];
        expect(fact.getType()).toBe('http://gedcomx.org/Marriage');
        expect(fact.getDate()).toBe('June 1800');
        expect(fact.getFormalDate()).toBe('+1800-06');
        expect(fact.getPlace()).toBe('Provo, Utah, Utah, United States');
      });
    });
  });
});
