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
      src: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: [
          '<%= ngdocs.all %>'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: [
          'test/unit/*.js'
        ]
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
          user: {
            name: 'Travis',
            email: 'travis@travis-ci.org'
          },
          silent: true
        },
        src: ['**/*']
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      dev: {
        background: true,
        browsers: ['PhantomJS']
      },
      travis: {
        singleRun: true,
        browsers: ['PhantomJS']
      }
    },
    connect: {
      server: {
        options: {
          port: 9000,
          open: 'http://localhost:9000/',
          livereload: true
        }
      }
    },
    watch: {
      files: [
        '<%= ngdocs.all %>',
        'test/unit/*.js',
        '.jshintrc',
        'test/.jshintrc',
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

  grunt.registerTask('travis', [
    'jshint',
    'karma:travis',
    'docs',
    'gh-pages:travis'
  ]);

  // Default task(s)
  grunt.registerTask('default', ['build']);
};
