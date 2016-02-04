module.exports = function(config){
    config.set({

        basePath : '..',

        frameworks: ['jasmine'],

        browsers : ['CustomChrome'],

        plugins : [
            'karma-chrome-launcher',
            'karma-jasmine'
        ],

        customLaunchers: {
            CustomChrome: {
                base: 'Chrome',
                flags: ['--no-proxy-server']
            }
        }

    });
};
