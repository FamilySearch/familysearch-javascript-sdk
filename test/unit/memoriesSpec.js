define(['FamilySearch'], function(FamilySearch) {
  describe('Memory', function() {
    it('references are returned from getPersonMemoryRefs', function() {
      FamilySearch.getMemoryPersonaRefs('PPPP-PPP').then(function(response) {
        var memoryRefs = response.getMemoryPersonaRefs();
        expect(memoryRefs.length).toBe(2);
        expect(memoryRefs[0].resource).toBe('https://familysearch.org/platform/memories/memories/ARXX-MMM/personas/1083');
        expect(memoryRefs[0].resourceId).toBe('1083');
        expect(memoryRefs[0].$getMemoryId()).toBe('ARXX-MMM');
        memoryRefs[0].$getMemory().then(function(response) {
          var memory = response.getMemory();
          expect(memory.id).toBe('ARXX-MMM');
        });
      });
    });

    it('is returned from getMemory', function() {
      FamilySearch.getMemory('ARXX-MMM').then(function(response) {
        var memory = response.getMemory();
        expect(memory.id).toBe('ARXX-MMM');
        expect(memory.mediaType).toBe('image/jpeg');
        expect(memory.about).toBe('https://familysearch.org/platform/memories/artifacts/ARXX-MMM');
        expect(memory.$getIconUrl()).toBe('https://familysearch.org/platform/memories/artifacts/ARXX-MMM?icon&access_token=mock');
        expect(memory.$getThumbnailUrl()).toBe('https://familysearch.org/platform/memories/artifacts/ARXX-MMM?thumbnail&access_token=mock');
        expect(memory.$getTitle()).toBe('Birth Certificate of Ethel Hollivet');
        expect(memory.$getDescription()).toBe('Shows Ethel Hollivet was born 3 Aug 1899');
      });
    });

    it('comments are returned from getMemoryComments', function() {
      FamilySearch.getMemoryComments('AR-1234').then(function(response) {
        var comments = response.getComments();
        expect(comments.length).toBe(1);
        expect(comments[0].id).toBe('CMMM-MMM');
        expect(comments[0].text).toBe('Just a comment.');
      });
    });

    it('personas are returned from getMemoryPersonas', function() {
      FamilySearch.getMemoryPersonas('AR-1234').then(function(response) {
        var personas = response.getMemoryPersonas();
        expect(personas.length).toBe(1);
        expect(personas[0].id).toBe('123');
        expect(personas[0].extracted).toBeTruthy();
        expect(personas[0].$getDisplayName()).toBe('Anastasia Aleksandrova');
        expect(personas[0].$getPreferredName().$getFullText()).toBe('Anastasia Aleksandrova');
        expect(personas[0].$getNames().length).toBe(1);
        expect(personas[0].$getMemoryArtifactRef().$getMemoryArtifactUrl()).toBe('https://familysearch.org/platform/memories/artifacts/132692/description?access_token=mock');
      });
    });

    it('portrait URL is returned from getPersonPortraitUrl', function() {
      FamilySearch.getPersonPortraitUrl('PID').then(function(response) {
        expect(response).toBe('https://sandbox.familysearch.org/platform/tree/persons/PID/portrait?access_token=mock');
      });
    });

    it('are returned from getPersonMemoriesQuery', function() {
      FamilySearch.getPersonMemoriesQuery('KWCR-JWS', {start: 2, count: 2}).then(function(response) {
        var memories = response.getMemories();
        expect(memories.length).toBe(2);
        expect(memories[0].id).toBe('904106');
        expect(memories[0].about).toBe('https://familysearch.org/photos/images/904106');
        expect(memories[0].$getTitle()).toBe('Missionary Portrait');
        expect(memories[0].$getDescription()).toBe('Alma Heaton while on a mission to Canada.');
      });
    });

    it('are returned from getUserMemoriesQuery', function() {
      FamilySearch.getUserMemoriesQuery('cis.user.batman', {start: 2, count: 1}).then(function(response) {
        var memories = response.getMemories();
        expect(memories.length).toBe(1);
        expect(memories[0].id).toBe('MMMM-PPP');
        expect(memories[0].about).toBeUndefined();
        expect(memories[0].$getTitle()).toBe('NEW ARTIFACT TITLE');
        expect(memories[0].$getDescription()).toBeUndefined();
      });
    });

    it('is created', function() {
      var promise = FamilySearch.createMemory('Test', {title: 'Grandfather\'s Horse'});
      promise.then(function(response) {
        var request = promise.getRequest();
        expect(request.headers['Content-Type']).toBe('text/plain');
        expect(request.data).toBe('Test');
        expect(promise.getStatusCode()).toBe(201);
        expect(response).toBe('https://familysearch.org/platform/memories/memories/12345');
      });
    });

    it('persona is created', function() {
      var persona = new FamilySearch.MemoryPersona('Anastasia Aleksandrova', 'https://familysearch.org/platform/memories/artifacts/AR-1234/description');
      var promise = FamilySearch.addMemoryPersona('AR-1234', persona);
      promise.then(function(response) {
        var request = promise.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.data).toEqualJson({
          persons: [{
            media : [ {
              description : 'https://familysearch.org/platform/memories/artifacts/AR-1234/description'
            } ],
            names: [{
              nameForms: [{
                fullText: 'Anastasia Aleksandrova'
              }]
            }]
          }]
        });
        expect(promise.getStatusCode()).toBe(201);
        expect(response instanceof FamilySearch.MemoryPersonaRef).toBeTruthy();
        expect(response.$getMemoryId()).toBe('AR-1234');
        expect(response.resource).toBe('https://familysearch.org/platform/memories/memories/AR-1234/personas/PXX-1234');
      });
    });

    it('ref is added to a person', function() {
      var memoryPersonaRef = new FamilySearch.MemoryPersonaRef('https://familysearch.org/platform/memories/memories/3649/personas/1083');
      var promise = FamilySearch.addMemoryPersonaRef('PPPP-PPP', memoryPersonaRef, {changeMessage:'...change message...'});
      promise.then(function(response) {
        var request = promise.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.data).toEqualJson({
          'persons' : [ {
            'attribution' : {
              'changeMessage' : '...change message...'
            },
            'evidence' : [ {
              'resource' : 'https://familysearch.org/platform/memories/memories/3649/personas/1083',
              'resourceId' : '1083'
            } ]
          } ]
        });
        expect(promise.getStatusCode()).toBe(201);
        expect(response).toBe('https://familysearch.org/platform/tree/persons/PPPP-PPP/memory-references/1083');
      });
    });
  });
});