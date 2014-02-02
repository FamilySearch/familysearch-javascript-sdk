define(['FamilySearch'], function(FamilySearch) {
  describe('A pedigree', function() {
    it('ancestry is returned from getAncestry', function() {
      FamilySearch.getAncestry('12345').then(function(response) {
        // I have no idea why the specified id comes back as ascendancy number 2 in the example json at
        // https://familysearch.org/developers/docs/api/tree/Read_Person_Ancestry_usecase
        // but since that's what it is, that's what to expect
        expect(response.getPersons()[0].id).toBe('12345');

        expect(response.exists(2)).toBe(true);
        expect(response.getPerson(2).id).toBe('12345');
        expect(response.getPerson(2).$getDisplayName()).toBe('Daniel Earl Bishop');

        expect(response.exists(3)).toBe(true);
        expect(response.getPerson(3).id).toBe('2914');
        expect(response.getPerson(3).$getDisplayName()).toBe('Maude Langston');

        expect(response.exists(0)).toBe(false);
        expect(response.exists(16)).toBe(false);
      });
    });

    it('descendancy is returned from getDescendancy', function() {
      FamilySearch.getDescendancy('12345').then(function(response) {
        expect(response.getPersons()[0].id).toBe('12345');

        expect(response.exists('1')).toBe(true);
        expect(response.getPerson('1').id).toBe('12345');
        expect(response.getPerson('1').$getDisplayName()).toBe('Daniel Earl Bishop');

        expect(response.exists('1-S')).toBe(true);
        expect(response.getPerson('1-S').id).toBe('3526');
        expect(response.getPerson('1-S').$getDisplayName()).toBe('Maude Langston');

        expect(response.exists('1.1')).toBe(true);
        expect(response.getPerson('1.1').id).toBe('8413');
        expect(response.getPerson('1.1').$getDisplayName()).toBe('Nelda Bishop');

        expect(response.exists('1.10')).toBe(false);
      });
    });
  });
});