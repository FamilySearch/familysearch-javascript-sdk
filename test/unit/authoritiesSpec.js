describe('Authorities', function() {
  
  it('standardizes dates', function(done) {
    FS.getDate('8 Mar 2006').then(function(response) {
      expect(response.getDate().getNormalized()).toBe('8 March 2006');
      expect(response.getDate().getFormal()).toBe('+2006-03-08');
      done();
    });
  });

});
