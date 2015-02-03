'use strict';

describe('GlobalizeWrapper', function() {

    var globalizeWrapper, $httpBackend;

    beforeEach(function (){
        angular.mock.module('globalizeWrapper', function (globalizeWrapperProvider) {
            globalizeWrapperProvider.setCldrBasePath('bower_components/cldr-data');
            globalizeWrapperProvider.setL10nBasePath('demo/l10n');
            globalizeWrapperProvider.setMainResources([]);
            globalizeWrapperProvider.setSupplementalResources([]);
        });
    });

    beforeEach(inject(function (_globalizeWrapper_) {
        globalizeWrapper = _globalizeWrapper_;
        globalizeWrapper.setLocale('en');
    }));

/*
        beforeEach(inject(function (_$httpBackend_) {
            $httpBackend = _$httpBackend_;

//            $httpBackend.expectGET('l10n/en.json')
//                .respond({ });

            $httpBackend.flush();
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
*/
    it('is loaded', function (done) {
        expect(globalizeWrapper.isLoaded()).toBeTruthy();
        done();
    });

});
