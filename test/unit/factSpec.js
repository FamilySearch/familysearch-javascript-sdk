describe('A Fact', function() {
  it('is constructed from an object', function() {
    var fact = FS.createFact({type: 'type', $date: 'date', $formalDate: 'formalDate',
                                      $place: 'place', $normalizedPlace: 'normalizedPlace', $changeMessage: 'changeMessage'});
    expect(fact.type).toBe('type');
    expect(fact.$getDate()).toBe('date');
    expect(fact.$getFormalDate()).toBe('formalDate');
    expect(fact.$getPlace()).toBe('place');
    expect(fact.$getNormalizedPlace()).toBe('normalizedPlace');
    expect(fact.attribution.changeMessage).toBe('changeMessage');
  });

  it('is updated correctly', function() {
    var fact = FS.createFact();
    fact.$setType('type');
    expect(fact.type).toBe('type');
    expect(fact.$changed).toBe(true);

    fact = FS.createFact();
    fact.$setDate('6 Mar 2014');
    expect(fact.$getDate()).toBe('6 Mar 2014');
    expect(fact.$changed).toBe(true);

    fact = FS.createFact();
    fact.$setDate({$original: '6 Mar 2014', $normalized: '6 March 2014', $formal: '+2014-03-06'});
    expect(fact.$getDate()).toBe('6 Mar 2014');
    expect(fact.$getNormalizedDate()).toBe('6 March 2014');
    expect(fact.$getFormalDate()).toBe('+2014-03-06');
    expect(fact.$changed).toBe(true);

    fact = FS.createFact();
    var date = FS.createDate({
      original: '6 Mar 2014',
      normalized: '6 March 2014'
    });
    fact.$setDate(date);
    expect(fact.$getDate()).toBe('6 Mar 2014');
    expect(fact.$getNormalizedDate()).toBe('6 March 2014');
    expect(fact.$getFormalDate()).toBe('+2014-03-06');
    expect(fact.$changed).toBe(true);

    fact = FS.createFact();
    fact.$setPlace('place');
    expect(fact.$getPlace()).toBe('place');
    expect(fact.$changed).toBe(true);

    fact = FS.createFact();
    fact.$setPlace({$original: 'place', $normalized: 'normalizedPlace'});
    expect(fact.$getPlace()).toBe('place');
    expect(fact.$getNormalizedPlace()).toBe('normalizedPlace');
    expect(fact.$changed).toBe(true);

    fact = FS.createFact();
    var place = FS.createPlace({
      original: 'place',
      id: 'normalizedPlaceId',
      normalized: ['normalizedPlace']
    });
    fact.$setPlace(place);
    expect(fact.$getPlace()).toBe('place');
    expect(fact.$getNormalizedPlace()).toBe('normalizedPlace');
    expect(fact.$changed).toBe(true);

    fact = FS.createFact();
    fact.$setChangeMessage('changeMessage');
    expect(fact.attribution.changeMessage).toBe('changeMessage');

    fact = FS.createFact();
    expect(fact.$isCustomNonEvent()).toBeFalsy();
    fact.$setCustomNonEvent(true);
    expect(fact.$isCustomNonEvent()).toBeTruthy();
    fact.$setCustomNonEvent(false);
    expect(fact.$isCustomNonEvent()).toBeFalsy();
  });
});
