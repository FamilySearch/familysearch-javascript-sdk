describe('Search', function() {
  
  it('results are returned from getPersonSearch', function(done) {
    FS.getPersonSearch({surname:'Heaton'}).then(function(response) {
      expect(response.getContext()).toBe('jvihef7');
      var results = response.getSearchResults();
      expect(results.length).toBe(2);
      expect(results[0].getId()).toBe('98765');
      expect(results[0].getTitle()).toBe('Person 98765');
      expect(results[0].getScore()).toEqual(0.95);
      expect(results[0].getPrimaryPerson().getId()).toBe('98765');
      expect(results[0].getPrimaryPerson().getDisplayName()).toBe('Israel Heaton');
      expect(results[0].getPrimaryPerson().getFacts()[0].getOriginalDate()).toBe('30 January 1880');
      expect(results[0].getPrimaryPerson().getNames()[0].getFullText()).toBe('Israel Heaton');
      expect(results[0].getChildren().length).toBe(1);
      expect(results[0].getChildren()[0].getId()).toBe('54321');
      expect(results[0].getSpouses().length).toBe(1);
      expect(results[0].getSpouses()[0].getId()).toBe('65432');
      expect(results[0].getFathers().length).toBe(1);
      expect(results[0].getFathers()[0].getId()).toBe('87654');
      expect(results[0].getMothers().length).toBe(1);
      expect(results[0].getMothers()[0].getId()).toBe('76543');
      done();
    });
  });

  it('match results are returned from getPersonMatches', function(done) {
    FS.getPersonMatches('https://familysearch.org/platform/tree/persons/12345/matches').then(function(response) {
      var results = response.getSearchResults();
      expect(results.length).toBe(2);
      expect(results[0].getId()).toBe('98765');
      expect(results[0].getTitle()).toBe('Person 98765');
      expect(results[0].getScore()).toEqual(0.95);
      expect(results[0].getPrimaryPerson().getId()).toBe('98765');
      expect(results[0].getChildren().length).toBe(1);
      expect(results[0].getChildren()[0].getId()).toBe('54321');
      expect(results[0].getSpouses().length).toBe(1);
      expect(results[0].getSpouses()[0].getId()).toBe('65432');
      expect(results[0].getFathers().length).toBe(1);
      expect(results[0].getFathers()[0].getId()).toBe('87654');
      expect(results[0].getMothers().length).toBe(1);
      expect(results[0].getMothers()[0].getId()).toBe('76543');
      done();
    });
  });

  it('match query results are returned from getPersonMatchesQuery', function(done) {
    FS.getPersonMatchesQuery({surname:'Heaton'}).then(function(response) {
      var results = response.getSearchResults();
      expect(results.length).toBe(2);
      expect(results[0].getId()).toBe('98765');
      expect(results[0].getTitle()).toBe('Person 98765');
      expect(results[0].getScore()).toEqual(0.95);
      expect(results[0].getPrimaryPerson().getId()).toBe('98765');
      expect(results[0].getChildren().length).toBe(1);
      expect(results[0].getChildren()[0].getId()).toBe('54321');
      expect(results[0].getSpouses().length).toBe(1);
      expect(results[0].getSpouses()[0].getId()).toBe('65432');
      expect(results[0].getFathers().length).toBe(1);
      expect(results[0].getFathers()[0].getId()).toBe('87654');
      expect(results[0].getMothers().length).toBe(1);
      expect(results[0].getMothers()[0].getId()).toBe('76543');
      done();
    });
  });
  
  it('getResultsCounts returns 0 for empty matches response', function(done){
    FS.getPersonMatches('https://familysearch.org/platform/tree/persons/PPPP-PPP/matches')
      .then(function(response){
        expect(response.getResultsCount()).toBe(0);
        expect(response.getStatusCode()).toBe(204);
        done();
      });
  });
  
  it('handle non-string params', function(done){
    FS.getPersonSearch({
      givenName: 'Joe',
      surname: null,
      birthPlace: undefined,
      birthDate: 2014
    }).then(function(response){
      expect(response.getRequest().url).toBe('https://sandbox.familysearch.org/platform/tree/search?q=givenName%3AJoe%20birthDate%3A2014&access_token=mock');
      return FS.getPersonMatchesQuery({
        givenName: 'Joe',
        surname: null,
        birthPlace: undefined,
        birthDate: 2014
      });
    }).then(function(response){
      expect(response.getRequest().url).toBe('https://sandbox.familysearch.org/platform/tree/matches?q=givenName%3AJoe%20birthDate%3A2014&access_token=mock');
      done();
    });
  });
  
  it('getPersonSearch and getPersonMatch do not modify the params object', function(done){
    var params = {
      givenName: 'good',
      surname: null,
      other: undefined
    };
    FS.getPersonSearch(params).then(function(){
      expect(params.surname).toBe(null);
      FS.getPersonMatchesQuery(params).then(function(){
        expect(params.other).toBe(undefined);
        done();
      });
    });
  });
  
});
