# Created by Serge P <contact@sergerusso.com> on 10/22/16.

angular.module('feedBundle').factory 'FolderBookmarks', (db, Feeds, Folder, FeedComposite)->

  class FolderBookmarks extends  Folder

    constructor: (data)->
      super data
      @compositeFeed = new FeedComposite countRead:true
      @isBookmarks = true

    getFeeds: ->

      @compositeFeed.items = []
      @compositeFeed.feeds = []

      Feeds.items.forEach (feed)=>
        feed.items.forEach (item)=>
          if item.marked
            @compositeFeed.items.push item
            @compositeFeed.feeds.push feed

      [@compositeFeed]

    setName: (@name)-> throw "Couldnt set name for a system folder"

    isSystem: -> true




