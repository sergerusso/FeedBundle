//sergerusso 2018

import ReaderCtrl from './ctrl/reader.js'
import SettingsRootCtrl from './ctrl/settings/root.js'

import SettingsFeedsCtrl from './ctrl/settings/feeds.js'
import SettingsCtrl from './ctrl/settings/settings.js'
import settingsImportCtrl from './ctrl/settings/import.js'

import Feeds from './model/feed/feeds.js'
import Feed from './model/feed/feed.js'
import Folders from './model/folder/folders.js'
import Settings from './model/settings.js'
import db from './db.js'

import directives from './directives.js'


angular
  .module( 'feedBundle', ['feedBundle.directives']) //'feedsBundle.filters'
  .config(function($routeProvider, $compileProvider){

    $routeProvider.when('/reader', {templateUrl: 'views/reader/index.html', controller: ReaderCtrl})


    $routeProvider.when('/settings/', {templateUrl: 'views/settings/index.html', controller: SettingsRootCtrl})
    $routeProvider.when('/settings/:action', {templateUrl: 'views/settings/index.html', controller: SettingsRootCtrl})
    $routeProvider.when('/settings/:action/:sub', {
      templateUrl: 'views/settings/index.html',
      controller: SettingsRootCtrl
    })
    $routeProvider.otherwise({redirectTo: '/reader'})

    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|mailto|chrome-extension):/);


  }).run(function($timeout, $rootScope, $q){


    const updateTimer = () => {
      $timeout(() => {
        console.log('upd', Settings.updateEach)
        Feeds.update();
        updateTimer()
      }, 1000 * 60 * Settings.updateEach)
    }

    window.db = db;


    $rootScope.Feeds = Feeds
    $rootScope.Folders = Folders
    $rootScope.Settings = Settings



    $rootScope.loadDefer = new Promise( resolve => {

      Promise.all([Feeds.fetch(), Folders.fetch(), Settings.fetch()]).then(() => {

        resolve()

        updateTimer();

      })

    })




    document.addEventListener('feedUpdated', () => $rootScope.$apply())
    //todo permission warning

  })


angular.module('feedBundle')

angular.bootstrap(document.body, ['feedBundle']);