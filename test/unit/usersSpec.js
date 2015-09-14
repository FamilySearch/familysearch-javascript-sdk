describe('A user', function() {
  
  it('is returned from getCurrentUser', function(done) {
    FS.getCurrentUser().then(function(response) {
      var user = response.getUser();
      expect(user.getId()).toBe('cis.MMM.RX9');
      expect(user.getContactName()).toBe('Pete Townsend');
      expect(user.getEmail()).toBe('peter@acme.org');
      expect(user.getTreeUserId()).toBe('PXRQ-FMXT');
      done();
    });
  });

  it('agent is returned from getAgent', function(done) {
    FS.getAgent('https://sandbox.familysearch.org/platform/users/agents/12345').then(function(response) {
      var agent = response.getAgent();
      expect(agent.getId()).toBe('12345');
      expect(agent.getName()).toBe('John Smith');
      expect(agent.getAccountName()).toBe('account');
      expect(agent.getEmail()).toBe('someone@somewhere.org');
      done();
    });
  });

  it('agents is returned from getMultiAgent', function(done) {
    FS.getMultiAgent(['https://sandbox.familysearch.org/platform/users/agents/12345']).then(function(response) {
      var agent = response['https://sandbox.familysearch.org/platform/users/agents/12345'].getAgent();
      expect(agent.getId()).toBe('12345');
      expect(agent.getName()).toBe('John Smith');
      expect(agent.getAccountName()).toBe('account');
      expect(agent.getEmail()).toBe('someone@somewhere.org');
      done();
    });
  });
  
  it('current user person is returned', function(done){
    FS.getCurrentUserPerson().then(function(response){
      var person = response.getPerson();
      expect(person.getId()).toBe('P12-345');
      expect(person.getDisplayName()).toBe('Alexa Aleksandrova');
      done();
    }).catch(function(e){
      console.error(e.stack);
    });
  });

});