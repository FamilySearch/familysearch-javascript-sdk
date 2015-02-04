var FamilySearch = require('../../src/FamilySearch');

describe('Change History', function() {
  it('is returned from getPersonChanges', function(done) {
    FS.getPersonChanges('P12-345').then(function(response) {
      expect(response.getChanges().length).toBe(3);
      expect(response.getChanges()[0].id).toBe('1386263928318');
      expect(response.getChanges()[0].$getAgentName()).toEqual('Mr. Contributor');
      expect(response.getChanges()[0].title).toBe('Person Created');
      expect(response.getChanges()[0].updated).toBe(1386263928318);
      expect(response.getChanges()[0].$getChangeReason()).toBe('because it was necessary');
      expect(response.getChanges()[0].$getAgentUrl()).toBe('https://familysearch.org/platform/users/agents/UKMGTY');
      response.getChanges()[0].$getAgent().then(function(response) {
        var agent = response.getAgent();
        expect(agent.$getName()).toBe('Agent Smith');
        done();
      });
    });
  });

  it('for child and parents relationship is returned from getChildAndParentsChanges', function(done) {
    FS.getChildAndParentsChanges('PPPX-PP0').then(function(response) {
      expect(response.getChanges().length).toBe(3);
      expect(response.getChanges()[0].id).toBe('1386863479538');
      expect(response.getChanges()[0].$getAgentName()).toEqual('Mr. Contributor');
      expect(response.getChanges()[0].title).toBe('Child and Parents Relationship Created');
      expect(response.getChanges()[0].updated).toBe(1386863479538);
      expect(response.getChanges()[0].$getChangeReason()).toBe('because it was necessary');
      done();
    });
  });

  it('for couple relationship is returned from getCoupleChanges', function(done) {
    FS.getCoupleChanges('12345').then(function(response) {
      expect(response.getChanges().length).toBe(3);
      expect(response.getChanges()[0].id).toBe('1386863423023');
      expect(response.getChanges()[0].$getAgentName()).toEqual('Mr. Contributor');
      expect(response.getChanges()[0].title).toBe('Couple Relationship Created');
      expect(response.getChanges()[0].updated).toBe(1386863423023);
      expect(response.getChanges()[0].$getChangeReason()).toBe('because it was necessary');
      done();
    });
  });

  it('change is restored', function(done) {
    var promise = FS.restoreChange('C12-345');
    promise.then(function() {
      var request = promise.getRequest();
      expect(request.body).toBeNull();
      expect(request.headers['Content-Type']).toBeUndefined();
      expect(promise.getStatusCode()).toBe(204);
      done();
    });
  });
});
