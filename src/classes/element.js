var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name places.types:constructor.Element
 * @description
 *
 * An element in a vocabulary list.
 */
var Element = FS.Element = function(client, data){ 
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name places.functions:createElement
 * @param {Object} data
 * @return {Object} {@link places.types:constructor.Element Element}
 * @description Create a {@link places.types:constructor.Element Element} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createElement = function(data){
  return new Element(this, data);
};

Element.prototype = {
  constructor: Element,
  
  /**
   * @ngdoc property
   * @name places.types:constructor.Element#id
   * @propertyOf places.types:constructor.Element
   * @return {string} place id
   */
   
  /**
   * @ngdoc function
   * @name places.types:constructor.Element#$getLabel
   * @methodOf places.types:constructor.Element
   * @function
   * @return {String} The label of this element.
   */
  $getLabel: function(){
    return utils.maybe(utils.maybe(this.labels)[0])['@value'];
  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.Element#$getDescription
   * @methodOf places.types:constructor.Element
   * @function
   * @return {String} The description of this element.
   */
  $getDescription: function(){
    return utils.maybe(utils.maybe(this.descriptions)[0])['@value'];
  }
   
};