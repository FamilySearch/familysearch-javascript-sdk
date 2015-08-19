describe('A person', function() {
  
  it('is updated in memory', function() {
    var person = FS.createPerson();
    person.addName('fulltext');
    expect(person.getNames()[0].getFullText()).toBe('fulltext');

    person = FS.createPerson();
    person.addName({givenName: 'given', surname: 'surname', fullText: 'fulltext', preferred: true});
    expect(person.getPreferredName().getFullText()).toBe('fulltext');
    expect(person.getGivenName()).toBe('given');
    expect(person.getSurname()).toBe('surname');

    person = FS.createPerson();
    person.addName(FS.createName({givenName: 'given', surname: 'surname', fullText: 'fulltext', preferred: true}));
    expect(person.getPreferredName().getFullText()).toBe('fulltext');
    expect(person.getGivenName()).toBe('given');
    expect(person.getSurname()).toBe('surname');

    person = FS.createPerson();
    var name = FS.createName({id: 'id', givenName: 'given', surname: 'surname', fullText: 'fulltext', preferred: true});
    person.addName(name);
    person.deleteName(name, 'changeMessage');
    expect(person.deletedConclusions['id']).toBe('changeMessage');

    person = FS.createPerson();
    person.addFact(FS.createFact({type: 'http://gedcomx.org/Birth', date: {original: 'date'}, place: {original: 'place'}}));
    expect(person.getBirthDate()).toBe('date');
    expect(person.getBirthPlace()).toBe('place');

    person = FS.createPerson();
    var fact = FS.createFact({type: 'http://gedcomx.org/Birth', date: {original: 'date'}, place: {original: 'place'}});
    fact.setId('id');
    person.addFact(fact);
    person.deleteFact(fact, 'changeMessage');
    expect(person.deletedConclusions['id']).toBe('changeMessage');

    person = FS.createPerson();
    person.setGender('gender', 'changeMessage');
    expect(person.getGender().getType()).toBe('gender');
    expect(person.getGender().changed).toBeTruthy();
    expect(person.getGender().getAttribution().getChangeMessage()).toBe('changeMessage');
  });

  it('is returned from getPerson', function(done) {
    FS.getPerson('PPPJ-MYZ').then(function(response) {
      var person = response.getPerson();
      expect(person.getId()).toBe('PPPJ-MYZ');
      expect(person.getBirthDate()).toBe('3 Apr 1836');
      expect(person.getBirthPlace()).toBe('Moscow, Russia');
      expect(person.getDeathDate()).toBe('');
      expect(person.getDeathPlace()).toBe('');
      expect(person.getDisplayGender()).toBe('Male');
      expect(person.getDisplayLifeSpan()).toBe('3 Apr 1836 - Dead');
      expect(person.getDisplayName()).toBe('Alex Aleksandrova');
      expect(person.isLiving()).toBe(true);
      expect(person.getGivenName()).toBe('Alex');
      expect(person.getSurname()).toBe('Aleksandrova');
      expect(person.getPersistentIdentifier()).toBe('https://sandbox.familysearch.org/ark:/12345/4:1:PPPJ-MYZ');
      expect(person.getPersonUrl()).toBe('https://familysearch.org/platform/tree/persons/PPPJ-MYZ');
      expect(person.getNames().length).toBe(1);
      var name = person.getNames()[0];
      expect(name.getId()).toBe('name-id');
      expect(name.getAttribution().getAgentId()).toBe('KNCV-RMZ');
      expect(name.getType()).toBe('http://gedcomx.org/BirthName');
      expect(name.getNameFormsCount()).toBe(2);
      expect(name.getFullText()).toBe('Alex Aleksandrova');
      expect(name.getGivenName(1)).toBe('Анастасия');
      expect(name.getSurname(0)).toBe('Aleksandrova');
      expect(person.getFacts().length).toBe(2);
      var facts = person.getFacts();
      expect(facts[0].getId()).toBe('born');
      expect(facts[0].getAttribution().getAgentId()).toBe('RMQW-LPK');
      expect(facts[0].getType()).toBe('http://gedcomx.org/Birth');
      expect(facts[0].getOriginalDate()).toBe('3 Apr 1836');
      expect(facts[0].getFormalDate()).toBe('+1836');
      expect(facts[0].getOriginalPlace()).toBe('Moscow, Russia');
      expect(facts[1].getId()).toBe('res');
      expect(facts[1].getType()).toBe('http://gedcomx.org/Residence');
      done();
    });
  });

  it('is returned with others from getMultiPerson', function(done) {
    FS.getMultiPerson(['PPPJ-MYZ','PPPJ-MYY']).then(function(response) {
      var person = response['PPPJ-MYZ'].getPerson();
      expect(person.getId()).toBe('PPPJ-MYZ');
      expect(person.getDisplayName()).toBe('Alex Aleksandrova');
      expect(person.getDisplayGender()).toBe('Male');

      person = response['PPPJ-MYY'].getPerson();
      expect(person.getId()).toBe('PPPJ-MYY');
      expect(person.getDisplayName()).toBe('Alexa Aleksandrova');
      expect(person.getDisplayGender()).toBe('Female');
      done();
    });
  });

  it('is returned with relationships from getPersonWithRelationships', function(done) {
    FS.getPersonWithRelationships('PW8J-MZ0').then(function(response) {
      expect(response.getPrimaryId()).toBe('PW8J-MZ0');
      expect(response.getRequestedId()).toBe('PW8J-MZ0');
      expect(response.wasRedirected()).toBe(false);
      expect(response.getPerson(response.getPrimaryId())).toBe(response.getPrimaryPerson());
      expect(response.getPrimaryPerson().getDisplayName()).toBe('Alex Aleksandrova');
      expect(response.getFatherIds()).toEqual(['PW8J-MZ1']);
      expect(response.getMotherIds()).toEqual(['PW8J-GZ2']);
      expect(response.getSpouseIds()).toEqual(['PA65-HG3']);
      expect(response.getChildIds()).toEqual(['PS78-MH4']);
      expect(response.getChildIdsOf('PA65-HG3')).toEqual(['PS78-MH4']);
      expect(response.getChildIdsOf('FOO').length).toBe(0);
      expect(response.getParentRelationships().length).toBe(1);
      var rel = response.getParentRelationships()[0];
      expect(rel.getId()).toBe('PPPX-PP0');
      expect(rel.getFatherId()).toBe('PW8J-MZ1');
      expect(rel.getMotherId()).toBe('PW8J-GZ2');
      expect(rel.getChildId()).toBe('PW8J-MZ0');
      expect(rel.getFatherFacts().length).toBe(1);
      expect(rel.getFatherFacts()[0].getType()).toBe('http://gedcomx.org/AdoptiveParent');
      expect(rel.getMotherFacts().length).toBe(1);
      expect(rel.getMotherFacts()[0].getType()).toBe('http://gedcomx.org/BiologicalParent');
      expect(response.getSpouseRelationships().length).toBe(1);
      rel = response.getSpouseRelationships()[0];
      expect(rel.getId()).toBe('C123-ABC');
      expect(rel.getHusbandId()).toBe('PW8J-MZ0');
      expect(rel.getWifeId()).toBe('PA65-HG3');
      expect(rel.getFacts().length).toBe(0);
      expect(response.getSpouseRelationship('PA65-HG3').getId()).toBe('C123-ABC');
      expect(response.getSpouseRelationship('FOO')).toBeUndefined();
      expect(response.getChildRelationships().length).toBe(1);
      rel = response.getChildRelationships()[0];
      expect(rel.getId()).toBe('PPPY-PP0');
      expect(rel.getFatherId()).toBe('PW8J-MZ0');
      expect(rel.getMotherId()).toBe('PA65-HG3');
      expect(rel.getChildId()).toBe('PS78-MH4');
      expect(rel.getFatherFacts().length).toBe(1);
      expect(rel.getFatherFacts()[0].getType()).toBe('http://gedcomx.org/AdoptiveParent');
      expect(rel.getMotherFacts().length).toBe(1);
      expect(rel.getMotherFacts()[0].getType()).toBe('http://gedcomx.org/BiologicalParent');
      expect(response.getChildRelationshipsOf('PA65-HG3')[0].getId()).toBe('PPPY-PP0');
      expect(response.getChildRelationshipsOf('FOO').length).toBe(0);
      done();
    });
  });

  it('is returned with populated relationships from getPersonWithRelationships with persons parameter', function(done) {
    FS.getPersonWithRelationships('KW7S-VQJ', {persons: true}).then(function(response) {
      expect(response.getFathers()[0].getDisplayName()).toBe('Jens Christian Jensen');
      expect(response.getMothers()[0].getDisplayName()).toBe('Ane Christensdr');
      expect(response.getPerson(response.getParentRelationships()[0].getFatherId()).getDisplayName()).toEqual('Jens Christian Jensen');
      expect(response.getSpouses()[0].getId()).toBe(response.getSpouseIds()[0]);
      expect(response.getSpouses()[0].getId()).toBe('KW7S-JB7');
      expect(response.getSpouses()[0].getDisplayName()).toBe('Delilah Ann Smith');
      expect(response.getChildren()[0].getDisplayName()).toEqual('Christian Ludvic Jensen');
      expect(response.getChildrenOf('KW7S-JB7')[0].getDisplayName()).toEqual('Christian Ludvic Jensen');
      expect(response.getChildrenOf('FOO').length).toBe(0);
      expect(response.getRequestedId()).toBe('KW7S-VQJ');
      expect(response.wasRedirected()).toBe(false);
      done();
    });
  });
  
  it('redirects are properly handled from getPersonWithRelationships', function(done){
    FS.getPersonWithRelationships('DYHJ-R84').then(function(response){
      expect(response.getPrimaryId()).toBe('KJTW-NML');
      expect(response.getRequestedId()).toBe('DYHJ-R84');
      expect(response.wasRedirected()).toBe(true);
      done();
    });
  });

  it('spouse relationships are returned from getSpouses', function(done) {
    FS.getPerson('FJP-M4RK').then(function(personResponse){
      personResponse.getPerson().getSpouses().then(function(spousesResponse){
        expect(spousesResponse.getCoupleRelationships().length).toBe(1);
        var rel = spousesResponse.getCoupleRelationships()[0];
        expect(rel.getId()).toBe('cid');
        expect(rel.getHusbandId()).toBe('FJP-M4RK');
        expect(rel.getWifeId()).toBe('JRW-NMSD');
        expect(rel.getFacts().length).toBe(1);
        expect(rel.getFacts()[0].getOriginalDate()).toBe('June 1800');
        expect(spousesResponse.getChildAndParentsRelationships().length).toBe(1);
        rel = spousesResponse.getChildAndParentsRelationships()[0];
        expect(rel.getId()).toBe('PPPX-PP0');
        expect(rel.getFatherFacts().length).toBe(1);
        expect(rel.getFatherFacts()[0].getType()).toBe('http://gedcomx.org/AdoptiveParent');
        expect(rel.getFatherFacts()[0] instanceof FamilySearch.Fact).toBeTruthy();
        done();
      });
    });
  });

  it('parent relationships are returned from getParents', function(done) {
    FS.getPerson('KW31-H9P').then(function(personResponse){
      personResponse.getPerson().getParents().then(function(parentsResponse){
        expect(parentsResponse.getChildAndParentsRelationships().length).toBe(1);
        var rel = parentsResponse.getChildAndParentsRelationships()[0];
        expect(rel.getId()).toBe('MMMP-KWL');
        expect(rel.getFatherId()).toBe('KW7V-Y32');
        expect(rel.getMotherId()).toBe('KW72-8QM');
        expect(rel.getChildId()).toBe('KW31-H9P');
        expect(rel.getFatherFacts().length).toBe(1);
        expect(rel.getFatherFacts()[0].getOriginalDate()).toBe('1955');
        expect(rel.getFatherFacts()[0].getAttribution().getAgentId()).toBe('MMD8-3NT');
        expect(parentsResponse.getCoupleRelationships().length).toBe(1);
        rel = parentsResponse.getCoupleRelationships()[0];
        expect(rel.getId()).toBe('MMM7-129');
        expect(rel.getFacts().length).toBe(1);
        expect(rel.getFacts()[0].getOriginalPlace()).toBe('Minnesota, United States');
        expect(rel.getFacts()[0].getAttribution().getAgentId()).toBe('MMD8-3NT');
        done();
      });
    });
  });

  it('child relationships are returned from getChildren', function(done) {
    FS.getPerson('PPP0-MP1').then(function(personResponse) {
      personResponse.getPerson().getChildren().then(function(childrenResponse){
        expect(childrenResponse.getChildAndParentsRelationships().length).toBe(2);
        var rel = childrenResponse.getChildAndParentsRelationships()[0];
        expect(rel.getId()).toBe('PPP0-PP0');
        expect(rel.getFatherId()).toBe('PPP0-MP1');
        expect(rel.getChildId()).toBe('PPP0-PP3');
        expect(rel.getFatherFacts().length).toBe(1);
        expect(rel.getFatherFacts()[0].getType()).toBe('http://gedcomx.org/AdoptiveParent');
        expect(rel.getFatherFacts()[0] instanceof FamilySearch.Fact).toBeTruthy();
        expect(rel.getMotherFacts().length).toBe(0);
        expect(childrenResponse.getPerson(rel.getChildId()).getPreferredName().getFullText()).toBe('Anastasia Aleksandrova');
        done();
      });
    });
  });

  it('is created', function(done) {
    var promise = FS.createPerson({names: [{givenName: 'Anastasia', surname: 'Aleksandrova'}]})
      .setGender('http://gedcomx.org/Female', '...change message...')
      .addFact({type: 'http://gedcomx.org/Birth', date: {original: '3 Apr 1836', formal: '+1836-04-03'}, place: { original: 'Moscow, Russia'}, attribution: '...change message...'})
      .save('...default change message...');
    promise.then(function(response) {
      var request = promise.getRequest();
      expect(request.body).toEqualJson({
        'persons' : [ {
          'living': false,
          'attribution' : {
            'changeMessage' : '...default change message...'
          },
          'gender' : {
            'type' : 'http://gedcomx.org/Female',
            'attribution' : {
              'changeMessage' : '...change message...'
            }
          },
          'names' : [ {
            'nameForms' : [ {
              'parts' : [ {
                'type' : 'http://gedcomx.org/Given',
                'value' : 'Anastasia'
              }, {
                'type' : 'http://gedcomx.org/Surname',
                'value' : 'Aleksandrova'
              } ],
              'fullText' : 'Anastasia Aleksandrova'
            } ],
            'preferred' : true,
            'type' : 'http://gedcomx.org/BirthName'
          } ],
          'facts' : [ {
            'type' : 'http://gedcomx.org/Birth',
            'date' : {
              'original' : '3 Apr 1836',
              'formal' : '+1836-04-03'
            },
            'place' : {
              'original' : 'Moscow, Russia'
            },
            'attribution' : {
              'changeMessage' : '...change message...'
            }
          } ]
        } ]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('https://familysearch.org/platform/tree/persons/12345');
      done();
    });
  });

  it('is created with defaults and living:true', function(done) {
    var promise = FS.createPerson({ living: true }).save('...default change message...');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'persons' : [ {
          'living': true,
          'attribution': {
            'changeMessage' : '...default change message...'
          },
          'gender' : {
            'type' : 'http://gedcomx.org/Unknown'
          },
          'names' : [ {
            'nameForms' : [ {
              'parts' : [ {
                'type' : 'http://gedcomx.org/Given',
                'value' : 'Unknown'
              } ],
              'fullText' : 'Unknown'
            } ],
            'preferred' : true,
            'type' : 'http://gedcomx.org/BirthName'
          } ]
        } ]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('https://familysearch.org/platform/tree/persons/12345');
      done();
    });
  });

  it('conclusion is added', function(done) {
    var person = FS.createPerson();
    person.setId('12345');
    person.addLink('person', {
      href: 'https://familysearch.org/platform/tree/persons/12345'
    });
    var promise = person
      .addFact({type: 'http://gedcomx.org/Birth', date: { original: '3 Apr 1836', formal: '+1836-04-03'}, place: {original: 'Moscow, Russia'}, attribution: '...change message...'})
      .save();
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'persons' : [ {
          'id' : '12345',
          'facts' : [ {
            'type' : 'http://gedcomx.org/Birth',
            'date' : {
              'original' : '3 Apr 1836',
              'formal' : '+1836-04-03'
            },
            'place' : {
              'original' : 'Moscow, Russia'
            },
            'attribution' : {
              'changeMessage' : '...change message...'
            }
          } ]
        } ]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://familysearch.org/platform/tree/persons/12345');
      done();
    });
  });

  function createMockPerson(pid, fid) {
    var person = FS.createPerson();
    person.setId(pid);
    person.addLink('person', {
      href: 'https://familysearch.org/platform/tree/persons/' + pid
    });
    var fact = FS.createFact({type: 'http://gedcomx.org/Birth', date: {original: '3 Apr 1836', formal: '+1836-04-03'}});
    fact.setId(fid);
    fact.changed = false;
    person.addFact(fact);
    return person;
  }

  it('conclusion is updated', function(done) {
    var person = createMockPerson('12345', 'ABCDE');
    // set birth place
    person.getBirth().setOriginalPlace('Moscow, Russia').setAttribution('...change message...');
    var promise = person.save();
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'persons' : [ {
          'id' : '12345',
          'facts' : [ {
            'id' : 'ABCDE',
            'type' : 'http://gedcomx.org/Birth',
            'date' : {
              'original' : '3 Apr 1836',
              'formal' : '+1836-04-03'
            },
            'place' : {
              'original' : 'Moscow, Russia'
            },
            'attribution' : {
              'changeMessage' : '...change message...'
            }
          } ]
        } ]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://familysearch.org/platform/tree/persons/12345');
      done();
    });
  });

  it('conclusion is deleted', function(done) {
    var person = createMockPerson('12345', '1');
    // delete fact
    var promise = person
      .deleteFact(person.getFacts()[0])
      .save('...change message...');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(promise.getRequest().headers['X-Reason']).toBe('...change message...');
      expect(response).toBe('https://familysearch.org/platform/tree/persons/12345');
      done();
    });
  });

  it('is deleted', function(done) {
    var promise = createMockPerson('PPPJ-MYZ','fid')
      .delete('Reason for delete');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(promise.getRequest().headers['X-Reason']).toBe('Reason for delete');
      expect(response).toBe('https://familysearch.org/platform/tree/persons/PPPJ-MYZ');
      done();
    });
  });

  it('preferred spouse is read', function(done) {
    FS.getPreferredSpouse('PPPJ-MYY').then(function(response) {
      expect(response).toBe('12345');
      done();
    });
  });

  it('preferred spouse is set', function(done) {
    var promise = FS.setPreferredSpouse('PPPJ-MYY', 'https://sandbox.familysearch.org/platform/tree/couple-relationships/12345');
    promise.then(function(response) {
      var request = promise.getRequest();
      expect(request.headers['Location']).toBe('https://sandbox.familysearch.org/platform/tree/couple-relationships/12345');
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('PPPJ-MYY');
      done();
    });
  });

  it('preferred spouse is deleted', function(done) {
    var promise = FS.deletePreferredSpouse('PPPJ-MYY');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('PPPJ-MYY');
      done();
    });
  });

  it( 'preferred parents are read', function(done) {
    FS.getPreferredParents('PPPJ-MYY').then(function(response) {
      expect(response).toBe('12345');
      done();
    });
  });

  it('preferred parents are set', function(done) {
    var promise = FS.setPreferredParents('PPPJ-MYY', 'https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/12345');
    promise.then(function(response) {
      var request = promise.getRequest();
      expect(request.headers['Location']).toBe('https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/12345');
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('PPPJ-MYY');
      done();
    });
  });

  it('preferred parents are deleted', function(done) {
    var promise = FS.deletePreferredParents('PPPJ-MYY');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('PPPJ-MYY');
      done();
    });
  });
  
  it('preferred name does not exist', function(done){
    var person = createMockPerson('12345', 'ABCDE');
    var name = person.getPreferredName();
    expect(name).toBeUndefined();
    done();
  });
  
  it('accepts instances of facts and names', function(){
    var person = FS.createPerson({
      names: [ FS.createName() ],
      facts: [ FS.createFact() ]
    });
    expect(person.getNames().length).toBe(1);
    expect(person.getFacts().length).toBe(1);
  });
  
  it('restore person', function(done){
    FS.getPerson('DELETED').then(function(response){
      var promise = response.getPerson().restore();
      promise.then(function(response){
        expect(promise.getStatusCode()).toBe(204);
        expect(response).toBe('https://sandbox.familysearch.org/platform/tree/persons/DELETED');
        done();
      });
    });
  });

});
