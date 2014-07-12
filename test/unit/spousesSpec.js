define(['FamilySearch'], function(FamilySearch) {
  describe('Spouses relationship', function() {
    it('is returned from getCouple', function() {
      FamilySearch.getCouple('12345').then(function(response) {
        var rel = response.getRelationship();
        expect(rel.id).toBe('12345');
        expect(rel.$getHusbandId()).toBe('PPPJ-MYY');
        rel.$getHusband().then(function(response) {
          var person = response.getPerson();
          expect(person.id).toBe('PPPJ-MYY');
        });
        expect(rel.$getWifeId()).toBe('PPPJ-MYZ');
        rel.$getWife().then(function(response) {
          var person = response.getPerson();
          expect(person.id).toBe('PPPJ-MYZ');
        });
        expect(rel.$getSpouseId('PPPJ-MYY')).toBe('PPPJ-MYZ');
        rel.$getSpouse('PPPJ-MYY').then(function(response) {
          var person = response.getPerson();
          expect(person.id).toBe('PPPJ-MYZ');
        });
        expect(rel.$getFacts().length).toBe(1);
        var fact = rel.$getFacts()[0];
        expect(fact.type).toBe('http://gedcomx.org/Marriage');
        expect(rel.$getMarriageFact().$getDate()).toBe('June 1800');
        expect(fact.$getDate()).toBe('June 1800');
        expect(fact.$getFormalDate()).toBe('+1800-06');
        expect(fact.$getPlace()).toBe('Provo, Utah, Utah, United States');
        rel.$getSourceRefs().then(function(response) {
          var sourceRefs = response.getSourceRefs();
          expect(sourceRefs.length).toBe(2);
          expect(sourceRefs[0].attribution.modified).toBe(123456789);
        });
        rel.$getNotes().then(function(response) {
          var notes = response.getNotes();
          expect(notes.length).toBe(2);
          expect(notes[0].id).toBe('1804317705');
        });
        rel.$getChanges().then(function(response) {
          var changes = response.getChanges();
          expect(changes.length).toBe(3);
          expect(changes[0].id).toBe('1386863423023');
        });
      });
    });

    it('is created', function() {
      var promise = new FamilySearch.Couple({
        husband: 'FJP-M4RK',
        wife: 'JRW-NMSD',
        facts: [{type:'http://gedcomx.org/Marriage', date: 'June 1800', formalDate: '+1800-06', place: 'Provo, Utah, Utah, United States'}]
      }).$save('...change message...');
      promise.then(function(response) {
        var request = promise.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.data).toEqualJson({
          'relationships' : [ {
            'attribution' : {
              'changeMessage' : '...change message...'
            },
            'person1' : {
              'resourceId' : 'FJP-M4RK',
              'resource' : 'FJP-M4RK'
            },
            'person2' : {
              'resourceId' : 'JRW-NMSD',
              'resource' : 'JRW-NMSD'
            },
            'facts' : [ {
              'type' : 'http://gedcomx.org/Marriage',
              'date' : {
                'original' : 'June 1800',
                'formal' : '+1800-06'
              },
              'place' : {
                'original' : 'Provo, Utah, Utah, United States'
              }
            } ],
            'type' : 'http://gedcomx.org/Couple'
          } ]
        });
        expect(promise.getStatusCode()).toBe(201);
        expect(response).toBe('PPPX-PP0'); // same endpoint as create child-and-parents, so has the same response
      });
    });

    it('conclusion is created', function() {
      var rel = new FamilySearch.Couple();
      rel.id = 'R123-456';
      var promise = rel
        .$addFact({type:'http://gedcomx.org/Marriage', changeMessage: '...change message...'})
        .$save();
      promise.then(function(response) {
        var request = promise.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.data).toEqualJson({
          'relationships' : [ {
            'facts' : [ {
              'type' : 'http://gedcomx.org/Marriage',
              'attribution' : {
                'changeMessage' : '...change message...'
              }
            } ]
          } ]
        });
        expect(promise.getStatusCode()).toBe(204);
        expect(response).toBe('R123-456');
      });
    });

    function createMockRelationship(rid, fid) {
      var rel = new FamilySearch.Couple();
      rel.id = rid;
      var fact = new FamilySearch.Fact();
      fact.id = fid;
      fact.type = 'http://gedcomx.org/Marriage';
      fact.links = {
        conclusion: {
          href: 'https://sandbox.familysearch.org/platform/tree/couple-relationships/'+rid+'/conclusions/'+fid
        }};
      delete fact.$changed;
      rel.$setHusband('husband')
        .$setWife('wife')
        .$addFact(fact);
      delete rel.$husbandChanged;
      delete rel.$wifeChanged;
      return rel;
    }

    it('members are updated', function() {
      var rel = createMockRelationship('cid', 'C.1');
      // update husband
      var promise = rel
        .$setHusband('FJP-M4RK')
        .$save('...change message...');
      promise.then(function(response) {
        var request = promise.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.data).toEqualJson({
          'relationships' : [ {
            'person1' : {
              'resourceId' : 'FJP-M4RK',
              'resource' : 'FJP-M4RK'
            },
            'person2' : {
              'resourceId' : 'wife',
              'resource' : 'wife'
            },
            'attribution' : {
              'changeMessage' : '...change message...'
            }
          } ]
        });
        expect(promise.getStatusCode()).toBe(204);
        expect(response).toBe('cid');
      });
    });

    it('fact is added', function() {
      var rel = createMockRelationship('cid', 'C.1');
      // update fact
      var promise = rel
        .$addFact({type:'http://gedcomx.org/Divorce'})
        .$save('...change message...');
      promise.then(function(response) {
        var request = promise.getRequest();
        //noinspection JSUnresolvedFunction
        expect(request.data).toEqualJson({
          'relationships' : [ {
            'attribution' : {
              'changeMessage' : '...change message...'
            },
            'facts' : [ {
              'type' : 'http://gedcomx.org/Divorce'
            } ]
          } ]
        });
        expect(promise.getStatusCode()).toBe(204);
        expect(response).toBe('cid');
      });
    });

    it('conclusion is deleted', function() {
      var rel = createMockRelationship('R123-456', 'C123-456');
      // delete fact
      var promise = rel
        .$deleteFact(rel.$getFacts()[0])
        .$save('...change message...');
      promise.then(function(response) {
        expect(promise.getStatusCode()).toBe(204);
        expect(promise.getRequest().headers['X-Reason']).toBe('...change message...');
        expect(response).toBe('R123-456');
      });
    });

    it('is deleted', function() {
      var promise = createMockRelationship('12345','fid')
        .$delete('...change message...');
      promise.then(function(response) {
        expect(promise.getStatusCode()).toBe(204);
        expect(promise.getRequest().headers['X-Reason']).toBe('...change message...');
        expect(response).toBe('12345');
      });
    });

  });
});
