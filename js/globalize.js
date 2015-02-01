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
        var globalize = null, currentLocale = null;
        var mainLoaded = false, supplementalLoaded = false, messagesLoaded = false;
        var mainData = [], supplementalData = [], messagesData = [];

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
            currentLocale = locale;

            mainLoaded = false;
            loadResources(
                cldrBasePath + '/main/' + locale,
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
            $http.get(l10nBasePath + '/' + locale + '.json')
                .then(function (result) {
                    messagesData = result.data;
                    messagesLoaded = true;
                    finishLoading();
                });
        };

        function finishLoading() {
            if (!isLoaded())
                return;

            Globalize.load(mainData.concat(supplementalData));
            Globalize.loadMessages(messagesData);

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
            if (input.length == 0 || !globalizeWrapper.isLoaded())
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
            if (input.length == 0 || !globalizeWrapper.isLoaded())
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
            if (input.length == 0 || !globalizeWrapper.isLoaded())
                return '';

            var gl = globalizeWrapper.getGlobalize();
            return gl.formatCurrency(input, currency, params);
         };
    } ]
);
