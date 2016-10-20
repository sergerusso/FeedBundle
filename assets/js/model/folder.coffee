# Created by Serge P <contact@sergerusso.com> on 10/18/16.

angular.module('feedBundle').factory 'Folder', (db, Feeds)->

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

    getFeeds: ->

      return Feeds.items if @id = 'all'
      Feeds.items.filter (feed)=> feed.folderId == @id

    setName: (name)->
      @name = name
      db.folders.upsert @id, (doc)=>
        doc.name = name
        doc
      .catch (err)->console.log 'Error at folder.setName', err
        
    isSystem: -> !parseInt(@id)

    isBookmarks: -> @id is 'bookmarks'

      


