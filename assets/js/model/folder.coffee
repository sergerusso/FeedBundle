# Created by Serge P <contact@sergerusso.com> on 10/18/16.

angular.module('feedBundle').factory 'Folder', (Settings, db, Feeds)->

  class Folder

    constructor: (data)->
      @id = data._id
      @name = data.name

    getFeeds: ->

    unreadCount: ->
      count = 0
      $.each @getFeeds(), ->
        $.each @items, ->
          count++ unless @read
      count

    isSelected: ->
      @id == Settings.folder #TODO !

    getFeeds: ->

      _.filter Feeds.items, (feed)=>
        feed.folder == @id || @id == "all" #todo remove folder

    select: ->
      Settings.set("folder", @id)

    setName: (name)->
      @name = name
      db.folders.get(@id).then (doc)->
        doc.name = name
        db.folders.put(doc).catch (err)->console.log 'Error at folders.setName', err
        
    isSystem: -> !parseInt(@id)

    isBookmarks: -> @id is 'bookmarks'

      


