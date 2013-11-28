module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    src: 'src/*.js',

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
      all: ['<%= src %>', 'src/*.frag']
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

    requirejs: {
      options: {
        almond: true,
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
        '<%= src %>',
        'test/unit/*.js',
        '.jshintrc',
        'test/.jshintrc',
        'Gruntfile.js',
        'index.html'
      ],
      tasks: ['jshint', 'karma:dev:run', 'ngdocs'],
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
  grunt.loadNpmTasks('grunt-requirejs');

  grunt.registerTask('server', [
    'connect',
    'karma:dev:start',
    'watch'
  ]);

  grunt.registerTask('test', [
    'karma:travis'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'jshint',
    'test',
    'ngdocs',
    'requirejs'
  ]);

  grunt.registerTask('publish', [
    'build',
    'gh-pages:dev'
  ]);

  grunt.registerTask('travis', [
    'jshint',
    'karma:travis',
    'ngdocs',
    'requirejs',
    'gh-pages:travis'
  ]);

  // Default task(s)
  grunt.registerTask('default', ['build']);
};
