describe('Source Box', function() {
  
  it('user collections are returned from getCollectionsForUser', function(done) {
    FS.getCollectionsForUser().then(function(response) {
      var collections = response.getCollections();
      expect(collections.length).toBe(1);
      expect(collections[0].getId()).toEqual('MMMM-MMM');
      expect(collections[0].getTitle()).toBeUndefined();
      expect(collections[0].getSize()).toBeUndefined();
      expect(collections[0].getAttribution().getAgentId()).toBe('12345');
      expect(collections[0].getAttribution().getAgentUrl()).toBe('https://familysearch.org/platform/users/agents/12345');
      collections[0].getAttribution().getAgent().then(function(response) {
        var agent = response.getAgent();
        expect(agent.getName()).toBe('John Smith');
        done();
      });
    });
  });

  it('user collection is returned from getCollection', function(done) {
    FS.getCollection('https://familysearch.org/platform/sources/collections/sf-MMMM-MMM').then(function(response) {
      var collection = response.getCollection();
      expect(collection.getId()).toEqual('sf-MMMM-MMM');
      expect(collection.getTitle()).toBe('Name');
      expect(collection.getSize()).toBeUndefined();
      expect(collection.getAttribution()).toBeUndefined(); // bad example data
      done();
    });
  });

  it('source descriptions are returned from getCollectionSourceDescriptions', function(done) {
    FS.getCollectionSourceDescriptions('https://familysearch.org/platform/sources/collections/CMMM-MMM/descriptions', {start:2, count:1}).then(function(response) {
      var sourceDescriptions = response.getSourceDescriptions();
      expect(sourceDescriptions.length).toBe(1);
      expect(sourceDescriptions[0].getId()).toBe('MMMM-CCC');
      expect(sourceDescriptions[0].getTitle()).toBe('NEW TITLE');
      expect(sourceDescriptions[0].getCitation()).toBeUndefined();
      expect(sourceDescriptions[0].getText()).toBeUndefined();
      expect(sourceDescriptions[0].getAttribution().getAgentId()).toBe('UUUU-UUU'); // bad example data
      done();
    });
  });

  it('source descriptions for a user are returned from getCollectionSourceDescriptionsForUser', function(done) {
    FS.getCollectionSourceDescriptionsForUser({start:2, count:1}).then(function(response) {
      var sourceDescriptions = response.getSourceDescriptions();
      expect(sourceDescriptions.length).toBe(1);
      expect(sourceDescriptions[0].getId()).toBe('MMMM-CCC');
      expect(sourceDescriptions[0].getTitle()).toBe('NEW TITLE');
      expect(sourceDescriptions[0].getCitation()).toBeUndefined();
      expect(sourceDescriptions[0].getText()).toBeUndefined();
      expect(sourceDescriptions[0].getAttribution()).toBeUndefined(); // bad example data
      done();
    });
  });

  it('collection is created', function(done) {
    var coll = FS.createCollection({title: 'Title'});
    coll.save()
      .then(function(response) {
        var request = response.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.body).toEqualJson({
          collections: [{
            title : 'Title'
          }]
        });
        expect(response.getStatusCode()).toBe(201);
        expect(coll.getLink('self').href).toBe('https://familysearch.org/platform/sources/collections/sf-MMMM-MMM');
        expect(coll.getId()).toBe('sf-MMMM-MMM');
        done();
      });
  });

  it('collection is updated', function(done) {
    var coll = FS.createCollection({title: 'Title'});
    coll.setId('sf-MMMM-MMM');
    coll.addLink('self', {
      href: 'https://familysearch.org/platform/sources/collections/sf-MMMM-MMM'
    });
    coll.save()
      .then(function(response) {
        var request = response.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.body).toEqualJson({
          collections: [{
            id : 'sf-MMMM-MMM',
            title : 'Title',
            links: {
              self: {
                href: 'https://familysearch.org/platform/sources/collections/sf-MMMM-MMM'
              }
            }
          }]
        });
        expect(response.getStatusCode()).toBe(204);
        expect(coll.getLink('self').href).toBe('https://familysearch.org/platform/sources/collections/sf-MMMM-MMM');
        expect(coll.getId()).toBe('sf-MMMM-MMM');
        done();
      });
  });

  it('collection is deleted', function(done) {
    FS.deleteCollection('https://familysearch.org/platform/sources/collections/sf-MMMM-MMM')
      .then(function(response) {
        expect(response.getStatusCode()).toBe(204);
        done();
      });
  });

  it('source descriptions are moved', function(done) {
    FS.moveSourceDescriptionsToCollection('https://familysearch.org/platform/sources/collections/sf-MMMM-123/descriptions', ['MMMM-MMM', 'MMMM-MMX'])
      .then(function(response) {
        var request = response.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.body).toEqualJson({
          sourceDescriptions: [{
            id: 'MMMM-MMM'
          }, {
            id: 'MMMM-MMX'
          }]
        });
        expect(response.getStatusCode()).toBe(204);
        done();
      });
  });

  it('source descriptions are removed', function(done) {
    FS.removeSourceDescriptionsFromCollections(['MMMM-MMM', 'MMMM-MMX'])
      .then(function(response) {
        var request = response.getRequest();
        expect(request.method).toBe('DELETE');
        expect(request.url).toBe('https://familysearch.org/platform/sources/CCCC-CCC/collections/descriptions?id=MMMM-MMM&id=MMMM-MMX&access_token=mock');
        expect(response.getStatusCode()).toBe(204);
        done();
      });
  });

});
