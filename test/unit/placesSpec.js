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

});