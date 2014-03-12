define(['FamilySearch'], function(FamilySearch) {
  describe('A Name', function() {
    it('is constructed from a string', function() {
      var name = new FamilySearch.Name('fulltext');
      expect(name.$getFullText()).toBe('fulltext');
    });

    it('is constructed from an object', function() {
      var name = new FamilySearch.Name({type: 'type', givenName: 'given', surname: 'surname', prefix: 'prefix', suffix: 'suffix',
                                        fullText: 'fulltext', preferred: true, changeMessage: 'changeMessage'});
      expect(name.type).toBe('type');
      expect(name.$getGivenName()).toBe('given');
      expect(name.$getSurname()).toBe('surname');
      expect(name.$getPrefix()).toBe('prefix');
      expect(name.$getSuffix()).toBe('suffix');
      expect(name.$getFullText()).toBe('fulltext');
      expect(name.preferred).toBe(true);
      expect(name.attribution.changeMessage).toBe('changeMessage');
    });

    it('is updated correctly', function() {
      var name = new FamilySearch.Name();
      name.$setType('type');
      expect(name.type).toBe('type');
      expect(name.$changed).toBe(true);

      name = new FamilySearch.Name();
      name.$setPreferred(true);
      expect(name.preferred).toBe(true);
      expect(name.$changed).toBe(true);

      name = new FamilySearch.Name();
      name.$setFullText('fulltext');
      expect(name.$getFullText()).toBe('fulltext');
      expect(name.$changed).toBe(true);

      name = new FamilySearch.Name();
      name.$setGivenName('given');
      expect(name.$getGivenName()).toBe('given');
      expect(name.$changed).toBe(true);

      name = new FamilySearch.Name();
      name.$setSurname('surname');
      expect(name.$getSurname()).toBe('surname');
      expect(name.$changed).toBe(true);

      name = new FamilySearch.Name();
      name.$setPrefix('prefix');
      expect(name.$getPrefix()).toBe('prefix');
      expect(name.$changed).toBe(true);

      name = new FamilySearch.Name();
      name.$setSuffix('suffix');
      expect(name.$getSuffix()).toBe('suffix');
      expect(name.$changed).toBe(true);

      name = new FamilySearch.Name();
      name.$setChangeMessage('changeMessage');
      expect(name.attribution.changeMessage).toBe('changeMessage');
    });
  });
});
