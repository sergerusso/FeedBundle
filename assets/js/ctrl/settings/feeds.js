// Created by Serge P <contact@sergerusso.com> on 10/19/16.

import Folders from '../../model/folder/folders.js'
import Settings from '../../model/settings.js'
import Feed from '../../model/feed/feed.js'
import Feeds from '../../model/feed/feeds.js'



window.settingsFeedsCtrl = function($scope, $routeParams, $location, $rootScope ){

  $scope.modal = {
    feed: {
      step: null,
      new_feed_url: '',
      item: null,
    },
    edited_folder: false,
  }

  $scope.search = ""

  $scope.selectedFolder = Folders.getByName('All feeds')
  $scope.setFolder = (folder) => $scope.selectedFolder = folder

  $scope.getFeeds = () => {

    let items = $scope.selectedFolder.getFeeds()

    if (!$scope.search) return items
    _.filter(items, (i) => {
      i.title.toLowerCase().indexOf($scope.search.toLowerCase()) > -1
    })
  }


  //todo move from here
  $scope.showAddFeedModal = () => {
    $scope.modal.feed.step = "add";
    $scope.modal.feed.new_feed_url = '';

    $("#feedModal").modal('show').off('hidden.bs.modal')
      .one('shown.bs.modal', () => $(this).find("[ng-autofocus]").focus())
      .on('hidden.bs.modal', () => {
        $scope.$apply(() => {
          $location.path($routeParams.sub == 'return' ? "/reader/" : "/settings/");
        })
      })
  }


  const preserveFeedData = (feed) => {
    feed._title = feed.title
    feed._url = feed.url
    feed._folderId = feed.folderId
  }

  $scope.addFeed = (e) => {

    e.preventDefault()


    let url = $scope.modal.feed.new_feed_url

    if (!url || $scope.modal.processing) return false;

    requestPermission(url).then(() => {


      $scope.modal.processing = true
      let feed = new Feed({url})

      const callback = (data) => {

        delete  $scope.modal.processing

        //console.log data
        if (data.error && data.resp) {
          //try to find url
          let $html = $("<div></div>").append($.parseHTML(data.resp)),
            url = $html.find('link[type="application/rss+xml"],link[type="application/atom+xml"]').attr('href');

          if (!url) {
            callback({error: true})
            return;
          }
          feed.url = url;
          feed.getXML(callback);
          return;
        }

        if (data.error) {
          return $scope.modal.feed.step = "error"
        }


        Feeds.insert(data).then( feed => {
          //todo check

          preserveFeedData(feed)

          $scope.modal.feed.item = feed
          if(!Folders.getById(Settings.folder).isSystem) {
            feed._folderId = Settings.folder;
          }
          $scope.modal.feed.step = "edit"

          $scope.$apply();
        })
      }


      feed.getXML(callback)
    }).catch((e) => {
      console.error(e)
      $scope.$apply(() => $scope.modal.feed.step = "error")
    })

    return false;
  }


  $scope.editFeed = (feed) => {
    $scope.modal.feed.step = "edit"
    $scope.modal.feed.item = feed

    preserveFeedData(feed)

    $("#feedModal").modal('show').off('hidden.bs.modal').on('hidden.bs.modal', () => {
      $scope.$apply(() => {
        if ($routeParams.action == 'edit') {
          $location.path("/")
        }
      })
    })
  }

  $scope.saveFeed = () => {
    let item = $scope.modal.feed.item
    item.setTitle(item._title)
    item.setUrl(item._url)
    item.setFolderId(item._folderId)

    if (item.url != item._url) {
      removePermission(item.url)
      requestPermission(item._url)
    }

    Settings.set("folder", item._folderId);
  }


  $scope.editingFolder = {}

  $scope.editFolder = (folder) => {
    folder._name = folder.name
    $scope.editingFolder = folder
    $("#editFolderInput").focus()
  }

  $scope.updateFolder = () => {
    if ($scope.editingFolder._name) {
      if ($scope.editingFolder.id) {
        $scope.editingFolder.setName($scope.editingFolder._name)
      } else {
        Folders.add($scope.editingFolder._name)
          .then((folder) => {
            $scope.modal.feed.item._folderId = folder.id
            $scope.$apply()
          })
      }
    }

    $scope.editingFolder = {}
  }

  $scope.removeFolder = (folder) => {
    if ($scope.modal.feed.item._folderId == folder.id) {
      $scope.modal.feed.item._folderId = 'unsorted'
    }
    Folders.remove(folder)
  }

  $scope.remove = (feed) => {
    removePermission(feed.url)
    Feeds.remove(feed)
  }


  //routing
  if ($routeParams.action == 'new') {
    $scope.showAddFeedModal()
  }

  if ($routeParams.action == 'edit' && $routeParams.sub) {

    $rootScope.loadDefer.then(() => {
      let item = Feeds.getById($routeParams.sub)

      if (!item) return;
      $scope.editFeed(item)
      $scope.$apply()
    })
  }

}

export default angular
