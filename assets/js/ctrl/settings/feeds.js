// Created by Serge P <contact@sergerusso.com> on 10/19/16.
import app from '../../core/ng-module.js'

import Folders from '../../model/folder/folders.js'
import Settings from '../../model/settings.js'
import Feed from '../../model/feed/feed.js'
import Feeds from '../../model/feed/feeds.js'

app.controller('settingsFeedsCtrl', function($scope, $routeParams, $location, $rootScope ){

  $scope.search = ""

  $scope.selectedFolder = Folders.getByName('All feeds')
  $scope.setFolder = (folder) => $scope.selectedFolder = folder

  $scope.getFeeds = () => {

    let items = $scope.selectedFolder.getFeeds()

    if (!$scope.search) return items;

    return items.filter( i => (
      i.title.toLowerCase().includes($scope.search.toLowerCase())
    ))
  }


  $scope.remove = (feed) => {
    //permission.remove(feed.url) //todo only if ther is no such
    Feeds.remove(feed)
  }


})

export default app
