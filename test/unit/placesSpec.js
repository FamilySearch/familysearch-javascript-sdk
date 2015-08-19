describe('Places', function() {
  
  it('getPlace', function(done){
    FS.getPlace('https://familysearch.org/platform/places/2557657').then(function(response) {
      expect(response.getPlace().getId()).toBe('2557657');
      expect(response.getPlace().getNames()[0].getValue()).toBe('Nohabuna Island');
      expect(response.getPlace().getNames()[0].getLang()).toBe('en');
      done();
    });
  });
  
  it('getPlaceDescription', function(done){
    FS.getPlaceDescription('https://familysearch.org/platform/places/description/50615').then(function(response){
      var place = response.getPlaceDescription(),
          jurisdiction = place.getJurisdictionSummary();
      expect(place.getId()).toBe('50615');
      expect(place.getLang()).toBe('en');
      expect(place.getIdentifiers()['http://gedcomx.org/Primary'][0]).toBe('https://familysearch.org/platform/places/2557657');
      expect(place.getNames()[0].getLang()).toBe('en');
      expect(place.getNames()[0].getValue()).toBe('Nohabuna Island');
      expect(place.getTypeUri()).toBe('https://familysearch.org/platform/places/types/56');
      expect(place.getLatitude()).toBe(-7.35);
      expect(place.getLongitude()).toBe(158.0666667);
      expect(place.getName()).toBe('Nohabuna Island');
      expect(place.getFullName()).toBe('Nohabuna Island, Solomon Islands');
      expect(place.getType()).toBe('Island');
      expect(jurisdiction.getId()).toBe('213');
      expect(jurisdiction.getNames()[0].getValue()).toBe('Solomon Islands');
      
      place.getJurisdictionDetails().then(function(response){
        var place = response.getPlaceDescription();
        expect(place.getName()).toBe('Solomon Islands');
        expect(place.getFullName()).toBe('Solomon Islands');
        expect(place.getType()).toBe('Commonwealth Nation');
        
        // Verify that the promise fails when no jurisdiction is available
        place.getJurisdictionDetails().then(null, function(){
          done();
        });
      });
    });
  });
  
  it('getPlacesSearch', function(done){
    FS.getPlacesSearch({
      name: 'Paris',
      '+parentId': '442102'
    }).then(function(response){
      var results = response.getSearchResults();
      expect(results.length).toBe(2);
      
      var firstResult = results[0],
          firstPlace = firstResult.getPlace(),
          secondResult = results[1],
          secondPlace = secondResult.getPlace();
          
      expect(firstResult.getId()).toBe('7344697');
      expect(firstPlace.getId()).toBe('7344697');
      expect(firstPlace.getFullName()).toBe('Paris, Ville-de-Paris, District of the Paris Region, France');
      expect(firstPlace.getType()).toBe('Populated Place');
      
      expect(secondResult.getId()).toBe('5953651');
      expect(secondPlace.getId()).toBe('5953651');
      expect(secondPlace.getFullName()).toBe('Paris, Ville-de-Paris, District of the Paris Region, France');
      expect(secondPlace.getType()).toBe('District');
      
      done();
    });
  });
  
  it('getPlaceDescriptionChildren', function(done){
    FS.getPlaceDescriptionChildren('https://familysearch.org/platform/places/description/1054/children').then(function(response){
      var children = response.getChildren();
      expect(children.length).toBe(6);
      expect(children[0].getId()).toBe('432379');
      expect(children[0].getNames()[2].getValue()).toBe('榛原郡');
      done();
    });
  });
  
  it('getPlaceType', function(done){
    FS.getPlaceType(103).then(function(response){
      var type = response.getPlaceType();
      expect(type.getId()).toBe('103');
      expect(type.getLabel()).toBe('Recreation Area');
      expect(type.getDescription()).toBe('A recreation area; amphitheater, athletic track or field, racetrack, golf course, fishing area, etc.');
      done();
    });
  });
  
  it('getPlaceTypes', function(done){
    FS.getPlaceTypes().then(function(response){
      var list = response.getList(),
          types = response.getPlaceTypes(),
          type = types[0];
      expect(list.getTitle()).toBe('Place Types');
      expect(list.getDescription()).toBe('List of available place types.');
      expect(types.length).toBe(5);
      expect(type.getId()).toBe('143');
      expect(type.getLabel()).toBe('Aboriginal Council');
      expect(type.getDescription()).toBe('A political jurisdiction in countries with native populations such as Australia.');
      done();
    });
  });
  
  it('getPlaceTypeGroup', function(done){
    FS.getPlaceTypeGroup(26).then(function(response){
      var list = response.getList(),
          types = response.getPlaceTypes(),
          type = types[0];
      expect(list.getTitle()).toBe('Country-Like');
      expect(list.getDescription()).toBe('Countries and highest level administrative places (ADM0)');
      expect(types.length).toBe(18);
      expect(type.getId()).toBe('343');
      expect(type.getLabel()).toBe('Republic');
      expect(type.getDescription()).toBe('A country whose government is a representative democracy in which the people\'s elected deputies (representatives), not the people themselves, vote on legislation.');
      done();
    });
  });
  
  it('getPlaceTypeGroups', function(done){
    FS.getPlaceTypeGroups().then(function(response){
      var list = response.getList(),
          groups = response.getPlaceTypeGroups(),
          group = groups[0];
      expect(list.getTitle()).toBe('Place Type Groups');
      expect(list.getDescription()).toBe('List of available place type groups.');
      expect(groups.length).toBe(18);
      expect(group.getId()).toBe('4');
      expect(group.getLabel()).toBe('Geographic (Continents)');
      expect(group.getDescription()).toBe('Geographic feature type');
      done();
    });
  });

});