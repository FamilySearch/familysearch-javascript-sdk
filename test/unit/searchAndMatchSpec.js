define(['FamilySearch'], function(FamilySearch) {
  describe('Search', function() {
    it('results are returned from getPersonSearch', function() {
      FamilySearch.getPersonSearch({surname:'Heaton'}).then(function(response) {
        expect(response.getContext()).toBe('jvihef7');
        var results = response.getResults();
        expect(results.length).toBe(2);
        expect(results[0].getId()).toBe('98765');
        expect(results[0].getTitle()).toBe('Person 98765');
        expect(results[0].getScore()).toEqual(0.95);
        expect(results[0].getConfidence()).toBeUndefined();
        expect(results[0].getPrimaryPerson().getId()).toBe('98765');
        expect(results[0].getChildren().length).toBe(1);
        expect(results[0].getChildren()[0].getId()).toBe('54321');
        expect(results[0].getSpouses().length).toBe(1);
        expect(results[0].getSpouses()[0].getId()).toBe('65432');
        expect(results[0].getFathers().length).toBe(1);
        expect(results[0].getFathers()[0].getId()).toBe('87654');
        expect(results[0].getMothers().length).toBe(1);
        expect(results[0].getMothers()[0].getId()).toBe('76543');
      });
    });
  });
});