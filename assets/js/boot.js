//sergerusso 2018

import app from './app.js'
import ReaderCtrl from './ctrl/reader.js'
import SettingsRootCtrl from './ctrl/settings/root.js'
import rootScope from './ctrl/rootScope.js'

import './ctrl/settings/feeds.js'
import './ctrl/settings/settings.js'
import './ctrl/settings/import.js'
import './components/feed-modal.js'

app
  .config(function($routeProvider, $compileProvider, $sceDelegateProvider){

    $routeProvider.when('/reader', {templateUrl: 'views/reader/index.html', controller: ReaderCtrl})


    $routeProvider.when('/settings/', {templateUrl: 'views/settings/index.html', controller: SettingsRootCtrl})
    $routeProvider.when('/settings/:action', {templateUrl: 'views/settings/index.html', controller: SettingsRootCtrl})
    $routeProvider.when('/settings/:action/:sub', {
      templateUrl: 'views/settings/index.html',
      controller: SettingsRootCtrl
    })
    $routeProvider.otherwise({redirectTo: '/reader'})

    $sceDelegateProvider.resourceUrlWhitelist([
      // Allow same origin resource loads.
      'self',
      // Allow loading from our assets domain.  Notice the difference between * and **.
      'http://**',
      'https://**'
    ]);

    //$compileProvider.urlSanitizationWhitelist(/^\s*(https?|mailto|chrome-extension):/);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|chrome-extension):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|mailto|chrome-extension):/);


  })
  .run(function($timeout, $rootScope, $q){


    rootScope($rootScope);

    //todo permission warning

  })


angular.module('feedBundle')

angular.bootstrap(document.body, ['feedBundle']);