define(['FamilySearch'], function(FamilySearch) {
  describe('An access token', function() {
    it('is cached', function() {
      FamilySearch.getAccessToken('mock auth code').then(function(response) {
        expect(response).toBe('mock');
      });
    });

    it('is returned from getAccessToken', function() {
      FamilySearch.invalidateAccessToken().then(function() {
        FamilySearch.getAccessToken('mock auth code').then(function(response) {
          expect(response).toBe('2YoTnFdFEjr1zCsicMWpAA');
        });
      });
    });
  });
});
