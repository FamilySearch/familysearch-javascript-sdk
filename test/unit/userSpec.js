define(['FamilySearch'], function(FamilySearch) {
  describe('A user', function() {
    it('is returned from getCurrentUser', function() {
      FamilySearch.getCurrentUser().then(function(response) {
        expect(response.getContactName()).toBe('Pete Townsend');
        expect(response.getFullName()).toBe('Pete Townsend');
        expect(response.getEmail()).toBe('peter@acme.org');
        expect(response.getTreeUserId()).toBe('PXRQ-FMXT');
      });
    });

    it('person id is returned from getCurrentUserPerson', function() {
      FamilySearch.getCurrentUserPerson().then(function(response) {
        expect(response).toBe('12345');
      });
    });

    it('contributor is returned from getAgent', function() {
      FamilySearch.getAgent('12345').then(function(response) {
        expect(response.getId()).toBe('12345');
        expect(response.getName()).toBe('John Smith');
        expect(response.getAccountName()).toBe('account');
        expect(response.getEmail()).toBe('someone@somewhere.org');
      });
    });

  });
});