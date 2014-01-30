define(['FamilySearch'], function(FamilySearch) {
  describe('Change History', function() {
    it('is returned from getPersonChanges', function() {
      FamilySearch.getPersonChanges('P12-345').then(function(response) {
        expect(response.getChanges().length).toBe(3);
        expect(response.getChanges()[0].id).toBe('1386263928318');
        expect(response.getChanges()[0].$getContributorName()).toEqual('Mr. Contributor');
        expect(response.getChanges()[0].title).toBe('Person Created');
        expect(response.getChanges()[0].updated).toBe(1386263928318);
        expect(response.getChanges()[0].$getChangeReason()).toBe('because it was necessary');
        expect(response.getChanges()[0].$getAgentURL()).toBe('https://familysearch.org/platform/users/agents/UKMGTY');
        response.getChanges()[0].$getAgent().then(function(response) {
          var agent = response.getAgent();
          expect(agent.$getName()).toBe('Agent Smith');
        });
      });
    });

    it('for child and parents relationship is returned from getChildAndParentsChanges', function() {
      FamilySearch.getChildAndParentsChanges('PC12-345').then(function(response) {
        expect(response.getChanges().length).toBe(3);
        expect(response.getChanges()[0].id).toBe('1386863479538');
        expect(response.getChanges()[0].$getContributorName()).toEqual('Mr. Contributor');
        expect(response.getChanges()[0].title).toBe('Child and Parents Relationship Created');
        expect(response.getChanges()[0].updated).toBe(1386863479538);
        expect(response.getChanges()[0].$getChangeReason()).toBe('because it was necessary');
      });
    });

    it('for couple relationship is returned from getCoupleChanges', function() {
      FamilySearch.getCoupleChanges('P12-345').then(function(response) {
        expect(response.getChanges().length).toBe(3);
        expect(response.getChanges()[0].id).toBe('1386863423023');
        expect(response.getChanges()[0].$getContributorName()).toEqual('Mr. Contributor');
        expect(response.getChanges()[0].title).toBe('Couple Relationship Created');
        expect(response.getChanges()[0].updated).toBe(1386863423023);
        expect(response.getChanges()[0].$getChangeReason()).toBe('because it was necessary');
      });
    });
  });
});