'use strict';

var app = angular.module('App', ['globalize']);

app.config(function (globalizeProvider) {
    globalizeProvider.setCldrBasePath('../bower_components/cldr-data');
    globalizeProvider.setL10nBasePath('l10n');
});

app.run(
    [ 'globalize',
    function (globalize) {
        globalize.setLocale('en');
    } ]
);
