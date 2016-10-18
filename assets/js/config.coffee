#     Developed by Serge P
# https://github.com/sergerusso

angular
  .module( 'feedBundle', ['feedBundle.directives', 'filters', 'feeds', 'storage', 'settings']) #'feedsBundle.filters'
  .config( ($routeProvider, $compileProvider)->

    $routeProvider.when('/reader', {templateUrl: 'views/reader/index.html', controller: readerCtrl})

    $routeProvider.when('/settings/', {templateUrl: 'views/settings/index.html', controller: settingsCtrl})
    $routeProvider.when('/settings/:action', {templateUrl: 'views/settings/index.html', controller: settingsCtrl})
    $routeProvider.when('/settings/:action/:sub', {templateUrl: 'views/settings/index.html', controller: settingsCtrl})
    $routeProvider.otherwise({redirectTo: '/reader'})

    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);

  )
  .run( ['Feeds','Storage', 'Settings', '$timeout', (Feeds, Storage, Settings, $timeout)->

    updateTimer = ()->
      $timeout ()->
        console.log 'upd', Settings.update_each
        Feeds.update();
        do updateTimer
      , 1000*60* Settings.update_each
    do updateTimer

    Feeds.update()


  ])
