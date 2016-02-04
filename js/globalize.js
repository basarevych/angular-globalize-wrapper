'use strict';

var glModule = angular.module('globalizeWrapper', []);

glModule.provider('globalizeWrapper', function () {
    var cldrBasePath = 'bower_components/cldr-data';
    var l10nBasePath = 'l10n';
    var mainResources = [
        'currencies.json',
        'ca-gregorian.json',
        'timeZoneNames.json',
        'numbers.json'
    ];
    var supplementalResources = [
        'currencyData.json',
        'likelySubtags.json',
        'plurals.json',
        'timeData.json',
        'weekData.json'
    ];
 
    this.$get = [ '$q', '$http', '$rootScope', function ($q, $http, $rootScope) {
        var globalizeInstances = {}, currentLocale = null;
        var locales, data = {}, messages = {};
        var dataLoaded = false, messagesLoaded = false;

        function isLoaded() {
            return (dataLoaded && messagesLoaded);
        };

        function loadLocales(allLocales) {
            locales = allLocales;

            var dataPromises = [], messagesPromises = [];
            locales.forEach(function (locale) {
                for (var i = 0; i < mainResources.length; i++)
                    dataPromises.push($http.get(cldrBasePath + '/main/' + locale + '/' + mainResources[i]));
                messagesPromises.push($http.get(l10nBasePath + '/' + locale + '.json'));
            });
            for (var i = 0; i < supplementalResources.length; i++)
                dataPromises.push($http.get(cldrBasePath + '/supplemental/' + supplementalResources[i]));

            $q.all(dataPromises)
                .then(function (result) {
                    result.forEach(function (file) {
                        angular.merge(data, file.data);
                    });
                    dataLoaded = true;
                    finish();
                })
                .catch(function () {
                    $rootScope.$broadcast('GlobalizeLoadError');
                });

            $q.all(messagesPromises)
                .then(function (result) {
                    result.forEach(function (file) {
                        angular.merge(messages, file.data);
                    });
                    messagesLoaded = true;
                    finish();
                })
                .catch(function () {
                    $rootScope.$broadcast('GlobalizeLoadError');
                });
        }

        function finish() {
            if (!isLoaded())
                return;

            Globalize.load(data);
            Globalize.loadMessages(messages);

            locales.forEach(function (locale) {
                globalizeInstances[locale] = Globalize(locale);
            });

            $rootScope.$broadcast('GlobalizeLoadSuccess');

            setLocale(locales[0]);
        };

        function setLocale(locale) {
            currentLocale = locale;
            $rootScope.$broadcast('GlobalizeLocaleChanged');
        };

        return {
            isLoaded: isLoaded,
            setLocale: setLocale,
            getLocale: function () { return currentLocale; },
            loadLocales: loadLocales,
            getGlobalize: function (locale) {
                if (!locale)
                    locale = currentLocale;
                return globalizeInstances[locale];
            },
            hasMessage: function (path, locale) {
                if (!locale)
                    locale = currentLocale;
                return typeof messages[locale][path] != 'undefined';
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
        return function (input, params, locale) {
            if (angular.isUndefined(input) || angular.isUndefined(params))
                return undefined;
            if (input.length == 0 || !globalizeWrapper.isLoaded())
                return '';

            var gl = globalizeWrapper.getGlobalize(locale);
            return gl ? gl.formatDate(input, params) : input;
         };
    } ]
);

glModule.filter('glMessage',
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        return function (input) {
            if (angular.isUndefined(input))
                return undefined;
            if (input.length == 0 || !globalizeWrapper.isLoaded())
                return '';
            if (!globalizeWrapper.hasMessage(input)) {
                console.log('Missing translation: ' + input);
                return input;
            }

            var params, locale;
            if (arguments.length >= 3) {
                params = arguments[1];
                locale = arguments[2];
            } else if (arguments.length == 2) {
                if (typeof arguments[1] == 'object')
                    params = arguments[1];
                else
                    locale = arguments[1];
            }

            var gl = globalizeWrapper.getGlobalize(locale);
            return gl ? gl.formatMessage(input, params) : input;
         };
    } ]
);

glModule.filter('glNumber',
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        return function (input) {
            if (angular.isUndefined(input))
                return undefined;
            if (input.length == 0 || !globalizeWrapper.isLoaded())
                return '';

            var params, locale;
            if (arguments.length >= 3) {
                params = arguments[1];
                locale = arguments[2];
            } else if (arguments.length == 2) {
                if (typeof arguments[1] == 'object')
                    params = arguments[1];
                else
                    locale = arguments[1];
            }

            var gl = globalizeWrapper.getGlobalize(locale);
            return gl ? gl.formatNumber(input, params) : input;
         };
    } ]
);

glModule.filter('glCurrency',
    [ 'globalizeWrapper',
    function (globalizeWrapper) {
        return function (input, currency) {
            if (angular.isUndefined(input) || angular.isUndefined(currency))
                return undefined;
            if (input.length == 0 || !globalizeWrapper.isLoaded())
                return '';

            var params, locale;
            if (arguments.length >= 4) {
                params = arguments[2];
                locale = arguments[3];
            } else if (arguments.length == 3) {
                if (typeof arguments[2] == 'object')
                    params = arguments[2];
                else
                    locale = arguments[2];
            }

            var gl = globalizeWrapper.getGlobalize(locale);
            return gl ? gl.formatCurrency(input, currency, params) : input;
         };
    } ]
);
