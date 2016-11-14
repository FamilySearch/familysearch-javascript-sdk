# GedcomX - JavaScript SDK

[![npm](https://img.shields.io/npm/v/familysearch-javascript-sdk.svg)](https://www.npmjs.com/package/familysearch-javascript-sdk)
[![Build Status](https://travis-ci.org/FamilySearch/familysearch-javascript-sdk.png)](https://travis-ci.org/FamilySearch/familysearch-javascript-sdk)
[![Coverage Status](https://coveralls.io/repos/FamilySearch/familysearch-javascript-sdk/badge.svg?branch=master)](https://coveralls.io/r/FamilySearch/familysearch-javascript-sdk?branch=master)
[![Dependency Status](https://david-dm.org/FamilySearch/familysearch-javascript-sdk.svg)](https://david-dm.org/FamilySearch/familysearch-javascript-sdk)
[![devDependency Status](https://david-dm.org/FamilySearch/familysearch-javascript-sdk/dev-status.svg)](https://david-dm.org/FamilySearch/familysearch-javascript-sdk#info=devDependencies)

This JavaScript SDK is a high-level JavaScript wrapper around the [FamilySearch REST API](https://familysearch.org/developers/docs/api/resources).

See the wiki for the following:

* A [tutorial](https://github.com/FamilySearch/familysearch-javascript-sdk/wiki) to help get you started.
* A **sample app** [github project](https://github.com/FamilySearch/javascript-sdk-sample-app) and [running version](https://fs-javascript-sdk-sample-app.herokuapp.com/) that demonstrates how to fulfill common use cases.
* [Documentation of the JavaScript SDK](http://familysearch.github.io/familysearch-javascript-sdk/) and other [FamilySearch API development guides](https://familysearch.org/developers/docs/guides).

## Installation

### Node.js

Node versions 0.10 and 0.12 are officially supported.

`npm install familysearch-javascript-sdk`

### Browser via a CDN

Versions 1.0.0 - 2.6.0 are available via [jsDelivr](http://www.jsdelivr.com/#!familysearch-javascript-sdk).

```html
<script src="//cdn.jsdelivr.net/familysearch-javascript-sdk/2.1.0/familysearch-javascript-sdk.min.js"></script>
```

jsDelivr's hasn't published v2.7.0 or v2.8.0 and it's future is uncertain so we
switched to [unpkg](https://unpkg.com/#/) starting with version 2.8.2.

```html
<script src="//unpkg.com/familysearch-javascript-sdk@2.8.2/dist/familysearch-javascript-sdk.min.js"></script>
```

## Features

* **Wrapped REST API Calls**

 JavaScript functions wrap the underlying REST API calls.
The objects returned by the functions include convenience functions for extracting information from the returned JSON.
For example, the following logs the name of a person along with their spouses and chilren.

    ```javascript
    client.getPerson('KW7S-VQJ', {persons:true}).then(function(response) {
      console.log(response.getPrimaryPerson().getDisplayName());
    });
    ```

* **Promises**

 Asynchronous functions (like the one above) return promises to make it easy for you to refer to their results from anywhere in your code.

* **Well Documented**

 Each function is [well-documented](http://familysearch.github.io/familysearch-javascript-sdk)
and has an editable jsFiddle to demonstrate its functionality and allow you to experiment.

* **Popup Authentication**

 In the browser, authentication is handled using a popup window. You do not need to create an OAuth redirect page.
All you need to do is register a callback URI that shares the same hostname and port as your code.

* **Automatic Authentication**

 If you make a call without first authenticating, the authentication process will be initiated first automatically.

* **Token Storage**

 There is an option to store your access token in a session cookie.

* **Throttle Handling**

 Retry in the case of throttled responses is handled for you.

* **Cross-platform**

 Works both in the browser and in node. See the [examples](https://github.com/FamilySearch/familysearch-javascript-sdk/tree/master/examples).

* **Object-oriented**

 SDK functions return objects, which have convenience functions to make getting or setting data easy.

* **Consistent update API**

 Each object has save and delete functions to persist changes or delete the object respectively.


## Contributing

Thank you for your interest in contributing! We love pull requests.

Follow these steps to properly setup your development environment:

* Fork this repo
* Run `npm install` to install the build dependencies.
* Run `npm test` to run the tests.
* Run `npm run build` to build the project.

This project uses .editorconfig to help configure your editor for consistent code indentation and styling.
Please follow the existing style in your changes.

Grunt runs jshint on the files using a rather strict .jshintrc file, which finds a lot of potential problems almost immediately.
Your changes should pass the jshint checks.
If you have a good reason not to follow a particular check for a particular statement,
you can disable the jshint test for that statement.
Some editors (e.g., WebStorm) can be configured to read the .jshintrc file to notify you immediately when something doesn't pass.

Grunt runs unit tests using jasmine. Please create unit tests for your changes.
See the existing unit test files for examples.

Grunt also generates documentation for the project.
Nearly a third of the code consists of comments that is turned into online documentation.
Please comment your changes.

When choosing what to work on, you may pick an existing issue to implement or create a new issue.
We suggest that you describe what you plan to implement in order to get feedback prior to implementation and
issuing a pull request, though you are also free to issue a pull request and ask for comments afterward.
