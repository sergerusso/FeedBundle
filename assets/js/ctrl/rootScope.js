//sergerusso 2018

import Feeds from '../model/feed/feeds.js'
import Folders from '../model/folder/folders.js'
import Settings from '../model/settings.js'
import db from '../db.js'

export default ($scope)=>{

  window.db = db;


  $scope.Feeds = Feeds
  $scope.Folders = Folders
  $scope.Settings = Settings

  $scope.feedModal = {
    step: null,
    new_feed_url: '',
    item: null,
  }
  
  $scope.addFeed = ()=>{
    $scope.feedModal = {
      step: 'add',
      new_feed_url: '',
      item: null,
    }
  }
  $scope.editFeed = (feed)=>{

    $scope.feedModal = {
      step: 'edit',
      item: feed,
      fields:_.pick(feed, ['title', 'url', 'folderId'])
    }
    console.log($scope.feedModal)
  }



  $scope.loadDefer = new Promise( resolve => {

    Promise.all([Feeds.fetch(), Folders.fetch(), Settings.fetch()]).then(() => {

      resolve()

      const updateTimer = () => {
        setTimeout(() => {
          console.log('upd', Settings.updateEach)
          Feeds.update();
          updateTimer()
        }, 1000 * 60 * Settings.updateEach)
      }

      updateTimer();

    })

  })


  document.addEventListener('feedUpdated', () => $scope.$apply())

  return $scope;
}