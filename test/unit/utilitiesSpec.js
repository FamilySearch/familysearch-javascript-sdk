
describe('Utilities', function() {
  
  it('redirect url is returned from getRedirectUrl', function() {
    expect(FS.getRedirectUrl({person: 'PPPP-PPP'})).toBe('https://api-integ.familysearch.org/platform/redirect?person=PPPP-PPP&access_token=mock');
  });
  
  it('list of pending modifications is returned', function(done){
    FS.getPendingModifications().then(function(response){
      var mods = response.getPendingModifications();
      expect(mods.length).toBe(3);
      expect(mods[0].name).toBe('remove-identity-v2-login');
      expect(mods[0].enabled).toBe(false);
      expect(mods[0].activationDate).toBe(1420070400000);
      done();
    });
  });
  
  it('pending modifications are not set', function(done){
    FS.getCurrentUser().then(function(response){
      expect(response.getRequest().headers['X-FS-Feature-Tag']).toBeFalsy();
      done();
    });
  });
  
  it('pending modifications are set', function(done){
    var client = new FamilySearch({
      'client_id': 'asduck23jfs',
      'redirect_uri': '/',
      'environment': 'sandbox',
      'pending_modifications': ['pending-mod-foo', 'another-mod']
    });
    client.getCurrentUser().then(function(response){
      expect(response.getRequest().headers['X-FS-Feature-Tag']).toBe('pending-mod-foo,another-mod');
      done();
    });
  });
  
});
