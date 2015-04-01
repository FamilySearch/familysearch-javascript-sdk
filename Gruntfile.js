module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    src: ['src/**/*.js'],

    clean: {
      dist: ['dist']
    },

    ngdocs: {
      options: {
        dest: 'dist',
        html5Mode: false,
        title: 'FamilySearch Javascript SDK',
        bestMatch: false
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
        message: 'Update docs and files to distribute'
      },
      dev: {
        src: ['**/*']
      },
      travis: {
        options: {
          repo: 'https://' + process.env.GH_TOKEN + '@github.com/rootsdev/familysearch-javascript-sdk.git',
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
          dest: 'dist',
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
        exec: 'npm run browserify'
      }
    },
    
    uglify: {
      build: {
        files: {
          'dist/familysearch-javascript-sdk.min.js': 'dist/familysearch-javascript-sdk.js'
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

  // We test the built and minified version so that
  // we also verify a proper build process
  grunt.registerTask('test', [
    'jshint',
    'run:jasmine'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'test',
    'ngdocs',
    'run:browserify',
    'uglify',
    'copy:dist'
  ]);

  grunt.registerTask('publish', [
    'build',
    'gh-pages:dev'
  ]);

  grunt.registerTask('travis-pr', [
    'build',
    'ngdocs' // build the docs to make sure there aren't errors
  ]);

  grunt.registerTask('travis', [
    'travis-pr',
    'run:coveralls',
    'run:browserify',
    'copy:dist',
    'gh-pages:travis'
  ]);

  // Default task(s)
  grunt.registerTask('default', ['build']);
};
