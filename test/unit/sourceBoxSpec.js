var utils = require('../../src/utils');

describe('Source Box', function() {
  it('user collections are returned from getCollectionsForUser', function(done) {
    FS.getCollectionsForUser('UID').then(function(response) {
      var collections = response.getCollections();
      expect(collections.length).toBe(1);
      expect(collections[0].id).toEqual('MMMM-MMM');
      expect(collections[0].title).toBeUndefined();
      expect(collections[0].size).toBeUndefined();
      expect(collections[0].attribution.$getAgentId()).toBe('12345');
      expect(collections[0].attribution.$getAgentUrl()).toBe('https://familysearch.org/platform/users/agents/12345');
      collections[0].attribution.$getAgent().then(function(response) {
        var agent = response.getAgent();
        expect(agent.$getName()).toBe('John Smith');
        done();
      });
    });
  });

  it('user collection is returned from getCollection', function(done) {
    FS.getCollection('sf-MMMM-MMM').then(function(response) {
      var collection = response.getCollection();
      expect(collection.id).toEqual('sf-MMMM-MMM');
      expect(collection.title).toBe('Name');
      expect(collection.size).toBeUndefined();
      expect(collection.attribution).toBeUndefined(); // bad example data
      done();
    });
  });

  it('source descriptions are returned from getCollectionSourceDescriptions', function(done) {
    FS.getCollectionSourceDescriptions('CMMM-MMM', {start:2, count:1}).then(function(response) {
      var sourceDescriptions = response.getSourceDescriptions();
      expect(sourceDescriptions.length).toBe(1);
      expect(sourceDescriptions[0].id).toBe('MMMM-CCC');
      expect(sourceDescriptions[0].$getTitle()).toBe('NEW TITLE');
      expect(sourceDescriptions[0].$getCitation()).toBeUndefined();
      expect(sourceDescriptions[0].$getText()).toBeUndefined();
      expect(sourceDescriptions[0].attribution.$getAgentId()).toBe('UUUU-UUU'); // bad example data
      done();
    });
  });

  it('source descriptions for a user are returned from getCollectionSourceDescriptionsForUser', function(done) {
    FS.getCollectionSourceDescriptionsForUser('CCCC-CCC', {start:2, count:1}).then(function(response) {
      var sourceDescriptions = response.getSourceDescriptions();
      expect(sourceDescriptions.length).toBe(1);
      expect(sourceDescriptions[0].id).toBe('MMMM-CCC');
      expect(sourceDescriptions[0].$getTitle()).toBe('NEW TITLE');
      expect(sourceDescriptions[0].$getCitation()).toBeUndefined();
      expect(sourceDescriptions[0].$getText()).toBeUndefined();
      expect(sourceDescriptions[0].attribution).toBeUndefined(); // bad example data
      done();
    });
  });

  it('collection is created', function(done) {
    var coll = FS.createCollection({title: 'Title'});
    var promise = coll.$save(true);
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        collections: [{
          title : 'Title'
        }]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('sf-MMMM-MMM');
      expect(coll.id).toBe('sf-MMMM-MMM');  // re-read from database
      done();
    });
  });

  it('collection is updated', function(done) {
    var coll = FS.createCollection({title: 'Title'});
    coll.id = 'sf-MMMM-MMM';
    var promise = coll.$save();
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        collections: [{
          id : 'sf-MMMM-MMM',
          title : 'Title'
        }]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('sf-MMMM-MMM');
      done();
    });
  });

  it('collection is deleted', function(done) {
    var promise = FS.deleteCollection('sf-MMMM-MMM');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('sf-MMMM-MMM');
      done();
    });
  });

  it('source descriptions are moved', function(done) {
    var promise = FS.moveSourceDescriptionsToCollection('sf-MMMM-123', ['MMMM-MMM', 'MMMM-MMX']);
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
      expect(response).toBe('sf-MMMM-123');
      done();
    });
  });

  it ('source descriptions are removed', function(done) {
    var promise = FS.removeSourceDescriptionsFromCollections(['MMMM-MMM', 'MMMM-MMX']);
    promise.then(function() {
      var requests = FS.getHttpRequests();
      expect(utils.find(requests, {
        method: 'DELETE',
        url:'https://sandbox.familysearch.org/platform/sources/PXRQ-FMXT/collections/descriptions?id=MMMM-MMM&id=MMMM-MMX&access_token=mock'})
      ).toBeTruthy();
      expect(promise.getStatusCode()).toBe(204);
      done();
    });
  });

});
