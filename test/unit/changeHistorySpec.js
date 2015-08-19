describe('Change History', function() {
  
  it('is returned from getPersonChanges', function(done) {
    FS.getPerson('P12-345').then(function(response){
      response.getPerson().getChanges().then(function(response) {
        expect(response.getChanges().length).toBe(3);
        expect(response.getChanges()[0].getId()).toBe('1386263928318');
        expect(response.getChanges()[0].getAgentName()).toEqual('Mr. Contributor');
        expect(response.getChanges()[0].getTitle()).toBe('Person Created');
        expect(response.getChanges()[0].getUpdatedTimestamp()).toBe(1386263928318);
        expect(response.getChanges()[0].getChangeReason()).toBe('because it was necessary');
        expect(response.getChanges()[0].getAgentUrl()).toBe('https://familysearch.org/platform/users/agents/UKMGTY');
        response.getChanges()[0].getAgent().then(function(response) {
          var agent = response.getAgent();
          expect(agent.getName()).toBe('Agent Smith');
          done();
        });
      });
    });
  });

  it('for child and parents relationship is returned from getChildAndParentsChanges', function(done) {
    FS.getPerson('KWWC-RCL').then(function(personResponse){
      personResponse.getPerson().getChildren().then(function(childrenResponse){
        var relationships = childrenResponse.getChildAndParentsRelationships();
        expect(relationships.length).toEqual(2);
        relationships[0].reload().then(function(relationshipResponse){
          relationshipResponse.getRelationship().getChanges().then(function(changesResponse){
            expect(changesResponse.getChanges().length).toBe(4);
            expect(changesResponse.getChanges()[0].getId()).toBe('M9JY-65T');
            expect(changesResponse.getChanges()[0].getAgentName()).toEqual('API User 1372');
            expect(changesResponse.getChanges()[0].getTitle()).toBe('Father Added');
            expect(changesResponse.getChanges()[0].getUpdatedTimestamp()).toBe(1439225541440);
            expect(changesResponse.getChanges()[0].getChangeReason()).toBe(undefined);
            done();
          });
        });
      });
    });
  });

  it('for couple relationship is returned from getCoupleChanges', function(done) {
    FS.getPerson('KWWC-RCL').then(function(personResponse){
      personResponse.getPerson().getSpouses().then(function(spousesResponse){
        var relationships = spousesResponse.getCoupleRelationships();
        expect(relationships.length).toEqual(1);
        relationships[0].getChanges().then(function(changesResponse){
          expect(changesResponse.getChanges().length).toBe(7);
          expect(changesResponse.getChanges()[0].getId()).toBe('M99G-Y2X');
          expect(changesResponse.getChanges()[0].getAgentName()).toEqual('API User 1372');
          expect(changesResponse.getChanges()[0].getTitle()).toBe('Couple Note Added');
          expect(changesResponse.getChanges()[0].getUpdatedTimestamp()).toBe(1424729000697);
          expect(changesResponse.getChanges()[0].getChangeReason()).toBe(undefined);
          done();
        });
      });
    });
  });

  it('change is restored', function(done) {
    FS.getPerson('KWWC-RCL').then(function(personResponse){
      personResponse.getPerson().getChanges().then(function(changesResponse){
        var change = changesResponse.getChanges()[1];
        var promise = change.restore();
        promise.then(function() {
          var request = promise.getRequest();
          expect(request.body).toBeNull();
          expect(request.headers['Content-Type']).toBeUndefined();
          expect(promise.getStatusCode()).toBe(204);
          done();
        });
      });
    });
  });
});
