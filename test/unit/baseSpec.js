describe('base class', function() {
  
  it('serializes', function(){
    var person = FS.createPerson({
      $gender: 'Male',
      names: [
        {
          $givenName: 'Gustaf'
        }
      ]
    });
    var json = JSON.parse(person.serialize());
    expect(json).toEqualJson({
      names: [ {
        nameForms: [ {
          parts: [ {
            type: 'http://gedcomx.org/Given',
            value: 'Gustaf'
          } ]
        } ],
        preferred: false
      } ],
      gender: {
        type: 'Male'
      }
    });
  })
  
});