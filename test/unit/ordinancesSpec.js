describe('Ordinances', function(){
  
  it('ordinances access', function(done){
    FS.hasOrdinancesAccess().catch(function(){
      done();
    });
  });
  
  it('ordinance policy - french html', function(done){
    FS.getOrdinancesPolicy('html', 'fr').then(function(response){
      expect(response.getData().indexOf('<h5>Personnes pour lesquelles vous pouvez accomplir des ordonnances</h5>')).toBe(0);
      done();
    }).catch(function(e){
      console.error(e.stack);
    });
  });
  
});