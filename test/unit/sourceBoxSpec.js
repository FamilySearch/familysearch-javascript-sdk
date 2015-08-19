var utils = require('../../src/utils');

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
    var promise = coll.save();
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        collections: [{
          title : 'Title'
        }]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('https://familysearch.org/platform/sources/collections/sf-MMMM-MMM');
      done();
    });
  });

  it('collection is updated', function(done) {
    var coll = FS.createCollection({title: 'Title'});
    coll.setId('sf-MMMM-MMM');
    coll.addLink('self', {
      href: 'https://familysearch.org/platform/sources/collections/sf-MMMM-MMM'
    });
    var promise = coll.save();
    promise.then(function(response) {
      var request = promise.getRequest();
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
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://familysearch.org/platform/sources/collections/sf-MMMM-MMM');
      done();
    });
  });

  it('collection is deleted', function(done) {
    var promise = FS.deleteCollection('https://familysearch.org/platform/sources/collections/sf-MMMM-MMM');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://familysearch.org/platform/sources/collections/sf-MMMM-MMM');
      done();
    });
  });

  it('source descriptions are moved', function(done) {
    var promise = FS.moveSourceDescriptionsToCollection('https://familysearch.org/platform/sources/collections/sf-MMMM-123/descriptions', ['MMMM-MMM', 'MMMM-MMX']);
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        sourceDescriptions: [{
          id: 'MMMM-MMM'
        }, {
          id: 'MMMM-MMX'
        }]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://familysearch.org/platform/sources/collections/sf-MMMM-123/descriptions');
      done();
    });
  });

  it('source descriptions are removed', function(done) {
    var promise = FS.removeSourceDescriptionsFromCollections(['MMMM-MMM', 'MMMM-MMX']);
    promise.then(function() {
      var requests = FS.getHttpRequests();
      expect(utils.find(requests, {
        method: 'DELETE',
        url:'https://familysearch.org/platform/sources/CCCC-CCC/collections/descriptions?id=MMMM-MMM&id=MMMM-MMX&access_token=mock'})
      ).toBeTruthy();
      expect(promise.getStatusCode()).toBe(204);
      done();
    });
  });

});
