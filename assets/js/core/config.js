//sergerusso 2018

import ReaderCtrl from '../ctrl/reader.js'
import SettingsRootCtrl from '../ctrl/settings/root.js'

export default function($routeProvider, $compileProvider, $sceDelegateProvider){

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


}