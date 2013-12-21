define(['FamilySearch'], function(FamilySearch) {
  describe('Search', function() {
    it('results are returned from getPersonSearch', function() {
      FamilySearch.getPersonSearch({surname:'Heaton'}).then(function(response) {
        expect(response.getContext()).toBe('jvihef7');
        var results = response.getSearchResults();
        expect(results.length).toBe(2);
        expect(results[0].id).toBe('98765');
        expect(results[0].title).toBe('Person 98765');
        expect(results[0].score).toEqual(0.95);
        expect(results[0].getPrimaryPerson().id).toBe('98765');
        expect(results[0].getPrimaryPerson().getName()).toBe('Israel Heaton');
        expect(results[0].getPrimaryPerson().facts[0].getDate()).toBe('30 January 1880');
        expect(results[0].getPrimaryPerson().names[0].getFullText()).toBe('Israel Heaton');
        expect(results[0].getChildren().length).toBe(1);
        expect(results[0].getChildren()[0].id).toBe('54321');
        expect(results[0].getSpouses().length).toBe(1);
        expect(results[0].getSpouses()[0].id).toBe('65432');
        expect(results[0].getFathers().length).toBe(1);
        expect(results[0].getFathers()[0].id).toBe('87654');
        expect(results[0].getMothers().length).toBe(1);
        expect(results[0].getMothers()[0].id).toBe('76543');
      });
    });

    it('match results are returned from getPersonMatches', function() {
      FamilySearch.getPersonMatches('12345').then(function(response) {
        var results = response.getSearchResults();
        expect(results.length).toBe(2);
        expect(results[0].id).toBe('98765');
        expect(results[0].title).toBe('Person 98765');
        expect(results[0].score).toEqual(0.95);
        expect(results[0].getPrimaryPerson().id).toBe('98765');
        expect(results[0].getChildren().length).toBe(1);
        expect(results[0].getChildren()[0].id).toBe('54321');
        expect(results[0].getSpouses().length).toBe(1);
        expect(results[0].getSpouses()[0].id).toBe('65432');
        expect(results[0].getFathers().length).toBe(1);
        expect(results[0].getFathers()[0].id).toBe('87654');
        expect(results[0].getMothers().length).toBe(1);
        expect(results[0].getMothers()[0].id).toBe('76543');
      });
    });

    it('match query results are returned from getPersonMatchesQuery', function() {
      FamilySearch.getPersonMatchesQuery({surname:'Heaton'}).then(function(response) {
        var results = response.getSearchResults();
        expect(results.length).toBe(2);
        expect(results[0].id).toBe('98765');
        expect(results[0].title).toBe('Person 98765');
        expect(results[0].score).toEqual(0.95);
        expect(results[0].getPrimaryPerson().id).toBe('98765');
        expect(results[0].getChildren().length).toBe(1);
        expect(results[0].getChildren()[0].id).toBe('54321');
        expect(results[0].getSpouses().length).toBe(1);
        expect(results[0].getSpouses()[0].id).toBe('65432');
        expect(results[0].getFathers().length).toBe(1);
        expect(results[0].getFathers()[0].id).toBe('87654');
        expect(results[0].getMothers().length).toBe(1);
        expect(results[0].getMothers()[0].id).toBe('76543');
      });
    });
  });
});