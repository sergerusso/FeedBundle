# Created by Serge P <contact@sergerusso.com> on 10/22/16.

angular.module('feedBundle').factory 'FolderBookmarks', (db, Feeds, Folder, FeedComposite)->

  class FolderBookmarks extends  Folder

    constructor: (data = {})->
      super _id:"bookmarks", name:"Bookmarks"
      @compositeFeed = new FeedComposite countRead:true
      @isBookmarks = true
      @isComposite = true

    getFeeds: ->

      @compositeFeed.items = []
      @compositeFeed.feeds = []

      results = []

      Feeds.items.forEach (feed)=>
        feed.items.forEach (item)=>
          if item.marked
            results.push [feed,item]

      #sort
      results.sort (a,b)->
        return -1 if a[1].marked > b[1].marked
        return 1 if a[1].marked < b[1].marked
        return 0;

      #push
      results.forEach (result)=>
        @compositeFeed.feeds.push result[0]
        @compositeFeed.items.push result[1]

      [@compositeFeed]

    setName: (@name)-> throw "Couldnt set name for a system folder"

    isSystem: -> true




