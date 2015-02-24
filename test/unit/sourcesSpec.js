var utils = require('../../src/utils');

describe('Source', function() {
  it('description is returned from getSourceDescription', function(done) {
    FS.getSourceDescription('MMMM-MMM').then(function(response) {
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
    FS.getMultiSourceDescription(['MMMM-MMM']).then(function(response) {
      var sourceDesc = response['MMMM-MMM'].getSourceDescription();
      expect(sourceDesc.id).toBe('MMMM-MMM');
      expect(sourceDesc.$getTitle()).toBe('1900 US Census, Ethel Hollivet');
      done();
    });
  });
  
  it('references are returned from getPersonSourceRefs', function(done) {
    FS.getPersonSourceRefs('PPPP-PPP').then(function(response) {
      var sourceRefs = response.getSourceRefs();
      expect(sourceRefs[0].$getTags()).toEqual(['http://gedcomx.org/Name', 'http://gedcomx.org/Gender', 'http://gedcomx.org/Birth']);
      expect(sourceRefs[0].$personId).toBe('PPPP-PPP');
      expect(sourceRefs[0].$sourceDescriptionId).toBe('SSSS-SS1');
      expect(sourceRefs[0].$getSourceDescriptionUrl()).toBe('https://sandbox.familysearch.org/platform/sources/descriptions/SSSS-SS1');
      expect(sourceRefs[1].attribution.$getAgentId()).toBe('UUUU-UUU');
      expect(sourceRefs[1].attribution.modified).toBe(987654321);
      expect(sourceRefs[1].attribution.changeMessage).toBe('Dates and location match with other sources.');
      done();
    });
  });

  it('references and descriptions are returned from getPersonSourcesQuery', function(done) {
    FS.getPersonSourcesQuery('PPPP-PPP').then(function(response) {
      var sourceRefs = response.getSourceRefs();
      expect(sourceRefs[0].$getTags()).toEqual(['http://gedcomx.org/Name', 'http://gedcomx.org/Gender', 'http://gedcomx.org/Birth']);
      expect(sourceRefs[0].$personId).toBe('PPPP-PPP');
      expect(sourceRefs[0].$sourceDescriptionId).toBe('SSSS-SS1');
      expect(sourceRefs[0].$getSourceDescriptionUrl()).toBe('https://sandbox.familysearch.org/platform/sources/descriptions/SSSS-SS1');
      expect(sourceRefs[1].attribution.$getAgentId()).toBe('UUUU-UUU');
      expect(sourceRefs[1].attribution.modified).toBe(987654321);
      expect(sourceRefs[1].attribution.changeMessage).toBe('Dates and location match with other sources.');
      var sourceDesc = response.getSourceDescription(sourceRefs[0].$sourceDescriptionId);
      expect(sourceDesc.id).toBe('SSSS-SS1');
      expect(sourceDesc.attribution.$getAgentId()).toBe('123');
      expect(sourceDesc.$getTitle()).toBe('1900 US Census, Ethel Hollivet');
      done();
    });
  });
  
  it('references are returned from getCoupleSourceRefs', function(done) {
    FS.getCoupleSourceRefs('12345').then(function(response) {
      var sourceRefs = response.getSourceRefs();
      expect(sourceRefs[0].$getTags()).toEqual(['http://gedcomx.org/Name', 'http://gedcomx.org/Gender', 'http://gedcomx.org/Birth']);
      expect(sourceRefs[0].$coupleId).toBe('12345');
      expect(sourceRefs[0].$sourceDescriptionId).toBe('SSSS-SS1');
      expect(sourceRefs[0].$getSourceDescriptionUrl()).toBe('https://sandbox.familysearch.org/platform/sources/descriptions/SSSS-SS1');
      expect(sourceRefs[1].$getTags().length).toBe(0);
      expect(sourceRefs[1].attribution.$getAgentId()).toBe('UUUU-UUU');
      expect(sourceRefs[1].attribution.modified).toBe(987654321);
      expect(sourceRefs[1].attribution.changeMessage).toBe('Dates and location match with other sources.');
      done();
    });
  });

  it('references and descriptions are returned from getCoupleSourcesQuery', function(done) {
    FS.getCoupleSourcesQuery('12345').then(function(response) {
      var sourceRefs = response.getSourceRefs();
      expect(sourceRefs[0].$getTags()).toEqual(['http://gedcomx.org/Name', 'http://gedcomx.org/Gender', 'http://gedcomx.org/Birth']);
      expect(sourceRefs[0].$coupleId).toBe('12345');
      expect(sourceRefs[0].$sourceDescriptionId).toBe('SSSS-SS1');
      expect(sourceRefs[0].$getSourceDescriptionUrl()).toBe('https://sandbox.familysearch.org/platform/sources/descriptions/SSSS-SS1');
      expect(sourceRefs[1].$getTags().length).toBe(0);
      expect(sourceRefs[1].attribution.$getAgentId()).toBe('UUUU-UUU');
      expect(sourceRefs[1].attribution.modified).toBe(987654321);
      expect(sourceRefs[1].attribution.changeMessage).toBe('Dates and location match with other sources.');
      var sourceDesc = response.getSourceDescription(sourceRefs[0].$sourceDescriptionId);
      expect(sourceDesc.id).toBe('SSSS-SS1');
      expect(sourceDesc.attribution.$getAgentId()).toBe('123');
      expect(sourceDesc.$getTitle()).toBe('1900 US Census, Ethel Hollivet');
      done();
    });
  });

  it('references are returned from getChildAndParentsSourceRefs', function(done) {
    FS.getChildAndParentsSourceRefs('PPPX-PP0').then(function(response) {
      var sourceRefs = response.getSourceRefs();
      expect(sourceRefs[0].$getTags().length).toBe(0);
      expect(sourceRefs[0].attribution.modified).toBe(987654321);
      expect(sourceRefs[0].$childAndParentsId).toBe('PPPX-PP0');
      expect(sourceRefs[0].$sourceDescriptionId).toBe('SSSS-SS2');
      expect(sourceRefs[0].$getSourceDescriptionUrl()).toBe('https://sandbox.familysearch.org/platform/sources/descriptions/SSSS-SS2');
      expect(sourceRefs[0].attribution.changeMessage).toBe('Dates and location match with other sources.');
      expect(sourceRefs[1].$getTags()).toEqual(['http://gedcomx.org/Name', 'http://gedcomx.org/Gender', 'http://gedcomx.org/Birth']);
      expect(sourceRefs[1].attribution.$getAgentId()).toBe('UUUU-UUU');
      expect(sourceRefs[1].attribution.modified).toBe(123456789);
      done();
    });
  });
  
  it('references and descriptions are returned from getChildAndParentsSourcesQuery', function(done) {
    FS.getChildAndParentsSourcesQuery('PPPX-PP0').then(function(response) {
      var sourceRefs = response.getSourceRefs();
      expect(sourceRefs[0].$getTags().length).toBe(0);
      expect(sourceRefs[0].attribution.modified).toBe(987654321);
      expect(sourceRefs[0].$childAndParentsId).toBe('PPPX-PP0');
      expect(sourceRefs[0].$sourceDescriptionId).toBe('SSSS-SS2');
      expect(sourceRefs[0].$getSourceDescriptionUrl()).toBe('https://sandbox.familysearch.org/platform/sources/descriptions/SSSS-SS2');
      expect(sourceRefs[0].attribution.changeMessage).toBe('Dates and location match with other sources.');
      expect(sourceRefs[1].$getTags()).toEqual(['http://gedcomx.org/Name', 'http://gedcomx.org/Gender', 'http://gedcomx.org/Birth']);
      expect(sourceRefs[1].attribution.$getAgentId()).toBe('UUUU-UUU');
      expect(sourceRefs[1].attribution.modified).toBe(123456789);
      var sourceDesc = response.getSourceDescription(sourceRefs[0].$sourceDescriptionId);
      expect(sourceDesc.id).toBe('SSSS-SS2');
      expect(sourceDesc.attribution.$getAgentId()).toBe('123');
      expect(sourceDesc.$getTitle()).toBe('1900 US Census, Ethel Hollivet');
      done();
    });
  });

  it('references are returned from getSourceRefsQuery', function(done) {
    FS.getSourceRefsQuery('MM93-JFK').then(function(response) {
      var personSourceRef = response.getPersonSourceRefs()[0];
      expect(personSourceRef.id).toBe('MMM9-NNG');
      expect(personSourceRef.$getSourceDescriptionUrl()).toBe('https://sandbox.familysearch.org/platform/sources/descriptions/MM93-JFK');
      expect(personSourceRef.attribution.$getAgentId()).toBe('MMD8-3NT');
      expect(personSourceRef.$personId).toBe('KW7V-Y32');
      expect(personSourceRef.$sourceDescriptionId).toBe('MM93-JFK');

      var coupleSourceRef = response.getCoupleSourceRefs()[0];
      expect(coupleSourceRef.id).toBe('MMMM-S3D');
      expect(coupleSourceRef.$getSourceDescriptionUrl()).toBe('https://sandbox.familysearch.org/platform/sources/descriptions/MM93-JFK');
      expect(coupleSourceRef.attribution.$getAgentId()).toBe('MMD8-3NT');
      expect(coupleSourceRef.$coupleId).toBe('MMM7-12S');
      expect(coupleSourceRef.$sourceDescriptionId).toBe('MM93-JFK');

      var childAndParentsSourceRef = response.getChildAndParentsSourceRefs()[0];
      expect(childAndParentsSourceRef.id).toBe('MMMM-S36');
      expect(childAndParentsSourceRef.$getSourceDescriptionUrl()).toBe('https://sandbox.familysearch.org/platform/sources/descriptions/MM93-JFK');
      expect(childAndParentsSourceRef.attribution.$getAgentId()).toBe('MMD8-3NT');
      expect(childAndParentsSourceRef.$childAndParentsId).toBe('MMMP-KN5');
      expect(childAndParentsSourceRef.$sourceDescriptionId).toBe('MM93-JFK');
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
    var promise = srcDesc.$save('This is the change message', true);
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
      expect(response).toBe('MMMM-MMM');
      expect(srcDesc.id).toBe('MMMM-MMM');  // re-read from database
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
          }
        }]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('MMMM-MMM');
      done();
    });
  });

  it('description is deleted', function(done) {
    var promise = FS.deleteSourceDescription('MM93-JFK');
    promise.then(function(response) {
      var requests = FS.getHttpRequests();
      expect(utils.find(requests, {
        method: 'DELETE',
        url:'https://sandbox.familysearch.org/platform/tree/persons/KW7V-Y32/source-references/MMM9-NNG?access_token=mock'})
      ).toBeTruthy();
      expect(utils.find(requests, {
        method: 'DELETE',
        url:'https://sandbox.familysearch.org/platform/tree/couple-relationships/MMM7-12S/source-references/MMMM-S3D?access_token=mock'})
      ).toBeTruthy();
      expect(utils.find(requests, {
        method: 'DELETE',
        url:'https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/MMMP-KN5/source-references/MMMM-S36?access_token=mock'})
      ).toBeTruthy();
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('MM93-JFK');
      done();
    });
  });

  it('reference is created', function(done) {
    var srcRef = FS.createSourceRef({
      $personId: 'PPPP-PPP',
      $sourceDescription: 'MMMM-MMM',
      $tags: ['http://gedcomx.org/Name']
    });
    var promise = srcRef.$save('This is the change message');
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
            description: 'https://sandbox.familysearch.org/platform/sources/descriptions/MMMM-MMM'
          }]
        }]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('SRSR-R01');
      expect(srcRef.id).toBe('SRSR-R01');  // updated
      done();
    });
  });

  it('reference is updated', function(done) {
    var srcRef = FS.createSourceRef({
      $personId: 'PPPP-PPX',
      $sourceDescription: 'MMMM-MMM',
      $tags: ['http://gedcomx.org/Name']
    });
    srcRef.id = 'SRSR-R01';
    var promise = srcRef.$save('This is the change message');
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
            description: 'https://sandbox.familysearch.org/platform/sources/descriptions/MMMM-MMM'
          }]
        }]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('SRSR-R01');
      done();
    });
  });

  it('reference is deleted from a person', function(done) {
    var promise = FS.deletePersonSourceRef('PPPP-PPP', 'SRSR-R01', 'testDelete use case 1 reason');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(promise.getRequest().headers['X-Reason']).toBe('testDelete use case 1 reason');
      expect(response).toBe('PPPP-PPP');
      done();
    });
  });

  it('reference is deleted from a couple', function(done) {
    var promise = FS.deleteCoupleSourceRef('RRRR-RRR', 'SRSR-R01', 'testDelete use case 1 reason');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(promise.getRequest().headers['X-Reason']).toBe('testDelete use case 1 reason');
      expect(response).toBe('RRRR-RRR');
      done();
    });
  });

  it('reference is deleted from a child-and-parents', function(done) {
    var promise = FS.deleteChildAndParentsSourceRef('RRRR-RRX', 'SRSR-R01', 'testDelete use case 1 reason');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(promise.getRequest().headers['X-Reason']).toBe('testDelete use case 1 reason');
      expect(response).toBe('RRRR-RRX');
      done();
    });
  });

});
