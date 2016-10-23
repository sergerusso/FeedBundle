# Created by Serge P <contact@sergerusso.com> on 10/18/16.

angular.module('feedBundle').factory 'Folder', (db, Feeds, FeedComposite)->

  class Folder

    constructor: (data)->
      @id = data._id
      @name = data.name

    getFeeds: ->

    unreadCount: ->
      count = 0
      @getFeeds().forEach (feed)->
        count+= feed.unreadCount()
      count

    getFeeds: ->

      feeds = if @id is 'all' then Feeds.items else Feeds.items.filter (feed)=> feed.folderId == @id
      #sort
      feeds.sort (a,b)->
        a_part = a.items[0]?.date || 0
        b_part = b.items[0]?.date || 0
        return -1 if a_part > b_part
        return 1 if a_part < b_part
        return 0

      feeds

    setName: (name)->
      @name = name
      db.folders.upsert @id, (doc)=>
        doc.name = name
        doc
      .catch (err)->console.log 'Error at folder.setName', err
        
    isSystem: -> !parseInt(@id)


      


