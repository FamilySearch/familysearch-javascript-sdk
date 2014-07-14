A high-level javascript wrapper around the FamilySearch REST API.

[![Build Status](https://travis-ci.org/rootsdev/familysearch-javascript-sdk.png)](https://travis-ci.org/rootsdev/familysearch-javascript-sdk)
[![Stories in Ready](https://badge.waffle.io/rootsdev/familysearch-javascript-sdk.png?label=ready)](https://waffle.io/rootsdev/familysearch-javascript-sdk)

Overview
========

* Javascript functions wrap the underlying REST API calls.
The objects returned by the functions include convenience functions for extracting information from the returned JSON.
For example, the following logs the name of a person along with their spouses and chilren.

    ```javascript
    FamilySearch.getPersonWithRelationships('KW7S-VQJ', {persons:true}).then(function(response) {
      console.log(response.getPrimaryPerson().getName());
      var spouses = response.getSpouses();
      for (var s = 0; spousesLen = spouses.length; s &lt; spousesLen; s++) {
        console.log(spouses[s].getName());
        var children = response.getChildren(spouses[s].getId());
        for (var c = 0; childrenLen = children.length; c &lt; childrenLen; c++) {
          console.log(children[c].getName());
        }
      }
    });
    ```

* Asynchronous functions (like the one above) return promises to make it easy for you to refer to their results from anywhere in your code.

* Each function is [well-documented](http://rootsdev.org/familysearch-javascript-sdk)
and has an editable jsFiddle to demonstrate its functionality and allow you to experiment.

* Authentication is handled using a popup window.  You do not need to create an OAuth redirect page.
All you need to do is register a callback URI that shares the same hostname and port as your code.
Check out the [jsFiddle](http://jsfiddle.net/DallanQ/MpUg7/) to see it in action (requires you to have a sandbox account).

* Option to store access token in a session cookie.

* Retry in the case of throttled responses is handled for you.

* Cross-platform: the SDK works with jQuery or AngularJS, and soon Node.js.

* Object-oriented: SDK functions return objects, which have convenience functions to make getting or setting data easy.

* Consistent update API: each object has $save and $delete functions to persist changes or delete the object respectively.

* Modular: the SDK can be called from AMD (RequireJS), CommonJS (Node.js), or browser global environments.

Installation
============

The SDK is available as a versioned javascript file, following the [semantic versioning](http://semver.org/) guidelines.
We are still on major version 0, so the API is subject to some change.

There are three ways to download the SDK for use in your own projects:

First, if you use bower you can install it using:

    bower install familysearch-javascript-sdk

Second, you can click on the _Releases_ tab near the top of this github project page and select the release you want to download.

Third, you can get the most up-to-date version by downloading one of the following files:

[familysearch-javascript-sdk.js](http://rootsdev.org/familysearch-javascript-sdk/familysearch-javascript-sdk.js)

[familysearch-javascript-sdk.min.js](http://rootsdev.org/familysearch-javascript-sdk/familysearch-javascript-sdk.min.js)

In the future, if we can get 100 people watching the repo, [cdnJS](http://cdnjs.com/) will host it.

Documentation
=============

* [API docs](http://rootsdev.org/familysearch-javascript-sdk)
* [Slides from 2014 RootsTech talk](http://dallanq.github.io/rootstech-2014-fs-js-sdk-slides).

Roadmap
=======

####Milestone 1 - complete
* Create functions for basic read operations
* Make the SDK work with jQuery and AngularJS

####Milestone 2 - complete
* Create an example application (RootSnap) showing how to use the SDK.

####Milestone 3 - complete
* Create functions for the basic create, update, and delete operations - everything that you're likely to use

####Milestone 4 - November 1, 2014
* Version 1.0 -- all functions implemented, end-to-end tests in place, Node.js support, available in bower & npm repositories.

Releases
========

The Javascript SDK uses [semantic versioning](http://semver.org/) for releases. 
We are currently in a pre-1.0 state, which means that occasionally there will be backwards-incompatible changes.
Backward-incompatible changes don't happen very often, but they do happen occasionally. 
Once we hit version 1.0.0 later this Fall, I will make sure that changes are backwards-compatible.

You can check out a specific release by clicking on the github _Releases_ link.
The _Releases_ link also serves as a _Change Log_, so it's worth looking at even if you plan to work off the master branch. 

Contributing
============

Thank you for your interest in contributing! We love pull requests.

Follow these steps to properly setup your development environment:
* Fork this repo
* Run `npm install` to install the build dependencies
* [Install the grunt-cli ](http://gruntjs.com/getting-started#installing-the-cli)
* [Install PhantomJS](http://phantomjs.org/download.html)

Run `grunt test` to run the tests.

Run `grunt build` to build the project or `grunt server` to have grunt launch a server and watch for changed files with live-reload support.
(RequireJS is not needed; just grunt.)

This project uses .editorconfig to help configure your editor for consistent code indentation and styling.
Please follow the existing style in your changes.

Grunt runs jshint on the files using a rather strict .jshintrc file, which finds a lot of potential problems almost immediately.
Your changes should pass the jshint checks.
If you have a good reason not to follow a particular check for a particular statement,
you can disable the jshint test for that statement.
Some editors (e.g., WebStorm) can be configured to read the .jshintrc file to notify you immediately when something doesn't pass.

Grunt runs unit tests using karma. Please create unit tests for your changes.
See the existing unit test files for examples.

Grunt also generates documentation for the project.
Nearly a third of the code consists of comments that is turned into online documentation.
Please comment your changes.

Please create editable examples for your changes on jsFiddle.net.
Many of the existing examples on jsFiddle are in the DallanQ namespace; put your examples in your own namespace.
In the near future we will use Facebook's Huxley project to create end-to-end (integration) tests from the examples on jsFiddle,
so they will serve two purposes simultaneously: as human-readable examples and as end-to-end tests.
(There is a proof-of-concept in the huxley directory.)

When choosing what to work on, you may pick an existing issue to implement or create a new issue.
We suggest that you describe what you plan to implement in order to get feedback prior to implementation and
issuing a pull request, though you are also free to issue a pull request and ask for comments afterward.
