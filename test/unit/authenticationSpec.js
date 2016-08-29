var querystring = require('querystring'),
    fs = require('fs');

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
      });
    });
  });
  
  if(process.env.FS_KEY_PASSWORD){
    it('is returned from getAccessTokenWithClientCredentials', function(done){
      FS.invalidateAccessToken().then(function(){
        FS.getAccessTokenWithClientCredentials(fs.readFileSync('key.pem'), process.env['FS_KEY_PASSWORD'], 1447773012436).then(function(accessToken){
          var request = __getHttpRequests()[3],
              body = request.body,
              params = querystring.parse(body);
          expect(params['client_secret']).toBe('vAo5bmjV2SZj9XCZJ5HAew6bFwrz1uuPyyQMfjlAddoELBKkZdTsaua7iK6J0AZPu9vo8Nzd/Nc/r1UHiSVR0N4N5q8DX8p5jDe+/LRzwyog1tS6zW/ke8S/x+eSNtbMhXAsHixMJkwrncMgmhoqEYX99Glh4wc4CNVU+eSB8seBDG37KTlUsEK//gm+vbt2/v6A3U4CEp7BTPMIGNWoWm0548zzO01cnZ2zezXMuwDARH0ENy3gQ37sG2tI+9MBHijO7Q8TG+4GfbVzz/QOQuDDL/rf9MonZcFF+pdaESDk7NpRGeXKGfCpHHHHQF7Eyobisdrl35WGowdCwnUzew==');
          expect(accessToken).toBe('2YoTnFdFEjr1zCsicMWpAA');
          done();
        });
      });
    });
  }
  
  it('logout', function(done){
    FS.invalidateAccessToken().then(function(response){
      expect(response.getStatusCode()).toBe(204);
      done();
    }).catch(function(e){
      console.error(e.stack);
    });
  });
});

describe('getOAuth2AuthorizeURL', function(){
  
  it('returns proper url with no state', function(){
    expect(FS.getOAuth2AuthorizeURL()).toBe('https://identint.familysearch.org/cis-web/oauth2/v3/authorization?response_type=code&client_id=mock&redirect_uri=http%3A%2F%2Fexample.com%2Ffoo');
  });
  
  it('returns proper url with state', function(){
    expect(FS.getOAuth2AuthorizeURL('my_state')).toBe('https://identint.familysearch.org/cis-web/oauth2/v3/authorization?response_type=code&client_id=mock&redirect_uri=http%3A%2F%2Fexample.com%2Ffoo&state=my_state');
  });
});