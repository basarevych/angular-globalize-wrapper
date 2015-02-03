'use strict';

describe('GlobalizeWrapper', function() {

    var globalizeWrapper, $httpBackend;

    var cldrBasePath = 'bower_components/cldr-data';
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

    var l10nBasePath = 'demo/l10n';
    var l10nResources = [
        'en.json',
        'ru.json',
    ];

    beforeEach(function (){
        angular.mock.module('globalizeWrapper', function (globalizeWrapperProvider) {
            globalizeWrapperProvider.setCldrBasePath(cldrBasePath);
            globalizeWrapperProvider.setL10nBasePath(l10nBasePath);
            globalizeWrapperProvider.setMainResources(mainResources);
            globalizeWrapperProvider.setSupplementalResources(supplementalResources);
        });
    });

    beforeEach(inject(function (_globalizeWrapper_) {
        globalizeWrapper = _globalizeWrapper_;
    }));

    beforeEach(inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;

        for (var i = 0; i < mainResources.length; i++) {
            var file = cldrBasePath + '/main/en/' + mainResources[i];
            $httpBackend.whenGET(file).respond(readJSON(file));
            var file = cldrBasePath + '/main/ru/' + mainResources[i];
            $httpBackend.whenGET(file).respond(readJSON(file));
        }

        for (var i = 0; i < supplementalResources.length; i++) {
            var file = cldrBasePath + '/supplemental/' + supplementalResources[i];
            $httpBackend.whenGET(file).respond(readJSON(file));
        }

        for (var i = 0; i < l10nResources.length; i++) {
            var file = l10nBasePath + '/' + l10nResources[i];
            $httpBackend.whenGET(file).respond(readJSON(file));
        }
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('is loaded', function (done) {
        globalizeWrapper.setLocale('en');
        $httpBackend.flush();
        expect(globalizeWrapper.isLoaded()).toBeTruthy();
        done();
    });

});
