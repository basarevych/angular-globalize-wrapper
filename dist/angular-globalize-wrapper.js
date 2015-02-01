/* angular-globalize-wrapper - v0.0.1 - 2015-02-01
   Copyright (c) 2015 Ross Basarevych; Licensed MIT */

'use strict';

var glModule = angular.module('globalize', []);

glModule.provider('globalize', function () {
    var cldrBasePath = 'bower_components/cldr-data';
    var l10nBasePath = 'l10n';

    this.$get = [ '$q', '$http', '$rootScope', function ($q, $http, $rootScope) {
        var globalize = null, currentLocale = null;
        var mainLoaded = false, supplementalLoaded = false;
        var currencyData, likelySubtags, plurals, timeData, weekData;
        var currencies, caGregorian, numbers, messages;

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
                $http.get(cldrBasePath + '/main/' + locale + '/numbers.json'),
                $http.get(l10nBasePath + '/' + locale + '.json'),
            ]).then(function (results) {
                currencies = results[0].data;
                caGregorian = results[1].data;
                numbers = results[2].data;
                messages = results[3].data;

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
