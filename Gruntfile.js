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
                        'bower_components/angular/angular.js',
                        'bower_components/angular-mocks/angular-mocks.js',

                        'bower_components/cldrjs/dist/cldr.js',
                        'bower_components/cldrjs/dist/cldr/event.js',
                        'bower_components/cldrjs/dist/cldr/supplemental.js',

                        'bower_components/globalize/dist/globalize.js',
                        'bower_components/globalize/dist/globalize/message.js',
                        'bower_components/globalize/dist/globalize/number.js',
                        'bower_components/globalize/dist/globalize/plural.js',
                        'bower_components/globalize/dist/globalize/currency.js',
                        'bower_components/globalize/dist/globalize/date.js',

                        'bower_components/karma-read-json/karma-read-json.js',

                        '<%= uglify.js.dest %>',
                        'test/unit/**/*.js',
                        { pattern: 'bower_components/cldr-data/**/*.json', included: false, served: true },
                        { pattern: 'demo/l10n/*.json', included: false, served: true },
                    ],
                    proxies: {
                        '/base/': '/'
                    }
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
