window.readerCtrl = ($scope, Settings, Folders, db, Feeds)->
  window.scp = $scope;

  $scope.db = db
  $scope.Folders = Folders

  $scope.Settings = Settings

  $scope.sidebar_expanded = true

  $scope.feedItem = null

  $scope.loadDefer.then ->
    $scope.selectedFolder = Folders.getById Settings.folder

  $scope.getFolderClass = (folder)->
    selected: $scope.selectedFolder is folder

  $scope.selectFolder = (folder)->
    $scope.selectedFolder = folder
    Settings.set("folder", folder.id)

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

  $scope.toggleFeed = (feed) ->
    feed.expanded = !feed.expanded

    #detect double click
    feed.markRead() if (new Date()).getTime() - ($scope._toggleFeedClick || 0) < 250
    $scope._toggleFeedClick = (new Date()).getTime()
      

    



