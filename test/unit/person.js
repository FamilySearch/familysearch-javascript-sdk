describe('A person', function() {
  it('is returned from getPerson', function() {
    FamilySearch.getPerson('PPPJ-MYZ').then(function(response) {
      expect(response.getId()).toBe('PPPJ-MYZ');
      expect(response.getBirthDate()).toBe('3 Apr 1836');
      expect(response.getBirthPlace()).toBe('Moscow, Russia');
      expect(response.getDeathDate()).toBeUndefined();
      expect(response.getDeathPlace()).toBeUndefined();
      expect(response.getGender()).toBe('Male');
      expect(response.getLifeSpan()).toBe('3 Apr 1836 - Dead');
      expect(response.getName()).toBe('Alex Aleksandrova');
      expect(response.isLiving()).toBe(true);
      expect(response.getGivenName()).toBe('Alex');
      expect(response.getSurname()).toBe('Aleksandrova');
    });
  });

  it('is returned with others from getMultiPerson', function() {
    FamilySearch.getMultiPerson(['PPPJ-MYZ','PPPJ-MYY']).then(function(response) {
      expect(response['PPPJ-MYZ'].getId()).toBe('PPPJ-MYZ');
      expect(response['PPPJ-MYZ'].getName()).toBe('Alex Aleksandrova');
      expect(response['PPPJ-MYZ'].getGender()).toBe('Male');
      expect(response['PPPJ-MYY'].getId()).toBe('PPPJ-MYY');
      expect(response['PPPJ-MYY'].getName()).toBe('Alexa Aleksandrova');
      expect(response['PPPJ-MYY'].getGender()).toBe('Female');
    });
  });

  it('is returned with relationships from getPersonWithRelationships', function() {
    FamilySearch.getPersonWithRelationships('PW8J-MZ0').then(function(response) {
      expect(response.getPrimaryId()).toBe('PW8J-MZ0');
      expect(response.getName('PW8J-MZ0')).toBe('Alex Aleksandrova');
      expect(response.getFatherIds()).toEqual(['PW8J-MZ1']);
      expect(response.getMotherIds()).toEqual(['PW8J-GZ2']);
      expect(response.getParentsIds()).toEqual([['PW8J-MZ1','PW8J-GZ2']]);
      expect(response.getSpouseIds()).toEqual(['PA65-HG3']);
      expect(response.getChildIds('PA65-HG3')).toEqual(['PS78-MH4']);
    });
  });
});
