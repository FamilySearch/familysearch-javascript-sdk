describe('A user', function() {
  it('is returned from getCurrentUser', function(done) {
    FS.getCurrentUser().then(function(response) {
      var user = response.getUser();
      expect(user.id).toBe('cis.MMM.RX9');
      expect(user.contactName).toBe('Pete Townsend');
      expect(user.email).toBe('peter@acme.org');
      expect(user.treeUserId).toBe('PXRQ-FMXT');
      done();
    });
  });

  it('agent is returned from getAgent', function(done) {
    FS.getAgent('12345').then(function(response) {
      var agent = response.getAgent();
      expect(agent.id).toBe('12345');
      expect(agent.$getName()).toBe('John Smith');
      expect(agent.$getAccountName()).toBe('account');
      expect(agent.$getEmail()).toBe('someone@somewhere.org');
      done();
    });
  });

  it('agents is returned from getMultiAgent', function(done) {
    FS.getMultiAgent(['12345']).then(function(response) {
      var agent = response['12345'].getAgent();
      expect(agent.id).toBe('12345');
      expect(agent.$getName()).toBe('John Smith');
      expect(agent.$getAccountName()).toBe('account');
      expect(agent.$getEmail()).toBe('someone@somewhere.org');
      done();
    });
  });

});