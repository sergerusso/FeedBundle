# Created by Serge P <contact@sergerusso.com> on 10/22/16.

angular.module('feedBundle').factory 'FeedComposite', ($http, db, Feed)->

  class FeedComposite extends Feed
    feeds: []

    constructor: (data = {})->
      super data
      @countRead = data.countRead
      @isComposite = true

    unreadCount: ->
      count = 0
      @items.forEach (item)=>
        count++ if !item.read || @countRead

      count

    markRead: (item)->
      index = @items.indexOf item
      @feeds[index].markRead item

    toggleMark: (item)->
      index = @items.indexOf item
      @feeds[index].toggleMark item

