/**
 * @ngdoc overview
 * @name index
 * @description
 *
 * ## Overview
 *
 * ### Goal
 *
 * The goal of this SDK is to make the FamilySearch REST endpoints easier to consume.
 * Each SDK function wraps a corresponding REST endpoint and adds *convenience functions*
 * to make navigating the response easier.
 * In addition to the convenience functions you also have access to the original response,
 * so you always have the option of navigating the response elements yourself.
 * And you can make calls not anticipated by the SDK using the *plumbing functions* described below.
 *
 * ### Features
 *
 * - Authentication can be performed with a single function call, or even automatically.
 * - The access token can be saved in a cookie and can be expired automatically.
 * - REST endpoints can be called using simple function calls that set the correct request headers and request the correct URL.
 * - GET's are automatically retried to handle transient errors.
 * - Throttling is handled - calls are automatically retried.
 * - Responses are mapped to objects or arrays of objects that have convenience functions
 * to make extracting data from the responses easier.
 * - The object prototypes can be extended with additional functions to navigate the response json and return
 * whatever custom information is desired.
 * - The SDK works both in the browser and in node.
 *
 * ### Object model
 *
 * <img src="https://docs.google.com/drawings/d/1o3vRqYQSXoao94Z0cdaK9dR8MveS9U2jCsBOobw0xks/pub?w=650&amp;h=492"/>
 *
 * People with names and facts
 *
 * - {@link person.types:constructor.Person Person}
 * - {@link fact.types:constructor.Fact Fact}
 * - {@link name.types:constructor.Name Name}
 *
 * Relationships between people
 *
 * - {@link spouses.types:constructor.Couple Couple}
 * - {@link parentsAndChildren.types:constructor.ChildAndParents ChildAndParents}
 *
 * Ojects related to people and relationships
 *
 * - {@link notes.types:constructor.Note Note}
 * - {@link sources.types:constructor.SourceRef SourceRef}
 * - {@link sources.types:constructor.SourceDescription SourceDescription}
 * - {@link discussions.types:constructor.DiscussionRef DiscussionRef}
 * - {@link discussions.types:constructor.Discussion Discussion}
 * - {@link discussions.types:constructor.Comment Comment}
 * - {@link memories.types:constructor.MemoryPersonaRef MemoryPersonaRef}
 * - {@link memories.types:constructor.MemoryPersona MemoryPersona}
 * - {@link memories.types:constructor.Memory Memory}
 * - {@link memories.types:constructor.MemoryArtifactRef MemoryArtifactRef}
 * - {@link changeHistory.types:constructor.Change Change}
 *
 * Search & match
 *
 * - {@link searchAndMatch.types:constructor.SearchResult SearchResult}
 *
 * Attribution
 *
 * - {@link attribution.types:constructor.Attribution Attribution}
 *
 * Users
 *
 * - {@link user.types:constructor.Agent Agent}
 * - {@link user.types:constructor.User User}
 *
 * ## Installation
 * 
 * The SDK is available as a versioned javascript file, following the [semantic versioning](http://semver.org/) guidelines.
 * 
 * 1. Bower
 * 
 *   ```
 *   bower install familysearch-javascript-sdk
 *   ```
 * 
 * 1. Node
 *    
 *   ```
 *   npm install familysearch-javascript-sdk.git
 *   ```
 * 
 * 1. CDN via [jsDelivr](http://www.jsdelivr.com/#!familysearch-javascript-sdk)
 * 
 *   ```html
 *   <script src="//cdn.jsdelivr.net/familysearch-javascript-sdk/1.0.0/familysearch-javascript-sdk.min.js"></script>
 *   ```
 *
 * ### Browser
 *
 * 1. Create an instance of the SDK. Read more about {@link familysearch.types:constructor.FamilySearch all available options}.
 * <pre>
 * var client = new FamilySearch({
 *   client_id: 'YOUR_CLIENT_ID_GOES_HERE',
 *   environment: 'sandbox',
 *   // redirect_uri is the URI you registered with FamilySearch.
 *   // The page does not need to exist. The URI only needs to have
 *   // the same host and port as the server running your script.
 *   // (If you want your app to work on Mobile Safari, the page does need to exist.
 *   //  see the "Authentication with Mobile Safari" section below for more information.)
 *   redirect_uri: 'REDIRECT_URI_GOES_HERE'
 * });
 * </pre>
 *
 * 2. Get an access token
 * <pre>
 * client.getAccessToken().then(function(response) {
 *    // now you have an access token
 * });
 * </pre>
 *
 * 3. Make API calls
 * <pre>
 * client.getCurrentUser().then(function(response) {
 *    // now you have the response
 * });
 * </pre>
 *
 * #### Example
 *
 * <pre>
 * var client = new FamilySearch({
 *   client_id: 'MY_CLIENT_ID',
 *   environment: 'sandbox',
 *   redirect_uri: 'http://localhost/auth'
 * });
 *
 * client.getAccessToken().then(function(accessToken) {
 *   client.getCurrentUser().then(function(response) {
 *     var user = response.getUser();
 *     console.log('Hello ' + user.getContactName());
 *   });
 * });
 * </pre>
 *
 * ### Node.js
 * 
 * 1. `npm install familysearch-javascript-sdk`
 *  
 * 2. Require the necessary modules:
 * <pre>
 * var FS = require('familysearch-javascript-sdk');
 * </pre>
 * 
 * 3. Create an instance of the SDK. Read more about {@link familysearch.types:constructor.FamilySearch all available options}.
 * <pre>
 * var client = new FamilySearch({
 *   client_id: 'YOUR_CLIENT_ID_GOES_HERE',
 *   environment: 'sandbox',
 *   access_token: 'SOME_ACCESS_TOKEN'
 * });
 * </pre>
 *
 * 4. Make API calls
 * <pre>
 * client.getCurrentUser().then(function(response) {
 *    // now you have the response
 * });
 * </pre>
 *
 * #### Example
 *
 * <pre>
 * var client = new FamilySearch({
 *   client_id: 'MY_CLIENT_ID',
 *   environment: 'sandbox',
 *   access_token: 'SOME_ACCESS_TOKEN'
 * });
 *
 * client.getCurrentUser().then(function(response) {
 *   var user = response.getUser();
 *   console.log('Hello '+user.contactName);
 * });
 * </pre>
 *
 * ## SDK Functions return promises
 *
 * As illustrated by the example above, most SDK functions return *promises*.
 * Promises are a great way to manage asynchronous code.
 * A promise has a `then(success callback, optional error callback)` method into which you pass your
 * *callback functions*.
 * Your *success callback function* is called once the promise has been fulfilled;
 * your *error callback function* is called if the project gets rejected.
 * Learn more about [promises in JavaScript](http://www.html5rocks.com/en/tutorials/es6/promises/).
 *
 * If the promise is fulfilled, it will call your success callback function with a single parameter containing a response object.
 * If the response is rejected, it will call your error callback function with an Error.
 *
 * ## Handling responses
 *
 * SDK functions typically return a response object with the follow functions:
 * 
 * - `getBody()` - Get the raw body. In the browser this is a string. In Node this will be a buffer.
 * - `getData()` - Get the processed body. When the response is JSON this will return a JSON object.
 * - `getStatusCode()` - Return the HTTP status code as an integer.
 * - `getHeader(header[, getAll])` - Get a header value from the response. When `getAll` is true it will return an array containing all header values.
 * Sometimes the same header is set multiple times such as the `Link` headers when creating a new object.
 * - `getRequest()` - Get an object representing the original request with properties `url`, `method`, `headers`, and `body`.
 * 
 * The SDK function calls often add *convenience functions* for returning various objects from the response.
 * For example, the `getPerson('ID')` call adds a `response.getPerson()` convenience function that returns the
 * {@link person.types:constructor.Person Person} object from the response.
 *
 * The returned objects convenience functions for accessing the data.
 * For example, the prototype for {@link person.types:constructor.Person Person} objects includes `getGivenName()` and `getSurname()`
 * convenience functions for returning the person's given name and surname respectively.
 * Without these convenience functions, you would have to navigate the `parts` elements of the `nameForms` array,
 * look for a part whose `type` element is `http://gedcomx.org/Given` or `http://gedcomx.org/Surname` respectively, and
 * then return the `value` element of that part. `getGivenName()` and `getSurname()` do this for you.
 * The object properties and convenience functions are fully described in the docs.
 *
 * You can add your own convenience functions to the returned objects.
 * For example, suppose you wanted to display someone's name followed by their id. You could write
 * <pre>
 *   FamilySearch.Person.prototype._getNameAndId = function() {
 *     return this.getDisplayName() + ' (' + this.getId() + ')';
 *   }
 * </pre>
 *
 * and from then on you could call `person._getNameAndId()` on any {@link person.types:constructor.Person Person} object.
 *
 * <pre>
 * FamilySearch.getPerson('ID').then(function(response) {
 *   var person = response.getPerson();
 *   console.log('Hello ' + person._getNameAndId());
 * });
 * </pre>
 *
 * ## Creating, Updating, and Deleting
 *
 * When you want to create a new object, do not use the class's constructor directly. 
 * Each class has a function which should be used instead. This allows us to maintain
 * a reference to the SDK client in each object (so that you don't have to).
 *
 * <pre>
 * var person = client.createPerson({ person data });
 * </pre>
 *
 * For each class, the structure of the data it expects matches what the API uses,
 * as [documented here](https://familysearch.org/developers/docs/api/media-types).
 * Occassionally we support simplified attributes for common
 * bits of data so that you don't have to nest them in objects and arrays.
 * The following two examples are equivalent:
 * 
 * <pre>
 * var name = client.createName({
 *  "attribution" : {
 *    "changeMessage" : "change message"
 *  },
 *  "type" : "http://gedcomx.org/BirthName",
 *  "nameForms" : [ {
 *    "fullText" : "Anastasia Aleksandrova",
 *    "parts" : [ {
 *      "type" : "http://gedcomx.org/Given",
 *      "value" : "Anastasia"
 *    }, {
 *      "type" : "http://gedcomx.org/Surname",
 *      "value" : "Aleksandrova"
 *    } ]
 *  } ]
 * });
 *
 * var name = client.createName({
 *  "changeMessage" : "change message",
 *  "type" : "http://gedcomx.org/BirthName",
 *  "fullText" : "Anastasia Aleksandrova",
 *  "givenName": "Anastasia"
 *  "surname": "Aleksandrova"
 * });
 * </pre>
 *
 * The constructors for each class document whether any simplified attributes are supported.
 *
 * Often, the simplified attributes are just shortcuts to a corresponding setter function.
 * Therefore, this example is equivalent to the two above:
 *
 * <pre>
 * var name = client.createName()
 *   .setChangeMessage("change message")
 *   .setType("http://gedcomx.org/BirthName")
 *   .setFullText("Anastasia Aleksandrova")
 *   .setGivenName("Anastasia")
 *   .setSurname("Aleksandrova");
 * </pre>
 * 
 * When a object can be saved directly, such as a Person, the `save()` method will
 * send the object's data to the API to create in then update the object's ID and
 * links from the response before resolving the promise returned by `save()`.
 *
 * After modifying an object that has already been saved, you can call the `save()`
 * method again to send the changes to the API.
 * 
 * Deletable objects will have a `delete()` method.
 *
 * Many `save()` and `delete()` functions take a `changeMessage` parameter to record the reason for the change.
 * 
 * ## Authentication with Mobile Safari
 *
 * Mobile Safari opens the authentication popup window in a new tab and doesn't run javascript in background tabs.
 * Therefore, to run your app on Mobile Safari the redirect_uri URL must point to an HTML page containing the following:
 *
 * <pre>
 * <!DOCTYPE html>
 * <html><body>
 * <script>
 *   window.opener.FamilySearchOauthReceiver(window.location.href);
 *   window.close();
 * </script>
 * </body></html>
 * </pre>
 *
 * ## Using the SDK with module loaders
 *
 * The SDK can be used
 *
 * - as a browser global (i.e., referring to it as `window.FamilySearch` or just `FamilySearch`),
 * - with AMD loaders like *RequireJS* ([see the jQuery.html example](https://github.com/rootsdev/familysearch-javascript-sdk/blob/master/examples/jquery.html)),
 * - or with CommonJS loaders like *Node.js*.
 *
 * ## Plumbing functions
 *
 * The functions in the *plumbing* module are low-level functions that you would not normally call.
 * The higher-level API functions that you normally call are built on top of the plumbing functions.
 * The plumbing functions are exposed in case you want to do something not anticipated by the API functions.
 */
