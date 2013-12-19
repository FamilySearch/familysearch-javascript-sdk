define(['FamilySearch'], function(FamilySearch) {
  describe('A user', function() {
    it('is returned from getCurrentUser', function() {
      FamilySearch.getCurrentUser().then(function(response) {
        var user = response.getUser();
        expect(user.id).toBe('cis.MMM.RX9');
        expect(user.contactName).toBe('Pete Townsend');
        expect(user.fullName).toBe('Pete Townsend');
        expect(user.email).toBe('peter@acme.org');
        expect(user.treeUserId).toBe('PXRQ-FMXT');
      });
    });

    it('person id is returned from getCurrentUserPerson', function() {
      FamilySearch.getCurrentUserPerson().then(function(response) {
        expect(response).toBe('12345');
      });
    });

    it('contributor is returned from getAgent', function() {
      FamilySearch.getAgent('12345').then(function(response) {
        var agent = response.getAgent();
        expect(agent.id).toBe('12345');
        expect(agent.getName()).toBe('John Smith');
        expect(agent.getAccountName()).toBe('account');
        expect(agent.getEmail()).toBe('someone@somewhere.org');
      });
    });

  });
});