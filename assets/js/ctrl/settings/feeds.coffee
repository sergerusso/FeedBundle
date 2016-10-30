# Created by Serge P <contact@sergerusso.com> on 10/19/16.

angular.module('feedBundle').controller 'settingsFeedsCtrl', ($scope, Feeds, Feed, Folders, $routeParams, $location, Settings, $rootScope )->

  $scope.modal =
    feed:
      step: null
      new_feed_url: ''
      item: null
    edited_folder: false

  $scope.search = ""

  $scope.selectedFolder = Folders.getByName('All feeds')
  $scope.setFolder = (folder)-> $scope.selectedFolder = folder

  $scope.getFeeds = ->

    items = $scope.selectedFolder.getFeeds()

    return items unless $scope.search
    _.filter items, (i)->
      i.title.toLowerCase().indexOf($scope.search.toLowerCase()) > -1


  $scope.showAddFeedModal = ->
    $scope.modal.feed.step = "add"
    $scope.modal.feed.new_feed_url = ''

    $("#feedModal").modal('show').off('hidden.bs.modal')
    .one 'shown.bs.modal', -> $(this).find("[ng-autofocus]").focus()
    .on 'hidden.bs.modal', ()->
      $scope.$apply ()->
        $location.path( if $routeParams.sub == 'return' then "/reader/" else "/settings/" )  ;


  preserveFeedData = (feed)->
    feed._title = feed.title
    feed._url = feed.url
    feed._folderId = feed.folderId

  $scope.addFeed = (e)->
    url = $scope.modal.feed.new_feed_url

    return if !url or $scope.modal.processing

    $scope.modal.processing = true
    feed = new Feed url: url

    callback = (data)->
      delete  $scope.modal.processing

      #console.log data
      if data.error && data.resp
        #try to find url
        $html = $("<div></div>").append($.parseHTML(data.resp))
        url = $html.find('link[type="application/rss+xml"],link[type="application/atom+xml"]').attr('href')
        unless url
          callback error:true
          return
        feed.url = url;
        feed.getXML callback
        return

      if data.error
        $scope.modal.feed.step = "error"
        return

      feed = Feeds.insert(data)
      preserveFeedData feed

      $scope.modal.feed.item = feed
      feed._folderId = Settings.folder
      $scope.modal.feed.step = "edit"

    feed.getXML callback

  $scope.editFeed = (feed)->
    $scope.modal.feed.step = "edit"
    $scope.modal.feed.item = feed

    preserveFeedData feed

    $("#feedModal").modal('show').off('hidden.bs.modal').on 'hidden.bs.modal', ()->
      $scope.$apply ()->
        if $routeParams.action == 'edit'
          $location.path( "/" )

  $scope.saveFeed = ->
    item = $scope.modal.feed.item
    item.setTitle item._title
    item.setUrl item._url
    item.setFolderId item._folderId

    Settings.set("folder", item._folderId);


  $scope.editingFolder = {}

  $scope.editFolder = (folder)->
    folder._name = folder.name
    $scope.editingFolder = folder
    $("#editFolderInput").focus()

  $scope.updateFolder = ->
    if $scope.editingFolder._name
      if $scope.editingFolder.id
        $scope.editingFolder.setName $scope.editingFolder._name
      else
        Folders.add $scope.editingFolder._name
        .then (folder)->
          $scope.modal.feed.item._folderId = folder.id
          $scope.$apply()

    $scope.editingFolder = {}
    
  $scope.removeFolder = (folder)->
    $scope.modal.feed.item._folderId = 'unsorted' if $scope.modal.feed.item._folderId == folder.id
    Folders.remove(folder)


  #routing
  if($routeParams.action == 'new')
    $scope.showAddFeedModal()

  if($routeParams.action == 'edit' && $routeParams.sub)
    $rootScope.loadDefer.then ->
      item = Feeds.getById($routeParams.sub)
      return unless item
      $scope.editFeed item

