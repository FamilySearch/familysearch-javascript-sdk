describe('Parents and Children relationship', function() {
  
  it('is returned from getChildAndParents', function(done) {
    var promises = [];
    FS.getChildAndParents('https://familysearch.org/platform/tree/child-and-parents-relationships/PPPX-PP0').then(function(response) {
      var rel = response.getRelationship();
      expect(rel.getId()).toBe('PPPX-PP0');
      expect(rel.getFatherId()).toBe('PPPJ-MYY');
      promises.push(rel.getFather().then(function(response) {
        var person = response.getPerson();
        expect(person.getId()).toBe('PPPJ-MYY');
      }));
      expect(rel.getMotherId()).toBe('PPPJ-MYZ');
      promises.push(rel.getMother().then(function(response) {
        var person = response.getPerson();
        expect(person.getId()).toBe('PPPJ-MYZ');
      }));
      expect(rel.getChildId()).toBe('PPPX-PP3');
      expect(rel.getFatherFacts().length).toBe(1);
      expect(rel.getFatherFacts()[0].getType()).toBe('http://gedcomx.org/AdoptiveParent');
      expect(rel.getFatherFacts()[0] instanceof FamilySearch.Fact).toBeTruthy();
      expect(rel.getMotherFacts().length).toBe(1);
      expect(rel.getMotherFacts()[0].getType()).toBe('http://gedcomx.org/BiologicalParent');
      expect(rel.getMotherFacts()[0] instanceof FamilySearch.Fact).toBeTruthy();
      promises.push(rel.getSourceRefs().then(function(response) {
        var sourceRefs = response.getSourceRefs();
        expect(sourceRefs.length).toBe(2);
        expect(sourceRefs[0].getAttribution().getModifiedTimestamp()).toBe(987654321);
      }));
      promises.push(rel.getNotes().then(function(response) {
        var notes = response.getNotes();
        expect(notes.length).toBe(2);
        expect(notes[0].getId()).toBe('1804317705');
      }));
      promises.push(rel.getChanges().then(function(response) {
        var changes = response.getChanges();
        expect(changes.length).toBe(3);
        expect(changes[0].getId()).toBe('1386863479538');
      }));
      Promise.all(promises).then(function(){
        done();
      }).catch(function(e){
        console.error(e.stack);
      });
    }).catch(function(e){
      console.error(e.stack);
    });
  });

  it('is created', function(done) {
    var rel = FS.createChildAndParents({
        fatherFacts: [{type:'http://gedcomx.org/AdoptiveParent'}],
        motherFacts: [{type:'http://gedcomx.org/BiologicalParent'}]
      })
      .setFather('PPPX-MP1')
      .setMother('PPPX-FP2')
      .setChild('PPPX-PP3');
    rel.save('...change message...').then(function(responses) {
      var response = responses[0],
          request = response.getRequest();
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
      expect(response.getStatusCode()).toBe(201);
      expect(rel.getLink('relationship').href).toBe('https://familysearch.org/platform/tree/child-and-parents-relationships/PPPX-PP0');
      expect(rel.getId()).toBe('PPPX-PP0');
      done();
    });
  });

  it('conclusion is created', function(done) {
    var rel = FS.createChildAndParents()
      .addMotherFact(FS.createFact({type:'http://gedcomx.org/BiologicalParent'}).setAttribution('...change message...'))
      .setId('12345')
      .addLink('relationship', {
        href: 'https://familysearch.org/platform/tree/child-and-parents-relationships/12345'
      });
    rel.save().then(function(responses) {
      var response = responses[0],
          request = response.getRequest();
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
      expect(response.getStatusCode()).toBe(204);
      expect(rel.getLink('relationship').href).toBe('https://familysearch.org/platform/tree/child-and-parents-relationships/12345');
      done();
    });
  });

  function createMockRelationship(rid, fid) {
    var rel = FS.createChildAndParents();
    rel.setId(rid);
    rel.addLinks({
      relationship: {
        href: 'https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/' + rid
      },
      'mother-role': {
        href: 'https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/' + rid + '/mother'
      },
      restore: {
        href: 'https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/' + rid + '/restore'
      }
    });
    var fact = FS.createFact();
    fact.setId(fid);
    fact.setType('http://gedcomx.org/BiologicalParent');
    fact.addLink('conclusion', {
      href: 'https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/'+rid+'/mother/conclusions/'+fid
    });
    delete fact.changed;
    rel.setMother('old')
      .setChild('PPPX-PP3')
      .addMotherFact(fact);
    delete rel.motherChanged;
    return rel;
  }

  it('is updated', function(done) {
    var rel = createMockRelationship('12345', 'C.1');
    // update mother and mother fact
    rel.setMother('PPPX-FP2')
      .getMotherFacts()[0].setType('http://gedcomx.org/AdoptiveParent');
    rel.save('...change message...').then(function(responses) {
      var response = responses[0],
          request = response.getRequest();
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
      expect(response.getStatusCode()).toBe(204);
      done();
    });
  });

  it('conclusion is deleted', function(done) {
    var rel = createMockRelationship('R123-456', 'C123-456');
    // delete fact
    rel.deleteMotherFact(rel.getMotherFacts()[0]);
    rel.save('Deleted for reason 1').then(function(responses) {
      expect(responses[0].getStatusCode()).toBe(204);
      expect(responses[0].getRequest().headers['X-Reason']).toBe('Deleted for reason 1');
      done();
    });
  });

  it('parent is deleted', function(done) {
    var rel = createMockRelationship('RRRX-RRX','fid')
      // delete mother
      .deleteMother();
    rel.save('Deleted for reason 1').then(function(responses) {
      expect(responses[0].getStatusCode()).toBe(204);
      expect(responses[0].getRequest().headers['X-Reason']).toBe('Deleted for reason 1');
      done();
    });
  });

  it('is deleted', function(done) {
    createMockRelationship('PPPX-PP0','fid')
      .delete('Deleted for reason 1')
      .then(function(response) {
        expect(response.getStatusCode()).toBe(204);
        expect(response.getRequest().headers['X-Reason']).toBe('Deleted for reason 1');
        done();
      });
  });
  
  it('accepts instances of facts', function(){
    var rel = FS.createChildAndParents({
      fatherFacts: [ FS.createFact() ],
      motherFacts: [ FS.createFact() ]
    });
    expect(rel.getFatherFacts().length).toBe(1);
    expect(rel.getMotherFacts().length).toBe(1);
  });

  it('is restored', function(done) {
    createMockRelationship('PPPX-PP0','fid')
      .restore()
      .then(function(response) {
        expect(response.getStatusCode()).toBe(204);
        done();
      });
  });
  
  it('source is properly created and attached by addSource', function(done){
    var childAndParents = FS.createChildAndParents({
      links: {
        relationship: {
          href: 'https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/RRRR-RSR'
        }
      }
    });
    childAndParents.addSource({
      about: 'https://familysearch.org/pal:/MM9.1.1/M9PJ-2JJ',
      citation: '"United States Census, 1900." database and digital images, FamilySearch (https://familysearch.org/)',
      title: '1900 US Census, Ethel Hollivet',
      text: 'Ethel Hollivet (line 75) with husband Albert Hollivet (line 74)'
    }, 'This is the change message', ['http://gedcomx.org/Name']).then(function(response){
      var request = response.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        childAndParentsRelationships: [{
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
      expect(response.getStatusCode()).toBe(201);
      expect(response.getHeader('X-entity-id')).toBe('SRSR-R01');
      done();
    });
  });

});
