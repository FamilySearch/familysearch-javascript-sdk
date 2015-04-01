describe('Search', function() {
  
  it('results are returned from getPersonSearch', function(done) {
    FS.getPersonSearch({surname:'Heaton'}).then(function(response) {
      expect(response.getContext()).toBe('jvihef7');
      var results = response.getSearchResults();
      expect(results.length).toBe(2);
      expect(results[0].id).toBe('98765');
      expect(results[0].title).toBe('Person 98765');
      expect(results[0].score).toEqual(0.95);
      expect(results[0].$getPrimaryPerson().id).toBe('98765');
      expect(results[0].$getPrimaryPerson().$getDisplayName()).toBe('Israel Heaton');
      expect(results[0].$getPrimaryPerson().facts[0].$getDate()).toBe('30 January 1880');
      expect(results[0].$getPrimaryPerson().names[0].$getFullText()).toBe('Israel Heaton');
      expect(results[0].$getChildren().length).toBe(1);
      expect(results[0].$getChildren()[0].id).toBe('54321');
      expect(results[0].$getSpouses().length).toBe(1);
      expect(results[0].$getSpouses()[0].id).toBe('65432');
      expect(results[0].$getFathers().length).toBe(1);
      expect(results[0].$getFathers()[0].id).toBe('87654');
      expect(results[0].$getMothers().length).toBe(1);
      expect(results[0].$getMothers()[0].id).toBe('76543');
      done();
    });
  });

  it('match results are returned from getPersonMatches', function(done) {
    FS.getPersonMatches('12345').then(function(response) {
      var results = response.getSearchResults();
      expect(results.length).toBe(2);
      expect(results[0].id).toBe('98765');
      expect(results[0].title).toBe('Person 98765');
      expect(results[0].score).toEqual(0.95);
      expect(results[0].$getPrimaryPerson().id).toBe('98765');
      expect(results[0].$getChildren().length).toBe(1);
      expect(results[0].$getChildren()[0].id).toBe('54321');
      expect(results[0].$getSpouses().length).toBe(1);
      expect(results[0].$getSpouses()[0].id).toBe('65432');
      expect(results[0].$getFathers().length).toBe(1);
      expect(results[0].$getFathers()[0].id).toBe('87654');
      expect(results[0].$getMothers().length).toBe(1);
      expect(results[0].$getMothers()[0].id).toBe('76543');
      done();
    });
  });

  it('match query results are returned from getPersonMatchesQuery', function(done) {
    FS.getPersonMatchesQuery({surname:'Heaton'}).then(function(response) {
      var results = response.getSearchResults();
      expect(results.length).toBe(2);
      expect(results[0].id).toBe('98765');
      expect(results[0].title).toBe('Person 98765');
      expect(results[0].score).toEqual(0.95);
      expect(results[0].$getPrimaryPerson().id).toBe('98765');
      expect(results[0].$getChildren().length).toBe(1);
      expect(results[0].$getChildren()[0].id).toBe('54321');
      expect(results[0].$getSpouses().length).toBe(1);
      expect(results[0].$getSpouses()[0].id).toBe('65432');
      expect(results[0].$getFathers().length).toBe(1);
      expect(results[0].$getFathers()[0].id).toBe('87654');
      expect(results[0].$getMothers().length).toBe(1);
      expect(results[0].$getMothers()[0].id).toBe('76543');
      done();
    });
  });
  
  it('getResultsCounts returns 0 for empty matches response', function(done){
    var promise = FS.getPersonMatches('PPPP-PPP');
    promise.then(function(response){
      expect(response.getResultsCount()).toBe(0);
      expect(promise.getStatusCode()).toBe(204);
      done();
    });
  });
  
  
  it('handle non-string params', function(done){
    var searchPromise = FS.getPersonSearch({
      givenName: 'Joe',
      surname: null,
      birthPlace: undefined,
      birthDate: 2014
    });
    searchPromise.then(function(){
      expect(searchPromise.getRequest().url).toBe('https://sandbox.familysearch.org/platform/tree/search?q=givenName%3AJoe%20birthDate%3A2014&access_token=mock');
      var matchPromise = FS.getPersonMatchesQuery({
        givenName: 'Joe',
        surname: null,
        birthPlace: undefined,
        birthDate: 2014
      });
      matchPromise.then(function(){
        expect(matchPromise.getRequest().url).toBe('https://sandbox.familysearch.org/platform/tree/matches?q=givenName%3AJoe%20birthDate%3A2014&access_token=mock');
        done();
      })
    });
  });
  
});
