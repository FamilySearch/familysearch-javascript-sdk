var FamilySearch = require('../../src/FamilySearch'),
    q = require('q');

describe('Parents and Children relationship', function() {
  it('is returned from getChildAndParents', function(done) {
    var promises = [];
    FS.getChildAndParents('PPPX-PP0').then(function(response) {
      var rel = response.getRelationship();
      expect(rel.id).toBe('PPPX-PP0');
      expect(rel.$getFatherId()).toBe('PPPJ-MYY');
      promises.push(rel.$getFather().then(function(response) {
        var person = response.getPerson();
        expect(person.id).toBe('PPPJ-MYY');
      }));
      expect(rel.$getMotherId()).toBe('PPPJ-MYZ');
      promises.push(rel.$getMother().then(function(response) {
        var person = response.getPerson();
        expect(person.id).toBe('PPPJ-MYZ');
      }));
      expect(rel.$getChildId()).toBe('PPPX-PP3');
      expect(rel.$getFatherFacts().length).toBe(1);
      expect(rel.$getFatherFacts()[0].type).toBe('http://gedcomx.org/AdoptiveParent');
      expect(rel.$getFatherFacts()[0] instanceof FamilySearch.Fact).toBeTruthy();
      expect(rel.$getMotherFacts().length).toBe(1);
      expect(rel.$getMotherFacts()[0].type).toBe('http://gedcomx.org/BiologicalParent');
      expect(rel.$getMotherFacts()[0] instanceof FamilySearch.Fact).toBeTruthy();
      promises.push(rel.$getSourceRefs().then(function(response) {
        var sourceRefs = response.getSourceRefs();
        expect(sourceRefs.length).toBe(2);
        expect(sourceRefs[0].attribution.modified).toBe(987654321);
      }));
      promises.push(rel.$getNotes().then(function(response) {
        var notes = response.getNotes();
        expect(notes.length).toBe(2);
        expect(notes[0].id).toBe('1804317705');
      }));
      promises.push(rel.$getChanges().then(function(response) {
        var changes = response.getChanges();
        expect(changes.length).toBe(3);
        expect(changes[0].id).toBe('1386863479538');
      }));
      q.all(promises).then(function(){
        done();
      });
    });
  });

  it('is created', function(done) {
    var promise = FS.createChildAndParents({
        fatherFacts: [{type:'http://gedcomx.org/AdoptiveParent'}],
        motherFacts: [{type:'http://gedcomx.org/BiologicalParent'}]
      })
      .$setFather('PPPX-MP1')
      .$setMother('PPPX-FP2')
      .$setChild('PPPX-PP3')
      .$save('...change message...');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'childAndParentsRelationships' : [ {
          'attribution' : {
            'changeMessage' : '...change message...'
          },
          'father' : {
            'resourceId' : 'PPPX-MP1',
            'resource' : 'PPPX-MP1'
          },
          'mother' : {
            'resourceId' : 'PPPX-FP2',
            'resource' : 'PPPX-FP2'
          },
          'child' : {
            'resourceId' : 'PPPX-PP3',
            'resource' : 'PPPX-PP3'
          },
          'fatherFacts' : [ {
            'type' : 'http://gedcomx.org/AdoptiveParent'
          } ],
          'motherFacts' : [ {
            'type' : 'http://gedcomx.org/BiologicalParent'
          } ]
        } ]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('PPPX-PP0');
      done();
    });
  });

  it('conclusion is created', function(done) {
    var rel = FS.createChildAndParents();
    rel.id = '12345';
    var promise = rel
      .$addMotherFact({type:'http://gedcomx.org/BiologicalParent', $changeMessage: '...change message...'})
      .$save();
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'childAndParentsRelationships' : [ {
          'motherFacts' : [ {
            'type' : 'http://gedcomx.org/BiologicalParent',
            'attribution' : {
              'changeMessage' : '...change message...'
            }
          } ]
        } ]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('12345');
      done();
    });
  });

  function createMockRelationship(rid, fid) {
    var rel = FS.createChildAndParents();
    rel.id = rid;
    var fact = FS.createFact();
    fact.id = fid;
    fact.type = 'http://gedcomx.org/BiologicalParent';
    fact.links = {
      conclusion: {
        href: 'https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/'+rid+'/mother/conclusions/'+fid
      }};
    delete fact.$changed;
    rel.$setMother('old')
      .$setChild('PPPX-PP3')
      .$addMotherFact(fact);
    delete rel.$motherChanged;
    return rel;
  }

  it('is updated', function(done) {
    var rel = createMockRelationship('12345', 'C.1');
    // update mother and mother fact
    rel.$setMother('PPPX-FP2')
      .$getMotherFacts()[0].$setType('http://gedcomx.org/AdoptiveParent');
    var promise = rel.$save('...change message...');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'childAndParentsRelationships' : [ {
          'attribution' : {
            'changeMessage' : '...change message...'
          },
          'mother' : {
            'resourceId' : 'PPPX-FP2',
            'resource' : 'PPPX-FP2'
          },
          'motherFacts' : [ {
            'id' : 'C.1',
            'type' : 'http://gedcomx.org/AdoptiveParent',
            'links' : {
              'conclusion' : {
                'href' : 'https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/12345/mother/conclusions/C.1'
              }
            }
          } ]
        } ]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('12345');
      done();
    });
  });

  it('conclusion is deleted', function(done) {
    var rel = createMockRelationship('R123-456', 'C123-456');
    // delete fact
    var promise = rel
      .$deleteMotherFact(rel.$getMotherFacts()[0])
      .$save('Deleted for reason 1');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(promise.getRequest().headers['X-Reason']).toBe('Deleted for reason 1');
      expect(response).toBe('R123-456');
      done();
    });
  });

  it('parent is deleted', function(done) {
    var promise = createMockRelationship('RRRX-RRX','fid')
      // delete mother
      .$deleteMother()
      .$save('Deleted for reason 1');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(promise.getRequest().headers['X-Reason']).toBe('Deleted for reason 1');
      expect(response).toBe('RRRX-RRX');
      done();
    });
  });

  it('is deleted', function(done) {
    var promise = createMockRelationship('PPPX-PP0','fid')
      .$delete('Deleted for reason 1');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(promise.getRequest().headers['X-Reason']).toBe('Deleted for reason 1');
      expect(response).toBe('PPPX-PP0');
      done();
    });
  });

});
