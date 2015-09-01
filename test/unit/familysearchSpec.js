describe('FamilySearch', function(){
  
  it('reject promise on error', function(done){
    FS.getPerson('ERROR').then(function(){
      expect(false).toBe(true);
    }).catch(function(error){
      expect(error instanceof Error).toBe(true);
      done();
    });
  });
  
});