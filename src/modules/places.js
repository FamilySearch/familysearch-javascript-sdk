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
 * @function
 *
 * @description
 * Get a place.
 *
 * - `getPlace()` - get the {@link places.types:constructor.PlaceDescription PlaceDescription} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_resource}
 *
 * @param {String} id of the place
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPlace = function(placeId, opts) {
  var self = this,
      url = self.helpers.getAPIServerUrl(self.helpers.populateUriTemplate('/platform/places/{id}', {id: placeId}));
  return self.plumbing.get(url, {}, {}, opts,
    utils.compose(
      utils.objectExtender({
        getPlace: function() { 
          return utils.maybe(this.places)[0]; 
        }
      }),
      function(response){
        utils.forEach(response.places, function(place, index, obj){
          obj[index] = self.createPlaceDescription(place);
        });
        return response;
      }
    ));
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceDescription
 * @function
 *
 * @description
 * Get a place.
 *
 * - `getPlaceDescription()` - get the {@link places.types:constructor.PlaceDescription PlaceDescription} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Description_resource}
 *
 * @param {String} id of the place description
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceDescription = function(placeId, opts) {
  var self = this,
      url = self.helpers.getAPIServerUrl(self.helpers.populateUriTemplate('/platform/places/description/{id}', {id: placeId}));
  return self.plumbing.get(url, {}, {}, opts,
    utils.compose(
      utils.objectExtender({
        getPlaceDescription: function() { 
          return utils.maybe(this.places)[0]; 
        }
      }),
      function(response){
        var placesMap = {};
        
        utils.forEach(response.places, function(place, index, obj){
          obj[index] = placesMap[place.id] = self.createPlaceDescription(place);
        });
        utils.forEach(response.places, function(place){
          if(place.jurisdiction && place.jurisdiction.resource){
            var jurisdictionId = place.jurisdiction.resource.substring(1);
            if(placesMap[jurisdictionId]){
              place.$setJurisdiction(placesMap[jurisdictionId]);
            }
          }
        });
        
        return response;
      }
    ));
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceSearch
 * @function
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
 * @param {String} id of the place description
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPlacesSearch = function(params, opts) {
  var self = this,
      url = self.helpers.getAPIServerUrl('/platform/places/search');
  return self.plumbing.get(url, utils.removeEmptyProperties({
    q: utils.searchParamsFilter(utils.removeEmptyProperties(utils.extend({}, params))),
    start: params.start,
    count: params.count
  }), {'Accept': 'application/x-gedcomx-atom+json'}, opts,
    utils.compose(
      utils.objectExtender({
        getSearchResults: function() { 
          return utils.maybe(this.entries); 
        }
      }),
      function(response){
        utils.forEach(response.entries, function(entry, i, obj){
          obj[i] = self.createPlacesSearchResult(entry);
        });
        return response;
      }
    ));
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceDescriptionChildren
 * @function
 *
 * @description
 * Get the children of a Place Description. Use {@link places.functions:getPlaceSearch getPlacesSearch()} to filter by type, date, and more.
 *
 * - `getChildren()` - get an array of the {@link places.types:constructor.PlaceDescription PlaceDescriptions} (children) from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Description_Children_resource}
 *
 * @param {String} id of the place description
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceDescriptionChildren = function(placeId, opts) {
  var self = this,
      url = self.helpers.getAPIServerUrl(self.helpers.populateUriTemplate('/platform/places/description/{id}/children', {id: placeId}));
  return self.plumbing.get(url, {}, {}, opts,
    utils.compose(
      utils.objectExtender({
        getChildren: function() { 
          return utils.maybe(this.places); 
        }
      }),
      function(response){
        utils.forEach(response.places, function(place, index, obj){
          obj[index] = self.createPlaceDescription(place);
        });
        return response;
      }
    ));
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceType
 * @function
 *
 * @description
 * Get a place.
 *
 * - `getPlaceType()` - get the {@link places.types:constructor.PlaceType PlaceType} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Type_resource}
 *
 * @param {String} id of the place
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceType = function(typeId, opts) {
  var self = this,
      url = self.helpers.getAPIServerUrl(self.helpers.populateUriTemplate('/platform/places/types/{id}', {id: typeId}));
  return self.plumbing.get(url, {}, {}, opts,
    utils.compose(
      utils.objectExtender({
        getPlaceType: function() { 
          return self.createPlaceType(this); 
        }
      })
    ));
};