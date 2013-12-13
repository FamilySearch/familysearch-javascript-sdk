define(['FamilySearch'], function(FamilySearch) {
  describe('A person', function() {
    it('is returned from getPerson', function() {
      FamilySearch.getPerson('PPPJ-MYZ').then(function(response) {
        var person = response.getPerson();
        expect(person.getId()).toBe('PPPJ-MYZ');
        expect(person.getBirthDate()).toBe('3 Apr 1836');
        expect(person.getBirthPlace()).toBe('Moscow, Russia');
        expect(person.getDeathDate()).toBeUndefined();
        expect(person.getDeathPlace()).toBeUndefined();
        expect(person.getGender()).toBe('Male');
        expect(person.getLifeSpan()).toBe('3 Apr 1836 - Dead');
        expect(person.getName()).toBe('Alex Aleksandrova');
        expect(person.isLiving()).toBe(true);
        expect(person.getGivenName()).toBe('Alex');
        expect(person.getSurname()).toBe('Aleksandrova');
      });
    });

    it('is returned with others from getMultiPerson', function() {
      FamilySearch.getMultiPerson(['PPPJ-MYZ','PPPJ-MYY']).then(function(response) {
        var person = response['PPPJ-MYZ'].getPerson();
        expect(person.getId()).toBe('PPPJ-MYZ');
        expect(person.getName()).toBe('Alex Aleksandrova');
        expect(person.getGender()).toBe('Male');

        person = response['PPPJ-MYY'].getPerson();
        expect(person.getId()).toBe('PPPJ-MYY');
        expect(person.getName()).toBe('Alexa Aleksandrova');
        expect(person.getGender()).toBe('Female');
      });
    });

    it('is returned with relationships from getPersonWithRelationships', function() {
      FamilySearch.getPersonWithRelationships('PW8J-MZ0').then(function(response) {
        expect(response.getPrimaryId()).toBe('PW8J-MZ0');
        expect(response.getPerson(response.getPrimaryId())).toBe(response.getPrimaryPerson());
        expect(response.getPrimaryPerson().getName('PW8J-MZ0')).toBe('Alex Aleksandrova');
        expect(response.getFatherIds()).toEqual(['PW8J-MZ1']);
        expect(response.getMotherIds()).toEqual(['PW8J-GZ2']);
        expect(response.getParentRelationships()).toEqual([{ id: 'PPPX-PP0', fatherId: 'PW8J-MZ1', motherId: 'PW8J-GZ2',
          fatherType: 'http://gedcomx.org/AdoptiveParent', motherType: 'http://gedcomx.org/BiologicalParent'}]);
        expect(response.getSpouseRelationships()).toEqual([{id: 'C123-ABC', spouseId: 'PA65-HG3'}]);
        expect(response.getSpouseIds()).toEqual(['PA65-HG3']);
        expect(response.getChildIds('PA65-HG3')).toEqual(['PS78-MH4']);
      });
    });

    it('is returned with populated relationships from getPersonWithRelationships with persons parameter', function() {
      FamilySearch.getPersonWithRelationships('KW7S-VQJ', {persons: true}).then(function(response) {
        expect(response.getFathers()[0].getName()).toBe('Jens Christian Jensen');
        expect(response.getMothers()[0].getName()).toBe('Ane Christensdr');
        expect(response.getPerson(response.getParentRelationships()[0].fatherId).getName()).toEqual('Jens Christian Jensen');
        expect(response.getSpouses()[0].getId()).toBe(response.getSpouseIds()[0]);
        expect(response.getSpouses()[0].getId()).toBe('KW7S-JB7');
        expect(response.getSpouses()[0].getName()).toBe('Delilah Ann Smith');
        expect(response.getChildren('KW7S-JB7')[0].getName()).toEqual('Christian Ludvic Jensen');
      });
    });

    it('change summary is returned from getPersonChangeSummary', function() {
      FamilySearch.getPersonChangeSummary('PID').then(function(response) {
        expect(response.getChanges()[0].id).toBe('12345');
        expect(response.getChanges()[0].published).toBe(1386006311124);
        expect(response.getChanges()[0].title).toBe('Change Summary 1');
        expect(response.getChanges()[0].updated).toBe(1386006311124);
      });
    });
  });
});