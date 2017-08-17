  describe('Utilities', function() {
    it('redirect url is returned from getRedirectUrl', function() {
      expect(FS.getRedirectUrl({person: 'PPPP-PPP'}))
        .toBe('https://integration.familysearch.org/platform/redirect?person=PPPP-PPP&access_token=mock');
    });
  });
