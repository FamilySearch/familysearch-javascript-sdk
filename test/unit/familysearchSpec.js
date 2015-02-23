describe('FamilySearch', function(){

  it('discovery promise resolves', function(done){
    FS.settings.discoveryPromise.then(function(){
      done();
    });
  });

});