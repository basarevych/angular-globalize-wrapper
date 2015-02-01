/* angular-globalize-wrapper - v0.0.1 - 2015-02-01
   Copyright (c) 2015 Ross Basarevych; Licensed MIT */

'use strict';

var glModule = angular.module('globalizeWrapper', []);

glModule.provider('globalizeWrapper', function () {
    var cldrBasePath = 'bower_components/cldr-data';
    var l10nBasePath = 'l10n';

    this.$get = [ '$q', '$http', '$rootScope', function ($q, $http, $rootScope) {
        var globalize = null, currentLocale = null;
        var mainLoaded = false, supplementalLoaded = false;
        var currencyData, likelySubtags, plurals, timeData, weekData;
        var currencies, caGregorian, timeZoneNames, numbers, messages;

        $q.all([
            $http.get(cldrBasePath + '/supplemental/currencyData.json'),
            $http.get(cldrBasePath + '/supplemental/likelySubtags.json'),
            $http.get(cldrBasePath + '/supplemental/plurals.json'),
            $http.get(cldrBasePath + '/supplemental/timeData.json'),
            $http.get(cldrBasePath + '/supplemental/weekData.json'),
        ]).then(function (results) {
            currencyData = results[0].data;
            likelySubtags = results[1].data;
            plurals = results[2].data;
            timeData = results[3].data;
            weekData = results[4].data;

            supplementalLoaded = true;
            finishLoading();
        }).catch(function () {
            $rootScope.$broadcast('GlobalizeLoadError');
        });

        function isLoaded() {
            return (mainLoaded && supplementalLoaded);
        };

        function setLocale(locale) {
            $q.all([
                $http.get(cldrBasePath + '/main/' + locale + '/currencies.json'),
                $http.get(cldrBasePath + '/main/' + locale + '/ca-gregorian.json'),
                $http.get(cldrBasePath + '/main/' + locale + '/timeZoneNames.json'),
                $http.get(cldrBasePath + '/main/' + locale + '/numbers.json'),
                $http.get(l10nBasePath + '/' + locale + '.json'),
            ]).then(function (results) {
                currencies = results[0].data;
                caGregorian = results[1].data;
                timeZoneNames = results[2].data;
                numbers = results[3].data;
                messages = results[4].data;

                currentLocale = locale;
                mainLoaded = true;
                finishLoading();
            }).catch(function () {
                $rootScope.$broadcast('GlobalizeLoadError');
            });
        };

        function finishLoading() {
            if (!isLoaded())
                return;

            Globalize.load(
                currencies,
                caGregorian,
                timeZoneNames,
                numbers,
                currencyData,
                likelySubtags,
                plurals,
                timeData,
                weekData
            );
            Globalize.loadMessages(messages);

            globalize = Globalize(currentLocale);

            $rootScope.$broadcast('GlobalizeLoadSuccess');
        };

        return {
            isLoaded: isLoaded,
            setLocale: setLocale,
            getLocale: function () { return currentLocale; },
            getGlobalize: function () { return globalize; },
        };
    } ];

    this.setCldrBasePath = function (path) {
        cldrBasePath = path;
    };

    this.setL10nBasePath = function (path) {
        l10nBasePath = path;
    };
});

glModule.filter('glDate',
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        return function (input, params) {
            if (angular.isUndefined(input) || angular.isUndefined(params))
                return undefined;
            if (input.length == 0)
                return '';

            var gl = globalizeWrapper.getGlobalize();
            return gl.formatDate(input, params);
         };
    } ]
);

glModule.filter('glMessage',
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        return function (input, params) {
            if (angular.isUndefined(input))
                return undefined;
            if (input.length == 0)
                return '';

            var gl = globalizeWrapper.getGlobalize();
            return gl.formatMessage(input, params);
         };
    } ]
);

glModule.filter('glNumber',
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        return function (input, params) {
            if (angular.isUndefined(input))
                return undefined;
            if (input.length == 0)
                return '';

            var gl = globalizeWrapper.getGlobalize();
            return gl.formatNumber(input, params);
         };
    } ]
);

glModule.filter('glCurrency',
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        return function (input, currency, params) {
            if (angular.isUndefined(input) || angular.isUndefined(currency))
                return undefined;
            if (input.length == 0)
                return '';

            var gl = globalizeWrapper.getGlobalize();
            return gl.formatCurrency(input, currency, params);
         };
    } ]
);
