define(['FamilySearch'], function(FamilySearch) {
  describe('A source', function() {
    it('reference is returned from getPersonSourceReferences', function() {
      FamilySearch.getPersonSourceReferences('PPPP-PPP').then(function(response) {
        var refs = response.getReferences();
        expect(refs[0].getTags().length).toBe(3);
        expect(refs[1].getSourceId()).toBe('BBBB-BBB');
        expect(refs[1].getTags().length).toBe(0);
        expect(refs[1].getContributorId()).toBe('UUUU-UUU');
        expect(refs[1].getModifiedTimestamp()).toBe(987654321);
        expect(refs[1].getChangeMessage()).toBe('Dates and location match with other sources.');
      });
    });

    it('description is returned from getSourceDescription', function() {
      FamilySearch.getSourceDescription('MMMM-MMM').then(function(response) {
        expect(response.getId()).toBe('MMMM-MMM');
        expect(response.getTitles()).toEqual(['1900 US Census, Ethel Hollivet']);
        expect(response.getTitle()).toBe('1900 US Census, Ethel Hollivet');
        expect(response.getCitations()).toEqual(['"United States Census, 1900." database and digital images, FamilySearch (https://familysearch.org/: accessed 17 Mar 2012), Ethel Hollivet, 1900; citing United States Census Office, Washington, D.C., 1900 Population Census Schedules, Los Angeles, California, population schedule, Los Angeles Ward 6, Enumeration District 58, p. 20B, dwelling 470, family 501, FHL microfilm 1,240,090; citing NARA microfilm publication T623, roll 90.']);
        expect(response.getNotes()).toEqual(['Ethel Hollivet (line 75) with husband Albert Hollivet (line 74); also in the dwelling: step-father Joseph E Watkins (line 72), mother Lina Watkins (line 73), and grandmother -- Lina\'s mother -- Mary Sasnett (line 76).  Albert\'s mother and brother also appear on this page -- Emma Hollivet (line 68), and Eddie (line 69).']);
        expect(response.getAbout()).toBe('https://familysearch.org/pal:/MM9.1.1/M9PJ-2JJ');
      });
    });
  });
});