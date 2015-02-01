'use strict';

var app = angular.module('app', ['globalizeWrapper']);

app.config(
    [ 'globalizeWrapperProvider',
    function (globalizeWrapperProvider) {
        globalizeWrapperProvider.setCldrBasePath('../bower_components/cldr-data');
        globalizeWrapperProvider.setL10nBasePath('l10n');
    } ]
);

app.run(
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        globalizeWrapper.loadLocale('en');
    } ]
);
