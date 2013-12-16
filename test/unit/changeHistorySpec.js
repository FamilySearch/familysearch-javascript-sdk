define(['FamilySearch'], function(FamilySearch) {
  describe('Change History', function() {
    it('is returned from getPersonChangeHistory', function() {
      FamilySearch.getPersonChangeHistory('P12-345').then(function(response) {
        expect(response.getChanges().length).toBe(3);
        expect(response.getChanges()[0].getId()).toBe('1386263928318');
        expect(response.getChanges()[0].getContributorName()).toEqual('Mr. Contributor');
        expect(response.getChanges()[0].getTitle()).toBe('Person Created');
        expect(response.getChanges()[0].getUpdatedTimestamp()).toBe(1386263928318);
        expect(response.getChanges()[0].getChangeReason()).toBe('because it was necessary');
      });
    });
  });
});