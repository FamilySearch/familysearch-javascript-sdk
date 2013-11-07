module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ngdocs: {
      options: {
        dest: 'docs',
        html5Mode: false,
        title: 'FamilySearch Javascript SDK',
        bestMatch: false
      },
      all: ['familysearch-javascript-sdk.js']
    },
    connect: {
      options: {
        keepalive: true
      },
      server: {}
    },
    clean: ['docs'],
    docular: {
      groups: [
        {
          groupTitle: 'Group title',
          groupId: 'groupid',
          groupIcon: 'icon-book',
          showSource: true,
          sections: [
            {
              id: 'sectionid',
              title: 'Section Title',
              showSource: true,
              scripts: [
                'familysearch-javascript-sdk.js'
              ],
              docs : [],
              rank: {}
            }
          ]
        }
      ],
      docular_webapp_target: 'docs'
    }
  });

  // Load the plugin that provides the documentation task
  //grunt.loadNpmTasks('grunt-docular');
  grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s)
  grunt.registerTask('default', ['clean', 'ngdocs', 'connect']);
};
