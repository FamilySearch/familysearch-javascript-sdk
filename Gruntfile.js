module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      docs: ['docs']
    },
    ngdocs: {
      options: {
        dest: 'docs',
        html5Mode: false,
        title: 'FamilySearch Javascript SDK',
        bestMatch: false
      },
      all: ['familysearch-javascript-sdk.js']
    },
    jshint: {
      files: [
        '<%= ngdocs.all %>',
        'test/unit/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    'gh-pages': {
      options: {
        base: 'docs',
        message: 'Update docs'
      },
      dev: {
        src: ['**/*']
      },
      travis: {
        options: {
          repo: 'https://' + process.env.GH_TOKEN + '@github.com/rootsdev/familysearch-javascript-sdk.git',
          silent: true
        },
        src: ['**/*']
      }
    },
    karma: {
      options: {
        basePath: '',
        frameworks: ['jasmine'],
        files: [
          'familysearch-javascript-sdk.js',
          'test/vendor/jquery-1.10.1.min.js',
          'test/vendor/jasmine-jquery.js',
          'test/unit/*.js'
        ],
        browsers: ['PhantomJS']
      },
      dev: {
        background: true
      },
      travis: {
        singleRun: true
      }
    },
    connect: {
      server: {
        options: {
          port: 9000,
          open: true,
          livereload: true
        }
      }
    },
    watch: {
      files: [
        '<%= jshint.files %>',
        '.jshintrc',
        'Gruntfile.js',
        'index.html'
      ],
      tasks: ['jshint', 'ngdocs', 'karma:dev:run'],
      options: {
        livereload: true,
        spawn: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('server', [
    'connect',
    'karma:dev:start',
    'watch'
  ]);

  grunt.registerTask('test', [
    'karma:travis'
  ]);

  grunt.registerTask('docs', [
    'clean:docs',
    'ngdocs'
  ]);

  grunt.registerTask('publishdocs', [
    'docs',
    'gh-pages:dev'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'test',
    'docs'
  ]);

  // Default task(s)
  grunt.registerTask('default', ['build']);
};
