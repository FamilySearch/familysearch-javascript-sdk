module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      docs: ['docs']
    },
    jshint: {
      files: ['familysearch-javascript-sdk.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    ngdocs: {
      options: {
        dest: 'docs',
        html5Mode: false,
        title: 'FamilySearch Javascript SDK',
        bestMatch: false
      },
      all: ['<%= jshint.files %>']
    },
    'gh-pages': {
      options: {
        base: 'docs',
        message: 'Update docs'
      },
      local: {
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
      files: ['<%= jshint.files %>', 'Gruntfile.js', 'index.html'],
      tasks: ['jshint', 'ngdocs'],
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

  grunt.registerTask('server', [
    'connect',
    'watch'
  ]);

  grunt.registerTask('docs', [
    'clean:docs',
    'ngdocs'
  ]);

  grunt.registerTask('publishdocs', [
    'docs',
    'gh-pages:local'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'docs'
  ]);

  // Default task(s)
  grunt.registerTask('default', ['build']);
};
