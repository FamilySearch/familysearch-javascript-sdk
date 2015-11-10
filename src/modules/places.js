var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc overview
 * @name places
 * @description
 * Functions for interacting with the FamilySearch Place Authority
 *
 * {@link https://familysearch.org/developers/docs/api/resources#places FamilySearch API Docs}
 */
 
/**
 * @ngdoc function
 * @name places.functions:getPlace
 *
 * @description
 * Get a place.
 *
 * - `getPlace()` - get the {@link places.types:constructor.PlaceDescription PlaceDescription} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_resource API Docs}
 *
 * @param {String} url full url of a place
 * @return {Object} promise for the response
 */
FS.prototype.getPlace = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var data = utils.maybe(response.getData());
    utils.forEach(data.places, function(place, index, obj){
      obj[index] = self.createPlaceDescription(place);
    });
    return utils.extend(response, {
      getPlace: function() { 
        return utils.maybe(data.places)[0]; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceDescription

 *
 * @description
 * Get a place.
 *
 * - `getPlaceDescription()` - get the {@link places.types:constructor.PlaceDescription PlaceDescription} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Description_resource API Docs}
 * 
 *
 * @param {String} url full url of the place description
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceDescription = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var data = utils.maybe(response.getData()),
        placesMap = {};
    
    utils.forEach(data.places, function(place, index, obj){
      obj[index] = placesMap[place.id] = self.createPlaceDescription(place);
    });
    
    utils.forEach(data.places, function(place){
      if(place.data.jurisdiction && place.data.jurisdiction.resource){
        var jurisdictionId = place.data.jurisdiction.resource.substring(1);
        if(placesMap[jurisdictionId]){
          place.setJurisdiction(placesMap[jurisdictionId]);
        }
      }
    });
    
    return utils.extend(response, {
      getPlaceDescription: function() { 
        return utils.maybe(data.places)[0]; 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceSearch

 *
 * @description
 * Search for a place.
 *
 * - `getSearchResults()` - get an array of {@link places.types:constructor.PlacesSearchResult PlacesSearchResults} from the response.
 * 
 * __Search Parameters__
 * 
 * * `start` - The index of the first search result for this page of results.
 * * `count` - The number of search results per page.
 * * `name`
 * * `partialName`
 * * `date`
 * * `typeId`
 * * `typeGroupId`
 * * `parentId`
 * * `latitude`
 * * `longitude`
 * * `distance`
 * 
 * Read the {@link https://familysearch.org/developers/docs/api/places/Places_Search_resource API Docs} for more details on how to use the parameters.
 * 
 *
 * @param {String} id of the place description
 * @return {Object} promise for the response
 */
FS.prototype.getPlacesSearch = function(params) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSPA', 'place-search').then(function(url){
    return self.plumbing.get(url, utils.removeEmptyProperties({
      q: utils.searchParamsFilter(utils.removeEmptyProperties(utils.extend({}, params))),
      start: params.start,
      count: params.count
    }), {'Accept': 'application/x-gedcomx-atom+json'});
  }).then(function(response){
    var data = utils.maybe(response.getData());
    utils.forEach(data.entries, function(entry, i, obj){
      obj[i] = self.createPlacesSearchResult(entry);
    });
    return utils.extend(response, {
      getSearchResults: function() { 
        return utils.maybe(data.entries); 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceDescriptionChildren

 *
 * @description
 * Get the children of a Place Description. Use {@link places.functions:getPlaceSearch getPlacesSearch()} to filter by type, date, and more.
 *
 * - `getChildren()` - get an array of the {@link places.types:constructor.PlaceDescription PlaceDescriptions} (children) from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Description_Children_resource API Docs}
 * 
 *
 * @param {String} url full url for the place descriptions children endpoint
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceDescriptionChildren = function(url) {
  var self = this;
  return self.plumbing.get(url).then(function(response){
    var data = utils.maybe(response.getData());
    utils.forEach(data.places, function(place, index, obj){
      obj[index] = self.createPlaceDescription(place);
    });
    return utils.extend(response, {
      getChildren: function() { 
        return utils.maybe(data.places); 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceType

 *
 * @description
 * Get a place.
 *
 * - `getPlaceType()` - get the {@link vocabularies.types:constructor.VocabularyElement VocabularyElement} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Type_resource API Docs}
 * 
 *
 * @param {String} id of the place
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceType = function(typeId) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSPA', 'place-type', {ptid: typeId}).then(function(url){
    return self.plumbing.get(url, {}, {'Accept': 'application/ld+json'});
  }).then(function(response){
    return utils.extend(response, {
      getPlaceType: function() { 
        return self.createVocabularyElement(this.getData());
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceTypes

 *
 * @description
 * Get a list of all available Place Types.
 *
 * - `getList()` - get the {@link vocabularies.types:constructor.VocabularyList VocabularyList} from the response
 * - `getPlaceTypes()` - get an array of the {@link vocabularies.types:constructor.VocabularyElement VocabularyElements} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Types_resource API Docs}
 * 
 *
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceTypes = function() {
  var self = this;
  return self.plumbing.getCollectionUrl('FSPA', 'place-types').then(function(url){
    return self.plumbing.get(url, {}, {'Accept': 'application/ld+json'});
  }).then(function(response){
    return utils.extend(response, {
      getList: function() {
        return self.createVocabularyList(this.getData());
      },
      getPlaceTypes: function() { 
        return this.getList().getElements(); 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceTypeGroup

 *
 * @description
 * Get a Place Type Group which includes a list of Places Types in the group.
 *
 * - `getList()` - get the {@link vocabularies.types:constructor.VocabularyList VocabularyList} (Place Type Group) from the response
 * - `getPlaceTypes()` - get an array of the {@link vocabularies.types:constructor.VocabularyElement VocabularyElements} (Place Types) in the group
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Types_resource API Docs}
 * 
 *
 * @param {String} id of the place type group
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceTypeGroup = function(groupId) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSPA', 'place-type-group', {ptgid: groupId}).then(function(url){
    return self.plumbing.get(url, {}, {'Accept': 'application/ld+json'});
  }).then(function(response){
    return utils.extend(response, {
      getList: function() {
        return self.createVocabularyList(this.getData());
      },
      getPlaceTypes: function() { 
        return this.getList().getElements(); 
      }
    });
  });
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceTypeGroups

 *
 * @description
 * Get a list of all available Place Types.
 *
 * - `getList()` - get the {@link vocabularies.types:constructor.VocabularyList VocabularyList} from the response
 * - `getPlaceTypeGroups()` - get an array of the {@link vocabularies.types:constructor.VocabularyElement VocabularyElements} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Type_Groups_resource API Docs}
 * 
 *
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceTypeGroups = function() {
  var self = this;
  return self.plumbing.getCollectionUrl('FSPA', 'place-type-groups').then(function(url){
    return self.plumbing.get(url, {}, {'Accept': 'application/ld+json'});
  }).then(function(response){
    return utils.extend(response, {
      getList: function() {
        return self.createVocabularyList(this.getData());
      },
      getPlaceTypeGroups: function() { 
        return this.getList().getElements(); 
      }
    });
  });
};