describe('Places', function() {
  
  describe('getPlace', function(){
    
    it('Get a place', function(done) {
      FS.getPlace(2557657).then(function(response) {
        expect(response.getPlace().id).toBe('2557657');
        expect(response.getPlace().names[0].value).toBe('Nohabuna Island');
        expect(response.getPlace().names[0].lang).toBe('en');
        done();
      });
    });
    
  });

});