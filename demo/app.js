'use strict';

var app = angular.module('app', ['ngRoute', 'globalizeWrapper']);

app.config(
    [ '$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/', {
                controller: 'Controller',
                templateUrl: 'demo/views/index.html',
            }).
            otherwise({
                redirectTo: '/'
            });
    } ]
);

app.config(
    [ 'globalizeWrapperProvider',
    function (globalizeWrapperProvider) {
        globalizeWrapperProvider.setCldrBasePath('bower_components/cldr-data');
        globalizeWrapperProvider.setL10nBasePath('demo/l10n');
    } ]
);

app.controller('Controller',
    [ '$scope', '$timeout', '$route', 'globalizeWrapper',
    function ($scope, $timeout, $route, globalizeWrapper) {
        $scope.dt = new Date();

        $scope.switchLocale = function (locale) {
            globalizeWrapper.setLocale(locale);
        };

        $scope.$on('GlobalizeLoadSuccess', function () { $route.reload(); });
    } ]
);

app.run(
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        globalizeWrapper.setLocale('en');
    } ]
);
