'use strict';

describe('GlobalizeWrapper', function() {

    var globalizeWrapper, $rootScope, $httpBackend;

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
    var l10nResources = {
        en: 'en.json',
        ru: 'ru.json',
    };

    beforeEach(function (){
        angular.mock.module('globalizeWrapper', function (globalizeWrapperProvider) {
            globalizeWrapperProvider.setCldrBasePath(cldrBasePath);
            globalizeWrapperProvider.setL10nBasePath(l10nBasePath);
            globalizeWrapperProvider.setMainResources(mainResources);
            globalizeWrapperProvider.setSupplementalResources(supplementalResources);
        });
    });

    beforeEach(inject(function (_globalizeWrapper_, _$rootScope_, _$httpBackend_) {
        globalizeWrapper = _globalizeWrapper_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('is switching locales', function () {
        var spy = spyOn($rootScope, '$broadcast').and.callThrough();

        for (var i = 0; i < supplementalResources.length; i++) {
            var file = cldrBasePath + '/supplemental/' + supplementalResources[i];
            $httpBackend.expectGET(file).respond(readJSON(file));
        }

        for (var i = 0; i < mainResources.length; i++) {
            var file = cldrBasePath + '/main/en/' + mainResources[i];
            $httpBackend.expectGET(file).respond(readJSON(file));
        }

        var file = l10nBasePath + '/' + l10nResources['en'];
        $httpBackend.expectGET(file).respond(readJSON(file));

        expect(globalizeWrapper.isLoaded()).toBeFalsy();

        // Switch to EN and download everything
        globalizeWrapper.setLocale('en');
        $httpBackend.flush();

        expect(spy).toHaveBeenCalledWith('GlobalizeLoadSuccess');
        expect(globalizeWrapper.isLoaded()).toBeTruthy();
        expect(globalizeWrapper.getLocale()).toBe('en');
        expect(globalizeWrapper.getGlobalize()).not.toBe(null);

        for (var i = 0; i < mainResources.length; i++) {
            var file = cldrBasePath + '/main/ru/' + mainResources[i];
            $httpBackend.expectGET(file).respond(readJSON(file));
        }

        var file = l10nBasePath + '/' + l10nResources['ru'];
        $httpBackend.expectGET(file).respond(readJSON(file));

        // Switch to RU and download new /main/ resources only
        globalizeWrapper.setLocale('ru');
        $httpBackend.flush();

        expect(spy).toHaveBeenCalledWith('GlobalizeLoadSuccess');
        expect(globalizeWrapper.isLoaded()).toBeTruthy();
        expect(globalizeWrapper.getLocale()).toBe('ru');
        expect(globalizeWrapper.getGlobalize()).not.toBe(null);

        // Switch back to cached EN - no downloads
        globalizeWrapper.setLocale('en');

        expect(spy).toHaveBeenCalledWith('GlobalizeLoadSuccess');
        expect(globalizeWrapper.isLoaded()).toBeTruthy();
        expect(globalizeWrapper.getLocale()).toBe('en');
        expect(globalizeWrapper.getGlobalize()).not.toBe(null);
    });

});
