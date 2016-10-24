# Created by Serge P <contact@sergerusso.com> on 10/24/16.


angular.module('feedBundle').factory 'FolderLatest', (db, Feeds, Folder, FeedComposite)->

  class FolderLatest extends  Folder

    constructor: (data)->
      super _id:"Latest", name:"Latest news"
      @compositeFeed = new FeedComposite
      @isComposite = true
      @limit = 100


    getFeeds: ->

      @compositeFeed.items = []
      @compositeFeed.feeds = []

      results = []

      Feeds.items.forEach (feed)=>
        feed.items.forEach (item)=>
            results.push [feed,item] if results.length < @limit

      #sort
      results.sort (a,b)->
        a_part = a[1]?.date || 0
        b_part = b[1]?.date || 0
        return -1 if a_part > b_part
        return 1 if a_part < b_part
        return 0

      #push
      results.forEach (result)=>
        @compositeFeed.feeds.push result[0]
        @compositeFeed.items.push result[1]

      [@compositeFeed]

    setName: (@name)-> throw "Couldnt set name for a system folder"

    isSystem: -> true




