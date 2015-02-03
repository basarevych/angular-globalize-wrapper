/* angular-globalize-wrapper - v0.1.0 - 2015-02-03
   Copyright (c) 2015 Ross Basarevych; Licensed MIT */

'use strict';

var glModule = angular.module('globalizeWrapper', []);

glModule.provider('globalizeWrapper', function () {
    var cldrBasePath = 'bower_components/cldr-data';
    var l10nBasePath = 'l10n';
    var mainResources = [
        '/currencies.json',
        '/ca-gregorian.json',
        '/timeZoneNames.json',
        '/numbers.json'
    ];
    var supplementalResources = [
        '/currencyData.json',
        '/likelySubtags.json',
        '/plurals.json',
        '/timeData.json',
        '/weekData.json'
    ];
 
    this.$get = [ '$q', '$http', '$rootScope', function ($q, $http, $rootScope) {
        var globalizeInstances = {}, currentLocale = null, localeChanged = false;
        var mainLoaded = false, supplementalLoaded = false, messagesLoaded = false;
        var mainData = [], supplementalData = [], messagesData = {};

        loadResources(
            cldrBasePath + '/supplemental',
            supplementalResources,
            function (results) {
                for (var i = 0; i < results.length; i++)
                    supplementalData.push(results[i].data);
                supplementalLoaded = true;
                finishLoading();
            }
        );

        function loadResources(basePath, resources, success) {
            var promises = [];
            for (var i = 0; i < resources.length; i++)
                promises.push($http.get(basePath + '/' + resources[i]));

            $q.all(promises)
                .then(success)
                .catch(function () {
                    $rootScope.$broadcast('GlobalizeLoadError');
                });
        };

        function isLoaded() {
            return (mainLoaded && supplementalLoaded && messagesLoaded);
        };

        function setLocale(locale) {
            if (currentLocale == locale)
                return;

            localeChanged = false;
            currentLocale = locale;

            if (typeof globalizeInstances[currentLocale] != 'undefined') {
                finishLoading();
                return;
            }

            mainLoaded = false;
            loadResources(
                cldrBasePath + '/main/' + currentLocale,
                mainResources,
                function (results) {
                    mainData = [];
                    for (var i = 0; i < results.length; i++)
                        mainData.push(results[i].data);
                    mainLoaded = true;
                    finishLoading();
                }
            );

            messagesLoaded = false;
            $http.get(l10nBasePath + '/' + currentLocale + '.json')
                .then(function (result) {
                    messagesData = result.data;
                    messagesLoaded = true;
                    finishLoading();
                });
        };

        function finishLoading() {
            if (!isLoaded() || localeChanged)
                return;

            localeChanged = true;

            if (typeof globalizeInstances[currentLocale] == 'undefined') {
                var instance = null;
                var data = mainData.concat(supplementalData);
                if (data.length) {
                    Globalize.load(data);
                    Globalize.loadMessages(messagesData);
                    
                    instance = Globalize(currentLocale);

                    messagesData = messagesData[currentLocale];
                }

                globalizeInstances[currentLocale] = instance;
            }

            $rootScope.$broadcast('GlobalizeLoadSuccess');
        };

        return {
            isLoaded: isLoaded,
            setLocale: setLocale,
            getLocale: function () { return currentLocale; },
            getGlobalize: function () { return globalizeInstances[currentLocale]; },
            hasMessage: function (path) {
                return typeof messagesData[path] != 'undefined';
            },
        };
    } ];

    this.setCldrBasePath = function (path) {
        cldrBasePath = path;
    };

    this.setL10nBasePath = function (path) {
        l10nBasePath = path;
    };

    this.setMainResources = function (resources) {
        mainResources = resources;
    };

    this.setSupplementalResources = function (resources) {
        supplementalResources = resources;
    };
});

glModule.filter('glDate',
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        return function (input, params) {
            if (angular.isUndefined(input) || angular.isUndefined(params))
                return undefined;
            if (input.length == 0 || !globalizeWrapper.isLoaded())
                return '';

            var gl = globalizeWrapper.getGlobalize();
            return gl ? gl.formatDate(input, params) : input;
         };
    } ]
);

glModule.filter('glMessage',
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        return function (input, params) {
            if (angular.isUndefined(input))
                return undefined;
            if (input.length == 0 || !globalizeWrapper.isLoaded())
                return '';
            if (!globalizeWrapper.hasMessage(input)) {
                console.log('Missing translation: ' + input);
                return input;
            }

            var gl = globalizeWrapper.getGlobalize();
            return gl ? gl.formatMessage(input, params) : input;
         };
    } ]
);

glModule.filter('glNumber',
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        return function (input, params) {
            if (angular.isUndefined(input))
                return undefined;
            if (input.length == 0 || !globalizeWrapper.isLoaded())
                return '';

            var gl = globalizeWrapper.getGlobalize();
            return gl ? gl.formatNumber(input, params) : input;
         };
    } ]
);

glModule.filter('glCurrency',
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        return function (input, currency, params) {
            if (angular.isUndefined(input) || angular.isUndefined(currency))
                return undefined;
            if (input.length == 0 || !globalizeWrapper.isLoaded())
                return '';

            var gl = globalizeWrapper.getGlobalize();
            return gl ? gl.formatCurrency(input, currency, params) : input;
         };
    } ]
);
