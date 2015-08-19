describe('A Fact', function() {
  
  it('is constructed from an object', function() {
    var fact = FS.createFact()
      .setType('type')
      .setOriginalDate('date')
      .setFormalDate('formalDate')
      .setOriginalPlace('place')
      .setNormalizedPlace('normalizedPlace')
      .setAttribution('changeMessage');
    expect(fact.getType()).toBe('type');
    expect(fact.getOriginalDate()).toBe('date');
    expect(fact.getFormalDate()).toBe('formalDate');
    expect(fact.getOriginalPlace()).toBe('place');
    expect(fact.getNormalizedPlace()).toBe('normalizedPlace');
    expect(fact.getAttribution().getChangeMessage()).toBe('changeMessage');
  });

  it('is updated correctly', function() {
    var fact = FS.createFact();
    fact.setType('type');
    expect(fact.getType()).toBe('type');
    expect(fact.changed).toBe(true);

    fact = FS.createFact();
    fact.setOriginalDate('6 Mar 2014');
    expect(fact.getOriginalDate()).toBe('6 Mar 2014');
    expect(fact.changed).toBe(true);

    fact = FS.createFact();
    fact.setDate({original: '6 Mar 2014', normalized: '6 March 2014', formal: '+2014-03-06'});
    expect(fact.getOriginalDate()).toBe('6 Mar 2014');
    expect(fact.getNormalizedDate()).toBe('6 March 2014');
    expect(fact.getFormalDate()).toBe('+2014-03-06');
    expect(fact.changed).toBe(true);

    fact = FS.createFact();
    var date = FS.createDate({
      original: '6 Mar 2014',
      normalized: '6 March 2014'
    });
    fact.setDate(date);
    expect(fact.getOriginalDate()).toBe('6 Mar 2014');
    expect(fact.getNormalizedDate()).toBe('6 March 2014');
    expect(fact.getFormalDate()).toBe(undefined);
    expect(fact.changed).toBe(true);

    fact = FS.createFact();
    fact.setOriginalPlace('place');
    expect(fact.getOriginalPlace()).toBe('place');
    expect(fact.changed).toBe(true);

    fact = FS.createFact();
    fact.setPlace({original: 'place', normalized: 'normalizedPlace'});
    expect(fact.getOriginalPlace()).toBe('place');
    expect(fact.getNormalizedPlace()).toBe('normalizedPlace');
    expect(fact.changed).toBe(true);

    fact = FS.createFact();
    var place = FS.createPlaceDescription({
      'id' : '50615',
      'names' : [ {
        'lang' : 'en',
        'value' : 'Nohabuna Island'
      } ],
      'display' : {
        'name' : 'Nohabuna Island',
        'fullName' : 'Nohabuna Island, Solomon Islands',
        'type' : 'Island'
      }
    });
    fact.setPlace(place);
    expect(fact.getOriginalPlace()).toBe('Nohabuna Island, Solomon Islands');
    expect(fact.getNormalizedPlace()).toBe('Nohabuna Island, Solomon Islands');
    expect(fact.changed).toBe(true);

    fact = FS.createFact();
    fact.setAttribution('changeMessage');
    expect(fact.getAttribution().getChangeMessage()).toBe('changeMessage');

    fact = FS.createFact();
    expect(fact.isCustomNonEvent()).toBeFalsy();
    fact.setCustomNonEvent(true);
    expect(fact.isCustomNonEvent()).toBeTruthy();
    fact.setCustomNonEvent(false);
    expect(fact.isCustomNonEvent()).toBeFalsy();
  });
});
