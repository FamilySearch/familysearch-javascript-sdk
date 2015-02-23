describe('An access token', function() {
  it('is cached', function(done) {
    FS.getAccessToken('mock auth code').then(function(response) {
      expect(response).toBe('mock');      
      done();
    });
  });

  it('is returned from getAccessToken', function(done) {
    FS.invalidateAccessToken().then(function() {
      FS.getAccessToken('mock auth code').then(function(response) {
        expect(response).toBe('2YoTnFdFEjr1zCsicMWpAA');
        done();
      });
    });
  });
});
