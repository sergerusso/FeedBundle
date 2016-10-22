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

      if @id is 'all'
        Feeds.items
      else
        Feeds.items.filter (feed)=> feed.folderId == @id

    setName: (name)->
      @name = name
      db.folders.upsert @id, (doc)=>
        doc.name = name
        doc
      .catch (err)->console.log 'Error at folder.setName', err
        
    isSystem: -> !parseInt(@id)


      


