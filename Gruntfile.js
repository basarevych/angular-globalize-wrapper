'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/* <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '   Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= pkg.license %> */\n\n',

        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            js: {
                src: ['js/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            },
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            js: {
                src: '<%= concat.js.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            },
        },

        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true,
                autoWatch: false,
                options: {
                    files: [
                        "http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.js",
                        "http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular-route.js",
                        "http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular-mocks.js",
                        { pattern: 'bower_components/cldr-data/**/*.json', included: false, served: true },
                        { pattern: 'demo/l10n/*.json', included: false, served: true },
                        '<%= uglify.js.dest %>',
                        'test/unit/**/*.js',
                    ],
                }
            }
        },
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');

    // Default task.
    grunt.registerTask('default', ['concat', 'uglify']);

    grunt.registerTask('test', ['concat', 'uglify', 'karma']);
};
