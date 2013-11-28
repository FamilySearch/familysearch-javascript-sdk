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

    it('notes are returned from getPersonNotes', function() {
      FamilySearch.getPersonNotes('P12-3456').then(function(response) {
        var notes = response.getNotes();
        expect(notes[0].id).toBe('1804317705');
        expect(notes[0].subject).toBe('note 0');
        expect(notes[1].id).toBe('1805241226');
        expect(notes[1].subject).toBe('note 1');
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
        expect(response.getParentsIds()).toEqual([['PW8J-MZ1','PW8J-GZ2']]);
        expect(response.getSpouseIds()).toEqual(['PA65-HG3']);
        expect(response.getChildIds('PA65-HG3')).toEqual(['PS78-MH4']);
      });
    });

    it('is returned with populated relationships from getPersonWithRelationships with persons component', function() {
      FamilySearch.getPersonWithRelationships('KW7S-VQJ', {persons: true}).then(function(response) {
        expect(response.getFathers()[0].getName()).toBe('Jens Christian Jensen');
        expect(response.getMothers()[0].getName()).toBe('Ane Christensdr');
        expect(response.getParents()[0][0].getName()).toEqual('Jens Christian Jensen');
        expect(response.getSpouses()[0].getId()).toBe(response.getSpouseIds()[0]);
        expect(response.getSpouses()[0].getId()).toBe('KW7S-JB7');
        expect(response.getSpouses()[0].getName()).toBe('Delilah Ann Smith');
        expect(response.getChildren('KW7S-JB7')[0].getName()).toEqual('Christian Ludvic Jensen');
      });
    });
  });
});