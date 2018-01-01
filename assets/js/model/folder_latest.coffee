# Created by Serge P <contact@sergerusso.com> on 10/24/16.


angular.module('feedBundle').factory 'FolderLatest', (Folder)->

  class FolderLatest extends  Folder

    constructor: ->
      super _id:"Latest", name:"Latest news", isSystem: true
      @compositeFeed = new FeedComposite
      @isComposite = true
      @latestNews = true
      @limit = 200  #todo make editable


    getFeeds: ->

      @compositeFeed.items = []
      @compositeFeed.feeds = []

      results = []

      Feeds.items.forEach (feed)=>
        feed.items.forEach (item)=>
            results.push [feed,item]

      #sort
      results.sort (a,b)->
        a_part = a[1]?.date || 0
        b_part = b[1]?.date || 0
        return -1 if a_part > b_part
        return 1 if a_part < b_part
        return 0

      results = results.slice(0, @limit)

      #push
      results.forEach (result)=>
        @compositeFeed.feeds.push result[0]
        @compositeFeed.items.push result[1]

      [@compositeFeed]

    setName: (@name)-> throw "Couldnt set name for a system folder"




