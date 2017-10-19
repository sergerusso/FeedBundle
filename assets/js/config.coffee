#     Developed by Serge P
# https://github.com/sergerusso

angular
  .module( 'feedBundle', ['feedBundle.directives', 'filters']) #'feedsBundle.filters'
  .config ($routeProvider, $compileProvider)->

    $routeProvider.when('/reader', {templateUrl: 'views/reader/index.html', controller: readerCtrl})

    $routeProvider.when('/settings/', {templateUrl: 'views/settings/index.html', controller: settingsRootCtrl})
    $routeProvider.when('/settings/:action', {templateUrl: 'views/settings/index.html', controller: settingsRootCtrl})
    $routeProvider.when('/settings/:action/:sub', {templateUrl: 'views/settings/index.html', controller: settingsRootCtrl})
    $routeProvider.otherwise({redirectTo: '/reader'})

    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);


  .run (Feeds, Folders, Settings, $timeout, $rootScope, $q, db)->

    updateTimer = ()->
      $timeout ()->
        console.log 'upd', Settings.update_each
        Feeds.update();
        do updateTimer
      , 1000*60* Settings.update_each
    do updateTimer


    $rootScope.Feeds = Feeds
    $rootScope.Folders = Folders

    deferred = $q.defer()

    $rootScope.loadDefer = deferred.promise

    #seed data
    seedPromise = new Promise (resolve)->

      return resolve() if localStorage.dbInit

      localStorage.dbInit = true

      Feeds.insert
        title: 'CNET News'
        url: 'https://www.cnet.com/rss/news/'
      , true
      .then -> resolve()

    seedPromise.then ->
      Promise.all([Feeds.get(), Folders.get()]).then ->
          deferred.resolve()

    #todo permission warning

