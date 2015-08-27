describe('An access token', function() {
 
  it('is cached', function(done) {
    FS.getAccessToken('mock auth code').then(function(response) {
      expect(response).toBe('mock');      
      done();
    });
  });

  it('is returned from getAccessToken', function(done) {
    FS.invalidateAccessToken().then(function() {
      FS.getAccessToken('mock auth code').then(function(accessToken) {
        expect(accessToken).toBe('2YoTnFdFEjr1zCsicMWpAA');
        done();
      });
    });
  });
  
  it('is returned from getAccessTokenForMobile', function(done){
    FS.invalidateAccessToken().then(function(){
      FS.getAccessTokenForMobile('username', 'password').then(function(accessToken){
        expect(accessToken).toBe('2YoTnFdFEjr1zCsicMWpAA');
        done();
      }).catch(function(e){
        console.error(e.stack);
      });
    });
  });
});

describe('getOAuth2AuthorizeURL', function(){
  
  it('returns proper url with no state', function(){
    expect(FS.getOAuth2AuthorizeURL()).toBe('https://integration.familysearch.org/cis-web/oauth2/v3/authorization?response_type=code&client_id=mock&redirect_uri=http%3A%2F%2Fexample.com%2Ffoo');
  });
  
  it('returns proper url with state', function(){
    expect(FS.getOAuth2AuthorizeURL('my_state')).toBe('https://integration.familysearch.org/cis-web/oauth2/v3/authorization?response_type=code&client_id=mock&redirect_uri=http%3A%2F%2Fexample.com%2Ffoo&state=my_state');
  });
});