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
    
    requirejs: {
      options: {
        baseUrl: 'src',
        include: ['FamilySearch'],
        wrap: {
          startFile: 'src/header.frag',
          endFile: 'src/footer.frag'
        }
      },
      dev: {
        options: {
          out: 'dist/familysearch-javascript-sdk.js',
          optimize: 'none'
        }
      },
      prod: {
        options: {
          out: 'dist/familysearch-javascript-sdk.min.js',
          optimize: 'uglify2'
        }
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
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-run');

  grunt.registerTask('test', [
    'run'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'jshint',
    'test',
    'ngdocs',
    'requirejs',
    'copy:dist'
  ]);

  grunt.registerTask('publish', [
    'build',
    'gh-pages:dev'
  ]);

  grunt.registerTask('travis-pull-request', [
    'jshint',
    'test',
    'ngdocs' // build the docs to make sure there aren't errors
  ]);

  grunt.registerTask('travis', [
    'travis-pull-request',
    'requirejs',
    'copy:dist',
    'gh-pages:travis'
  ]);

  // Default task(s)
  grunt.registerTask('default', ['build']);
};
