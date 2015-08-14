var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name memories.types:constructor.MemoryArtifactRef
 * @description
 *
 * Memory Artifact Reference
 *
 * @param {Object=} data an object with optional attributes {description, qualifierValue, qualifierName}.
 * _description_ is required; it should be the memory URL
 * _qualifierValue_ is a comma-separated string of 4 numbers: "x-start,y-start,x-end,y-end".
 * Each number ranges from 0 to 1, with 0 corresponding to top-left and 1 corresponding to bottom-right.
 * _qualifierName_ is required if _qualifierValue_ is set; it should be http://gedcomx.org/RectangleRegion
 */
var MemoryArtifactRef = FS.MemoryArtifactRef = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name memories.functions:createMemoryArtifactRef
 * @param {Object} data [SourceReference](https://familysearch.org/developers/docs/api/gx/SourceReference_json) data
 * @return {Object} {@link memories.types:constructor.MemoryArtifactRef MemoryArtifactRef}
 * @description Create a {@link memories.types:constructor.MemoryArtifactRef MemoryArtifactRef} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createMemoryArtifactRef = function(data){
  return new MemoryArtifactRef(this, data);
};

MemoryArtifactRef.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  constructor: MemoryArtifactRef,
  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryArtifactRef#id
   * @propertyOf memories.types:constructor.MemoryArtifactRef
   * @return {String} Id of the Memory Artifact
   */

  /**
   * @ngdoc property
   * @name memories.types:constructor.MemoryArtifactRef#description
   * @propertyOf memories.types:constructor.MemoryArtifactRef
   * @return {String} URL of the memory
   */

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#$getQualifierName
   * @methodOf memories.types:constructor.MemoryArtifactRef
   * @function
   * @return {String} qualifier name (http://gedcomx.org/RectangleRegion)
   */
  $getQualifierName: function() { return maybe(maybe(this.qualifiers)[0]).name; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#$getQualifierValue
   * @methodOf memories.types:constructor.MemoryArtifactRef
   * @function
   * @return {String} qualifier value (e.g., 0.0,.25,.5,.75)
   */
  $getQualifierValue: function() { return maybe(maybe(this.qualifiers)[0]).value; },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#$setQualifierName
   * @methodOf memories.types:constructor.MemoryArtifactRef
   * @function
   * @param {string} qualifierName qualifier name
   * @return {MemoryArtifactRef} this memory artifact ref
   */
  $setQualifierName: function(qualifierName) {
    if (!utils.isArray(this.qualifiers) || !this.qualifiers.length) {
      this.qualifiers = [{}];
    }
    this.qualifiers[0].name = qualifierName;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name memories.types:constructor.MemoryArtifactRef#$setQualifierValue
   * @methodOf memories.types:constructor.MemoryArtifactRef
   * @function
   * @param {string} qualifierValue qualifier value
   * @return {MemoryArtifactRef} this memory artifact ref
   */
  $setQualifierValue: function(qualifierValue) {
    if (!utils.isArray(this.qualifiers) || !this.qualifiers.length) {
      this.qualifiers = [{}];
    }
    this.qualifiers[0].value = qualifierValue;
    //noinspection JSValidateTypes
    return this;
  }

});