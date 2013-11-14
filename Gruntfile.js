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
      all: ['<%= jshint.files %>']
    },
    jshint: {
      files: ['familysearch-javascript-sdk.js'],
      options: {
        jshintrc: '.jshintrc'
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

  // Load the plugin that provides the documentation task
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
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

  grunt.registerTask('build', [
    'jshint',
    'docs'
  ]);

  // Default task(s)
  grunt.registerTask('default', ['build']);
};
