describe('An access token', function() {
  it('is cached', function() {
    FS.getAccessToken('mock auth code').then(function(response) {
      expect(response).toBe('mock');
    });
  });

  it('is returned from getAccessToken', function() {
    FS.invalidateAccessToken().then(function() {
      FS.getAccessToken('mock auth code').then(function(response) {
        expect(response).toBe('2YoTnFdFEjr1zCsicMWpAA');
      });
    });
  });
});
