describe('Source', function() {
  
  it('description is returned from getSourceDescription', function(done) {
    FS.getSourceDescription('https://sandbox.familysearch.org/platform/sources/descriptions/MMMM-MMM').then(function(response) {
      var sourceDesc = response.getSourceDescription();
      expect(sourceDesc.id).toBe('MMMM-MMM');
      expect(sourceDesc.about).toBe('https://familysearch.org/pal:/MM9.1.1/M9PJ-2JJ');
      expect(sourceDesc.$getCitation()).toBe('"United States Census, 1900." database and digital images, FamilySearch (https://familysearch.org/: accessed 17 Mar 2012), Ethel Hollivet, 1900; citing United States Census Office, Washington, D.C., 1900 Population Census Schedules, Los Angeles, California, population schedule, Los Angeles Ward 6, Enumeration District 58, p. 20B, dwelling 470, family 501, FHL microfilm 1,240,090; citing NARA microfilm publication T623, roll 90.');
      expect(sourceDesc.$getTitle()).toBe('1900 US Census, Ethel Hollivet');
      expect(sourceDesc.$getText()).toBe('Ethel Hollivet (line 75) with husband Albert Hollivet (line 74); also in the dwelling: step-father Joseph E Watkins (line 72), mother Lina Watkins (line 73), and grandmother -- Lina\'s mother -- Mary Sasnett (line 76).  Albert\'s mother and brother also appear on this page -- Emma Hollivet (line 68), and Eddie (line 69).');
      expect(sourceDesc.attribution).toBeUndefined(); // bad test data
      done();
    });
  });

  it('descriptions are returned from getMultiSourceDescription', function(done) {
    FS.getMultiSourceDescription(['https://sandbox.familysearch.org/platform/sources/descriptions/MMMM-MMM']).then(function(response) {
      var sourceDesc = response['https://sandbox.familysearch.org/platform/sources/descriptions/MMMM-MMM'].getSourceDescription();
      expect(sourceDesc.id).toBe('MMMM-MMM');
      expect(sourceDesc.$getTitle()).toBe('1900 US Census, Ethel Hollivet');
      done();
    });
  });
  
  it('references are returned from getSourceRefs for a person', function(done) {
    FS.getSourceRefs('https://familysearch.org/platform/tree/persons/PPPP-PPP/source-references').then(function(response) {
      var sourceRefs = response.getSourceRefs();
      expect(sourceRefs[0].$getTags()).toEqual(['http://gedcomx.org/Name', 'http://gedcomx.org/Gender', 'http://gedcomx.org/Birth']);
      expect(sourceRefs[0].$getSourceDescriptionUrl()).toBe('https://familysearch.org/platform/sources/descriptions/SSSS-SS1');
      expect(sourceRefs[1].attribution.$getAgentId()).toBe('UUUU-UUU');
      expect(sourceRefs[1].attribution.modified).toBe(987654321);
      expect(sourceRefs[1].attribution.changeMessage).toBe('Dates and location match with other sources.');
      done();
    });
  });

  it('references and descriptions are returned from getSourcesQuery for a person', function(done) {
    FS.getSourcesQuery('https://familysearch.org/platform/tree/persons/PPPP-PPP/sources').then(function(response) {
      var sourceRefs = response.getSourceRefs();
      expect(sourceRefs[0].$getTags()).toEqual(['http://gedcomx.org/Name', 'http://gedcomx.org/Gender', 'http://gedcomx.org/Birth']);
      expect(sourceRefs[0].$getSourceDescriptionUrl()).toBe('https://familysearch.org/platform/sources/descriptions/SSSS-SS1');
      expect(sourceRefs[1].attribution.$getAgentId()).toBe('UUUU-UUU');
      expect(sourceRefs[1].attribution.modified).toBe(987654321);
      expect(sourceRefs[1].attribution.changeMessage).toBe('Dates and location match with other sources.');
      var sourceDesc = response.getSourceDescription(sourceRefs[0].$getSourceDescriptionId());
      expect(sourceDesc.id).toBe('SSSS-SS1');
      expect(sourceDesc.attribution.$getAgentId()).toBe('123');
      expect(sourceDesc.$getTitle()).toBe('1900 US Census, Ethel Hollivet');
      done();
    });
  });
  
  it('references are returned from getSourceRefs for a couple', function(done) {
    FS.getSourceRefs('https://familysearch.org/platform/tree/couple-relationships/12345/source-references').then(function(response) {
      var sourceRefs = response.getSourceRefs();
      expect(sourceRefs[0].$getTags()).toEqual(['http://gedcomx.org/Name', 'http://gedcomx.org/Gender', 'http://gedcomx.org/Birth']);
      expect(sourceRefs[0].$getSourceDescriptionUrl()).toBe('https://familysearch.org/platform/sources/descriptions/SSSS-SS1');
      expect(sourceRefs[1].$getTags().length).toBe(0);
      expect(sourceRefs[1].attribution.$getAgentId()).toBe('UUUU-UUU');
      expect(sourceRefs[1].attribution.modified).toBe(987654321);
      expect(sourceRefs[1].attribution.changeMessage).toBe('Dates and location match with other sources.');
      done();
    });
  });

  it('references and descriptions are returned from getSourcesQuery for a couple', function(done) {
    FS.getSourcesQuery('https://familysearch.org/platform/tree/couple-relationships/12345/sources').then(function(response) {
      var sourceRefs = response.getSourceRefs();
      expect(sourceRefs[0].$getTags()).toEqual(['http://gedcomx.org/Name', 'http://gedcomx.org/Gender', 'http://gedcomx.org/Birth']);
      expect(sourceRefs[0].$getSourceDescriptionUrl()).toBe('https://familysearch.org/platform/sources/descriptions/SSSS-SS1');
      expect(sourceRefs[1].$getTags().length).toBe(0);
      expect(sourceRefs[1].attribution.$getAgentId()).toBe('UUUU-UUU');
      expect(sourceRefs[1].attribution.modified).toBe(987654321);
      expect(sourceRefs[1].attribution.changeMessage).toBe('Dates and location match with other sources.');
      var sourceDesc = response.getSourceDescription(sourceRefs[0].$getSourceDescriptionId());
      expect(sourceDesc.id).toBe('SSSS-SS1');
      expect(sourceDesc.attribution.$getAgentId()).toBe('123');
      expect(sourceDesc.$getTitle()).toBe('1900 US Census, Ethel Hollivet');
      done();
    });
  });

  it('references are returned from getSourceRefs for a child and parents', function(done) {
    FS.getSourceRefs('https://familysearch.org/platform/tree/child-and-parents-relationships/PPPX-PP0/source-references').then(function(response) {
      var sourceRefs = response.getSourceRefs();
      expect(sourceRefs[0].$getTags().length).toBe(0);
      expect(sourceRefs[0].attribution.modified).toBe(987654321);
      expect(sourceRefs[0].$getSourceDescriptionUrl()).toBe('https://familysearch.org/platform/sources/descriptions/SSSS-SS2');
      expect(sourceRefs[0].attribution.changeMessage).toBe('Dates and location match with other sources.');
      expect(sourceRefs[1].$getTags()).toEqual(['http://gedcomx.org/Name', 'http://gedcomx.org/Gender', 'http://gedcomx.org/Birth']);
      expect(sourceRefs[1].attribution.$getAgentId()).toBe('UUUU-UUU');
      expect(sourceRefs[1].attribution.modified).toBe(123456789);
      done();
    });
  });
  
  it('references and descriptions are returned from getSourcesQuery for a child and parents', function(done) {
    FS.getSourcesQuery('https://familysearch.org/platform/tree/child-and-parents-relationships/PPPX-PP0/sources').then(function(response) {
      var sourceRefs = response.getSourceRefs();
      expect(sourceRefs[0].$getTags().length).toBe(0);
      expect(sourceRefs[0].attribution.modified).toBe(987654321);
      expect(sourceRefs[0].$getSourceDescriptionUrl()).toBe('https://familysearch.org/platform/sources/descriptions/SSSS-SS2');
      expect(sourceRefs[0].attribution.changeMessage).toBe('Dates and location match with other sources.');
      expect(sourceRefs[1].$getTags()).toEqual(['http://gedcomx.org/Name', 'http://gedcomx.org/Gender', 'http://gedcomx.org/Birth']);
      expect(sourceRefs[1].attribution.$getAgentId()).toBe('UUUU-UUU');
      expect(sourceRefs[1].attribution.modified).toBe(123456789);
      var sourceDesc = response.getSourceDescription(sourceRefs[0].$getSourceDescriptionId());
      expect(sourceDesc.id).toBe('SSSS-SS2');
      expect(sourceDesc.attribution.$getAgentId()).toBe('123');
      expect(sourceDesc.$getTitle()).toBe('1900 US Census, Ethel Hollivet');
      done();
    });
  });

  it('references are returned from getSourceRefsQuery', function(done) {
    FS.getSourceRefsQuery('https://familysearch.org/platform/tree/source-references?description=MM93-JFK').then(function(response) {
      var personSourceRef = response.getPersonSourceRefs()[0];
      expect(personSourceRef.id).toBe('MMM9-NNG');
      expect(personSourceRef.$getSourceDescriptionUrl()).toBe('https://sandbox.familysearch.org/platform/sources/descriptions/MM93-JFK');
      expect(personSourceRef.attribution.$getAgentId()).toBe('MMD8-3NT');
      expect(personSourceRef.$getSourceDescriptionId()).toBe('MM93-JFK');

      var coupleSourceRef = response.getCoupleSourceRefs()[0];
      expect(coupleSourceRef.id).toBe('MMMM-S3D');
      expect(coupleSourceRef.$getSourceDescriptionUrl()).toBe('https://sandbox.familysearch.org/platform/sources/descriptions/MM93-JFK');
      expect(coupleSourceRef.attribution.$getAgentId()).toBe('MMD8-3NT');
      expect(coupleSourceRef.$getSourceDescriptionId()).toBe('MM93-JFK');

      var childAndParentsSourceRef = response.getChildAndParentsSourceRefs()[0];
      expect(childAndParentsSourceRef.id).toBe('MMMM-S36');
      expect(childAndParentsSourceRef.$getSourceDescriptionUrl()).toBe('https://sandbox.familysearch.org/platform/sources/descriptions/MM93-JFK');
      expect(childAndParentsSourceRef.attribution.$getAgentId()).toBe('MMD8-3NT');
      expect(childAndParentsSourceRef.$getSourceDescriptionId()).toBe('MM93-JFK');
      done();
    });
  });

  it('description is created', function(done) {
    var srcDesc = FS.createSourceDescription({
      about: 'https://familysearch.org/pal:/MM9.1.1/M9PJ-2JJ',
      $citation: '"United States Census, 1900." database and digital images, FamilySearch (https://familysearch.org/)',
      $title: '1900 US Census, Ethel Hollivet',
      $text: 'Ethel Hollivet (line 75) with husband Albert Hollivet (line 74)'
    });
    var promise = srcDesc.$save('This is the change message');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        sourceDescriptions: [{
          citations : [ {
            value : '"United States Census, 1900." database and digital images, FamilySearch (https://familysearch.org/)'
          } ],
          about: 'https://familysearch.org/pal:/MM9.1.1/M9PJ-2JJ',
          titles: [{
            value: '1900 US Census, Ethel Hollivet'
          }],
          notes: [{
            text: 'Ethel Hollivet (line 75) with husband Albert Hollivet (line 74)'
          }],
          attribution: {
            changeMessage: 'This is the change message'
          }
        }]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('https://familysearch.org/platform/sources/descriptions/MMMM-MMM');
      done();
    });
  });

  it('description is updated', function(done) {
    var srcDesc = FS.createSourceDescription({
      about: 'https://familysearch.org/pal:/MM9.1.1/M9PJ-2JJ',
      $citation: '"United States Census, 1900." database and digital images, FamilySearch (https://familysearch.org/)',
      $title: '1900 US Census, Ethel Hollivet',
      $text: 'Ethel Hollivet (line 75) with husband Albert Hollivet (line 74)'
    });
    srcDesc.id = 'MMMM-MMM';
    srcDesc.links = {
      description: {
        href: 'https://familysearch.org/platform/sources/descriptions/MMMM-MMM' 
      }
    };
    var promise = srcDesc.$save('This is the change message');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        sourceDescriptions: [{
          id: 'MMMM-MMM',
          citations : [ {
            value : '"United States Census, 1900." database and digital images, FamilySearch (https://familysearch.org/)'
          } ],
          about: 'https://familysearch.org/pal:/MM9.1.1/M9PJ-2JJ',
          titles: [{
            value: '1900 US Census, Ethel Hollivet'
          }],
          notes: [{
            text: 'Ethel Hollivet (line 75) with husband Albert Hollivet (line 74)'
          }],
          attribution: {
            changeMessage: 'This is the change message'
          },
          links: {
            description: {
              href: 'https://familysearch.org/platform/sources/descriptions/MMMM-MMM' 
            }
          }
        }]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://familysearch.org/platform/sources/descriptions/MMMM-MMM');
      done();
    });
  });

  it('description is deleted', function(done) {
    var promise = FS.deleteSourceDescription('https://familysearch.org/platform/sources/descriptions/MM93-JFK');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://familysearch.org/platform/sources/descriptions/MM93-JFK');
      done();
    });
  });

  it('reference is created', function(done) {
    var srcRef = FS.createSourceRef({
      $sourceDescription: 'https://familysearch.org/platform/sources/descriptions/MMMM-MMM',
      $tags: ['http://gedcomx.org/Name']
    });
    var promise = srcRef.$save('https://familysearch.org/platform/tree/persons/PPPP-PPP/source-references', 'This is the change message');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        persons: [{
          sources: [{
            tags: [{
              resource: 'http://gedcomx.org/Name'
            }],
            attribution: {
              changeMessage: 'This is the change message'
            },
            description: 'https://familysearch.org/platform/sources/descriptions/MMMM-MMM'
          }]
        }]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('https://familysearch.org/platform/tree/persons/PPPP-PPP/source-references/SRSR-R01');
      done();
    });
  });

  it('reference is updated', function(done) {
    var srcRef = FS.createSourceRef({
      $sourceDescription: 'https://familysearch.org/platform/sources/descriptions/MMMM-MMM',
      $tags: ['http://gedcomx.org/Name']
    });
    srcRef.id = 'SRSR-R01';
    var promise = srcRef.$save('https://familysearch.org/platform/tree/persons/PPPP-PPX/source-references', 'This is the change message');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        persons: [{
          sources: [{
            id: 'SRSR-R01',
            tags: [{
              resource: 'http://gedcomx.org/Name'
            }],
            attribution: {
              changeMessage: 'This is the change message'
            },
            description: 'https://familysearch.org/platform/sources/descriptions/MMMM-MMM'
          }]
        }]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://familysearch.org/platform/tree/persons/PPPP-PPX/source-references/SRSR-R01');
      done();
    });
  });

  it('reference is deleted from a person', function(done) {
    var promise = FS.deleteSourceRef('https://familysearch.org/platform/tree/persons/PPPP-PPP/source-references/SRSR-R01', 'testDelete use case 1 reason');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(promise.getRequest().headers['X-Reason']).toBe('testDelete use case 1 reason');
      expect(response).toBe('https://familysearch.org/platform/tree/persons/PPPP-PPP/source-references/SRSR-R01');
      done();
    });
  });

  it('reference is deleted from a couple', function(done) {
    var promise = FS.deleteSourceRef('https://familysearch.org/platform/tree/couple-relationships/RRRR-RRR/source-references/SRSR-R01', 'testDelete use case 1 reason');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(promise.getRequest().headers['X-Reason']).toBe('testDelete use case 1 reason');
      expect(response).toBe('https://familysearch.org/platform/tree/couple-relationships/RRRR-RRR/source-references/SRSR-R01');
      done();
    });
  });

  it('reference is deleted from a child-and-parents', function(done) {
    var promise = FS.deleteSourceRef('https://familysearch.org/platform/tree/child-and-parents-relationships/RRRR-RRX/source-references/SRSR-R01', 'testDelete use case 1 reason');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(promise.getRequest().headers['X-Reason']).toBe('testDelete use case 1 reason');
      expect(response).toBe('https://familysearch.org/platform/tree/child-and-parents-relationships/RRRR-RRX/source-references/SRSR-R01');
      done();
    });
  });

});
