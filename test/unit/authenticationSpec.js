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

describe('getOAuth2AuthorizeURL', function(){
  it('returns proper url with no state', function(done){
    FS.getOAuth2AuthorizeURL().then(function(url){
      expect(url).toBe('https://sandbox.familysearch.org/cis-web/oauth2/v3/authorization?response_type=code&client_id=mock&redirect_uri=http%3A%2F%2Fexample.com%2Ffoo');
      done();
    });
  });
  
  it('returns proper url with state', function(done){
    FS.getOAuth2AuthorizeURL('my_state').then(function(url){
      expect(url).toBe('https://sandbox.familysearch.org/cis-web/oauth2/v3/authorization?response_type=code&client_id=mock&redirect_uri=http%3A%2F%2Fexample.com%2Ffoo&state=my_state');
      done();
    });
  });
});