describe('Places', function() {
  
  it('getPlace', function(done){
    FS.getPlace(2557657).then(function(response) {
      expect(response.getPlace().id).toBe('2557657');
      expect(response.getPlace().names[0].value).toBe('Nohabuna Island');
      expect(response.getPlace().names[0].lang).toBe('en');
      done();
    });
  });
  
  it('getPlaceDescription', function(done){
    FS.getPlaceDescription(50615).then(function(response){
      var place = response.getPlaceDescription(),
          jurisdiction = place.$getJurisdictionSummary();
      expect(place.id).toBe('50615');
      expect(place.lang).toBe('en');
      expect(place.identifiers['http://gedcomx.org/Primary'][0]).toBe('https://familysearch.org/platform/places/2557657');
      expect(place.names[0].lang).toBe('en');
      expect(place.names[0].value).toBe('Nohabuna Island');
      expect(place.type).toBe('https://familysearch.org/platform/places/types/56');
      expect(place.latitude).toBe(-7.35);
      expect(place.longitude).toBe(158.0666667);
      expect(place.$getName()).toBe('Nohabuna Island');
      expect(place.$getFullName()).toBe('Nohabuna Island, Solomon Islands');
      expect(place.$getType()).toBe('Island');
      expect(jurisdiction.id).toBe('213');
      expect(jurisdiction.names[0].value).toBe('Solomon Islands');
      
      place.$getJurisdictionDetails().then(function(response){
        var place = response.getPlaceDescription();
        expect(place.$getName()).toBe('Solomon Islands');
        expect(place.$getFullName()).toBe('Solomon Islands');
        expect(place.$getType()).toBe('Commonwealth Nation');
        
        // Verify that the promise fails when no jurisdiction is available
        place.$getJurisdictionDetails().then(null, function(){
          done();
        });
      });
    });
  });
  
  it('getPlacesSearch', function(done){
    FS.getPlacesSearch({
      name: 'Paris',
      parentId: '+442102'
    }).then(function(response){
      var results = response.getSearchResults();
      expect(results.length).toBe(2);
      
      var firstResult = results[0],
          firstPlace = firstResult.$getPlace(),
          secondResult = results[1],
          secondPlace = secondResult.$getPlace();
          
      expect(firstResult.id).toBe('7344697');
      expect(firstPlace.id).toBe('7344697');
      expect(firstPlace.$getFullName()).toBe('Paris, Ville-de-Paris, District of the Paris Region, France');
      expect(firstPlace.$getType()).toBe('Populated Place');
      
      expect(secondResult.id).toBe('5953651');
      expect(secondPlace.id).toBe('5953651');
      expect(secondPlace.$getFullName()).toBe('Paris, Ville-de-Paris, District of the Paris Region, France');
      expect(secondPlace.$getType()).toBe('District');
      
      done();
    });
  });
  
  it('getPlaceDescriptionChildren', function(done){
    FS.getPlaceDescriptionChildren(1054).then(function(response){
      var children = response.getChildren();
      expect(children.length).toBe(6);
      expect(children[0].id).toBe('432379');
      expect(children[0].names[2].value).toBe('榛原郡');
      done();
    });
  });
  
  it('getPlaceType', function(done){
    FS.getPlaceType(103).then(function(response){
      var type = response.getPlaceType();
      expect(type.id).toBe('103');
      expect(type.$getLabel()).toBe('Recreation Area');
      expect(type.$getDescription()).toBe('A recreation area; amphitheater, athletic track or field, racetrack, golf course, fishing area, etc.');
      done();
    });
  });
  
  it('getPlaceTypes', function(done){
    FS.getPlaceTypes().then(function(response){
      var types = response.getPlaceTypes(),
          type = types[0];
      expect(types.length).toBe(5);
      expect(type.id).toBe('143');
      expect(type.$getLabel()).toBe('Aboriginal Council');
      expect(type.$getDescription()).toBe('A political jurisdiction in countries with native populations such as Australia.');
      done();
    });
  });

});