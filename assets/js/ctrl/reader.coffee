window.readerCtrl = ($scope, Settings, Folders, db, Feeds)->
  window.scp = $scope;

  $scope.db = db
  $scope.Folders = Folders

  $scope.Settings = Settings

  $scope.sidebar_expanded = true

  $scope.feedItem = null


  $scope.editFolder = (folder)->
    folder.newName = folder.name
    folder.editing = true

  $scope.saveFolderName = (folder)->
    folder.setName folder.newName
    delete folder.newName
    folder.editing = false

  $scope.showFeedItem = (item, feed)->
    feed.markRead(item)
    $scope.feedItem = item

  $scope.isActiveFeedItem = (item)->
    $scope.feedItem == item


  $scope.collapseAll = ->
    $.each Feeds.items, ()->
      delete @expanded



