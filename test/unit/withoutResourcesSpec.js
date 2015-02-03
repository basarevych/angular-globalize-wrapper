'use strict';

describe('GlobalizeWrapper', function() {

    var globalizeWrapper, $rootScope, $httpBackend;

    beforeEach(function (){
        angular.mock.module('globalizeWrapper', function (globalizeWrapperProvider) {
            globalizeWrapperProvider.setL10nBasePath('l10n');
            globalizeWrapperProvider.setMainResources([]);
            globalizeWrapperProvider.setSupplementalResources([]);
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


    it('works without resources', function () {
        var spy = spyOn($rootScope, '$broadcast').and.callThrough();

        $httpBackend.expectGET('l10n/en.json').respond({});

        expect(globalizeWrapper.isLoaded()).toBeFalsy();

        globalizeWrapper.setLocale('en');
        $httpBackend.flush();

        expect(spy).toHaveBeenCalledWith('GlobalizeLoadSuccess');
        expect(globalizeWrapper.isLoaded()).toBeTruthy();
        expect(globalizeWrapper.getLocale()).toBe('en');
        expect(globalizeWrapper.getGlobalize()).toBe(null);
    });

});
