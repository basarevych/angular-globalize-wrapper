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
    var locales = [ 'en', 'ru' ];

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

        locales.forEach(function (locale) {
            for (var i = 0; i < mainResources.length; i++) {
                var file = cldrBasePath + '/main/' + locale + '/' + mainResources[i];
                $httpBackend.expectGET(file).respond(readJSON(file));
            }
            var file = l10nBasePath + '/' + locale + '.json';
            $httpBackend.expectGET(file).respond(readJSON(file));
        });

        for (var i = 0; i < supplementalResources.length; i++) {
            var file = cldrBasePath + '/supplemental/' + supplementalResources[i];
            $httpBackend.expectGET(file).respond(readJSON(file));
        }
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('glDate filter', inject(function (glDateFilter) {
        expect(globalizeWrapper.isLoaded()).toBeFalsy();
        expect(glDateFilter(new Date(), { datetime: 'full' })).toBe('');

        globalizeWrapper.loadLocales(locales);
        $httpBackend.flush();

        expect(globalizeWrapper.isLoaded()).toBeTruthy();
        expect(glDateFilter()).toBeUndefined();
        expect(glDateFilter('')).toBeUndefined();
        expect(glDateFilter('', { datetime: 'full' })).toBe('');

        var input = new Date(), params = { datetime: 'full' };
        var gl = globalizeWrapper.getGlobalize();
        var spy = spyOn(gl, 'formatDate').and.returnValue('foobar');

        expect(glDateFilter(input, params)).toBe('foobar');
        expect(spy).toHaveBeenCalledWith(input, params);
    }));

    it('glMessage filter', inject(function (glMessageFilter) {
        expect(globalizeWrapper.isLoaded()).toBeFalsy();
        expect(glMessageFilter('SAMPLE', { arg: 'baz' })).toBe('');

        globalizeWrapper.loadLocales(locales);
        $httpBackend.flush();

        expect(globalizeWrapper.isLoaded()).toBeTruthy();
        expect(glMessageFilter()).toBeUndefined();
        expect(glMessageFilter('', { arg: 'baz' })).toBe('');

        var spy = spyOn(console, 'log').and.returnValue('foobar');
        expect(glMessageFilter('NON_EXISTING')).toBe('NON_EXISTING');
        expect(spy).toHaveBeenCalledWith('Missing translation: NON_EXISTING');

        var input = 'SAMPLE', params = { arg: 'baz' };
        var gl = globalizeWrapper.getGlobalize();
        var spy = spyOn(gl, 'formatMessage').and.returnValue('foobar');

        expect(glMessageFilter(input, params)).toBe('foobar');
        expect(spy).toHaveBeenCalledWith(input, params);
    }));

    it('glNumber filter', inject(function (glNumberFilter) {
        expect(globalizeWrapper.isLoaded()).toBeFalsy();
        expect(glNumberFilter(9000.42)).toBe('');

        globalizeWrapper.loadLocales(locales);
        $httpBackend.flush();

        expect(globalizeWrapper.isLoaded()).toBeTruthy();
        expect(glNumberFilter()).toBeUndefined();
        expect(glNumberFilter('')).toBe('');

        var input = 9000.42, params = { style: 'decimal' };
        var gl = globalizeWrapper.getGlobalize();
        var spy = spyOn(gl, 'formatNumber').and.returnValue('foobar');

        expect(glNumberFilter(input, params)).toBe('foobar');
        expect(spy).toHaveBeenCalledWith(input, params);
    }));

    it('glCurrency filter', inject(function (glCurrencyFilter) {
        expect(globalizeWrapper.isLoaded()).toBeFalsy();
        expect(glCurrencyFilter(9000.42, 'USD')).toBe('');

        globalizeWrapper.loadLocales(locales);
        $httpBackend.flush();

        expect(globalizeWrapper.isLoaded()).toBeTruthy();
        expect(glCurrencyFilter()).toBeUndefined();
        expect(glCurrencyFilter(9000.42)).toBeUndefined();
        expect(glCurrencyFilter('', 'USD')).toBe('');

        var input = 9000.42, currency = 'USD', params = { style: 'symbol' };
        var gl = globalizeWrapper.getGlobalize();
        var spy = spyOn(gl, 'formatCurrency').and.returnValue('foobar');

        expect(glCurrencyFilter(input, currency, params)).toBe('foobar');
        expect(spy).toHaveBeenCalledWith(input, currency, params);
    }));

});
