window.readerCtrl = ($scope, Settings, Folders)->
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
    #todo refactor
    setTimeout -> $("#editFolder_"+folder.id).focus()

  $scope.saveFolderName = (folder)->
    folder.setName folder.newName
    delete folder.newName
    folder.editing = false

  $scope.showFeedItem = (item, feed)->
    feed.markRead(item)
    $scope.feedItem = item

  $scope.isActiveFeedItem = (item)->
    $scope.feedItem?.url == item.url

  $scope.collapseAll = ->
    $.each Feeds.items, ()->
      delete @expanded

  $scope.toggleFeed = (feed) ->
    feed.expanded = !feed.expanded

  $scope.markRead = (feed)->
    feed.markRead()

  $scope.toggleBookmark = (feed, item) ->
    feed.toggleMark(item)

    #todo prevent item disappearing
    #if $scope.selectedFolder.isBookmarks and !item.marked
  $scope.removeFolder = (folder)->
    toSelect = Folders.getById if folder.getFeeds().length then 'unsorted' else 'all'
    Folders.remove(folder)
    if $scope.selectedFolder == folder
      $scope.selectFolder toSelect

  $scope.$watch ->
    Folders.getById('all').unreadCount()
  , (unread,b)->

    unread = "" if unread is 0
    setBadgetText(unread.toString())


      

    



