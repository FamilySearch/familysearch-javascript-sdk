module.exports = function(grunt) {
  
  var pkg = grunt.file.readJSON('package.json');
  
  grunt.initConfig({
    
    gitinfo: {},
    
    pkg: pkg,
    
    // Ignore patch versions. Those should only have bugfixes so we just want to
    // udpate the docs in that case. Minor version changes should add features
    // meaning we want new docs.
    docVersion: pkg.version.split('.').slice(0,-1).join('.'),
    
    src: ['src/**/*.js'],

    clean: {
      dist: ['dist/<%= docVersion %>']
    },

    ngdocs: {
      options: {
        dest: 'dist/<%= docVersion %>',
        html5Mode: false,
        title: 'FamilySearch Javascript SDK',
        bestMatch: false,
        navTemplate: 'dist/nav.tmpl'
      },
      all: ['<%= src %>']
    },

    jshint: {
      src: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['<%= src %>']
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/unit/*.js']
      }
    },

    'gh-pages': {
      options: {
        base: 'dist',
        message: 'Update docs and files to distribute',
        add: true
      },
      travis: {
        options: {
          repo: 'https://' + process.env.GH_TOKEN + '@github.com/FamilySearch/familysearch-javascript-sdk.git',
          user: {
            name: 'Travis',
            email: 'travis@travis-ci.org'
          },
          silent: true
        },
        src: ['**/*']
      }
    },

    copy: {
      dist: {
        files: [{
          cwd: '.',
          src: 'bower.json',
          dest: 'dist/<%= docVersion %>',
          expand: true
        }]
      }
    },
    
    run: {
      jasmine: {
        exec: 'npm run jasmine'
      },
      coveralls: {
        exec: 'npm run coveralls'
      },
      browserify: {
        exec: 'node_modules/.bin/browserify src/FamilySearch.js --standalone FamilySearch > dist/<%= docVersion %>/familysearch-javascript-sdk.js'
      }
    },
    
    uglify: {
      build: {
        files: {
          'dist/<%= docVersion %>/familysearch-javascript-sdk.min.js': 'dist/<%= docVersion %>/familysearch-javascript-sdk.js'
        }
      }
    },
  
    gitcheckout: {
      'gh-pages': {
        options: {
          branch: 'gh-pages'
        }
      },
      'reset': {
        options: {
          branch: '<%= gitinfo.local.branch.current.name %>'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-gitinfo');
  grunt.loadNpmTasks('grunt-git');

  grunt.registerTask('test', [
    'jshint',
    'run:jasmine'
  ]);
  
  // Get a list of previous doc versions by checkout out gh-pages branch
  // and traversing the list of directories
  grunt.registerTask('versions', function(){
    
    // We filter out any lingering directories that might not match what
    // we're looking for, such as node_modules
    var versionMatcher = /^\d+\.\d+$/,
        versions = grunt.file.expand({
          filter: "isDirectory"
        }, ["*"]).filter(function(name){
          return versionMatcher.test(name); 
        });
    
    var currentVersion = grunt.config.get('docVersion');
    if(versions.indexOf(currentVersion) === -1){
      versions.push(currentVersion);
    }
    
    // We want them in reverse order so that most recent is first
    versions.sort().reverse();
    
    // Save in grunt config so that the docs generator can see it
    grunt.config.set('versions', versions);
  });
  
  grunt.registerTask('docsindex', function(){
    grunt.file.write('dist/index.html', grunt.template.process(grunt.file.read('dist/index.tmpl')));
  });

  grunt.registerTask('build', [
    'clean:dist',
    'test',
    'gitinfo',
    'gitcheckout:gh-pages',
    'versions',
    'gitcheckout:reset',
    'ngdocs',
    'docsindex',
    'run:browserify',
    'uglify',
    'copy:dist'
  ]);

  grunt.registerTask('travis', [
    'build',
    'run:coveralls',
    'gh-pages:travis'
  ]);

  // Default task(s)
  grunt.registerTask('default', ['build']);
};
