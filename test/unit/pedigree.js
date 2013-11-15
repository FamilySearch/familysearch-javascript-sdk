describe('A pedigree', function() {
  it('ancestry is returned from getAncestry', function() {
    FamilySearch.getAncestry('12345').then(function(response) {
      // I have no idea why the specified id comes back as ascendancy number 2 in the example json at
      // https://familysearch.org/developers/docs/api/tree/Read_Person_Ancestry_usecase
      // nor why living, given, and surnames are undefined, but since that's what it is, that's what to expect
      expect(response.exists(2)).toBe(true);
      expect(response.getId(2)).toBe('12345');
      expect(response.getGender(2)).toBe('Male');
      expect(response.getLifeSpan(2)).toBe('1885-1981');
      expect(response.getName(2)).toBe('Daniel Earl Bishop');
      expect(response.isLiving(2)).toBeUndefined();
      expect(response.getGivenName(2)).toBeUndefined();
      expect(response.getSurname(2)).toBeUndefined();

      expect(response.exists('3')).toBe(true);
      expect(response.getId('3')).toBe('2914');
      expect(response.getGender('3')).toBe('Female');
      expect(response.getLifeSpan('3')).toBe('1885-1949');
      expect(response.getName('3')).toBe('Maude Langston');
      expect(response.isLiving('3')).toBeUndefined();
      expect(response.getGivenName('3')).toBeUndefined();
      expect(response.getSurname('3')).toBeUndefined();

      expect(response.exists(0)).toBe(false);
      expect(response.exists(16)).toBe(false);
    });
  });
});
