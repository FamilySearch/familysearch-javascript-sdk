var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name sources.types:constructor.SourceDescription
 * @description
 *
 * Description of a source
 *
 * {@link https://familysearch.org/developers/docs/api/sources/Source_Descriptions_resource FamilySearch API Docs}
 *
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object
 * _about_ is a URL (link to the record) it can be a memory URL.
 */
var SourceDescription = FS.SourceDescription = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.citation) {
      this.setCitation(data.citation);
      delete data.citation;
    }
    if (data.title) {
      this.setTitle(data.title);
      delete data.title;
    }
    if (data.text) {
      this.setText(data.text);
      delete data.text;
    }
  }
};

/**
 * @ngdoc function
 * @name sources.functions:createSourceDescription
 * @param {Object} data [SourceDescription](https://familysearch.org/developers/docs/api/gx/SourceDescription_json) data
 * @return {Object} {@link sources.types:constructor.SourceDescription SourceDescription}
 * @description Create a {@link sources.types:constructor.SourceDescription SourceDescription} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createSourceDescription = function(data){
  return new SourceDescription(this, data);
};

SourceDescription.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: SourceDescription,
  
  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getId
   * @methodOf sources.types:constructor.SourceDescription
   * @return {String} Id of the source description
   */

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getAbout
   * @methodOf sources.types:constructor.SourceDescription
   * @return {String} URL (link to the record)
   */
  getAbout: function(){ return this.data.about; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getAttribution
   * @methodOf sources.types:constructor.SourceDescription
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getCitation
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @return {String} source citation
   */
  getCitation: function() { return maybe(maybe(this.data.citations)[0]).value; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getTitle
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @return {String} title of the source description
   */
  getTitle: function() { return maybe(maybe(this.data.titles)[0]).value; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getText
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @return {String} Text / Description of the source
   */
  getText: function() { return maybe(maybe(this.data.notes)[0]).text; },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getSourceDescriptionUrl
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @return {String} Url of the of this source description
   */
  getSourceDescriptionUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('description')).href); },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#getSourceRefsQuery
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @return {Object} promise for the {@link sources.functions:getSourceRefsQuery getSourceRefsQuery} response
   */
  getSourceRefsQuery: function() {
    return this.client.getSourceRefsQuery(maybe(this.getLink('source-references-query')).href);
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#setCitation
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @param {String} citation source description citation
   * @return {SourceDescription} this source description
   */
  setCitation: function(citation) {
    this.data.citations = [ { value: citation } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#setTitle
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @param {String} title source description title
   * @return {SourceDescription} this source description
   */
  setTitle: function(title) {
    this.data.titles = [ { value: title } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#setText
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @param {String} text source description text
   * @return {SourceDescription} this source description
   */
  setText: function(text) {
    this.data.notes = [ { text: text } ];
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#save
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @description
   * Create a new source description (if this source description does not have an id) or update the existing source description
   *
   * {@link http://jsfiddle.net/mtets2sf/1/ Editable Example}
   *
   * @param {string=} changeMessage change message
   * @param {boolean=} refresh true to read the source description after updating
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the source description url
   */
  save: function(changeMessage, refresh, opts) {
    var self = this;
    if (changeMessage) {
      self.setAttribution(self.client.createAttribution(changeMessage));
    }
    var promise = self.helpers.chainHttpPromises(
      self.getSourceDescriptionUrl() ? self.helpers.refPromise(self.getSourceDescriptionUrl()) : self.plumbing.getCollectionUrl('FSUDS', 'source-descriptions'),
      function(url){
        return self.plumbing.post(url, { sourceDescriptions: [ self ] }, {}, opts, function(data, promise) {
          // x-entity-id and location headers are not set on update, only on create
          return self.getSourceDescriptionUrl() || promise.getResponseHeader('Location');
        });
      }
    );
    return promise;
  },

  /**
   * @ngdoc function
   * @name sources.types:constructor.SourceDescription#delete
   * @methodOf sources.types:constructor.SourceDescription
   * @function
   * @description delete this source description as well as all source references that refer to this source description
   * - see {@link sources.functions:deleteSourceDescription deleteSourceDescription}
   *
   * @param {string} changeMessage reason for the deletion
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the source description id
   */
  delete: function(changeMessage, opts) {
    // must use the id, not the full url, here
    return this.client.deleteSourceDescription(this.getSourceDescriptionUrl(), changeMessage, opts);
  }

});