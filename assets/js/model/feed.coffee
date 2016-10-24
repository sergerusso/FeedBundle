# Created by Serge P <contact@sergerusso.com> on 10/18/16.

angular.module('feedBundle').factory 'Feed', ($http, db, Settings)->
  
  class Feed
    constructor: (data = {})->
      @title = data.title
      @url = data.url
      @id = data._id
      @folderId = data.folderId or "unsorted"
      @items = data.items or []

    unreadCount: ->
      count = 0
      $.each @items || [], ()->
        count++ unless @read

      count

    markRead: (item)->
      $.each @items, ()->
        @read = true if item is @ or !item
      @setItems @items #save

    toggleMark: (item)->

      if item.marked
        delete item.marked
      else
        item.marked = parseInt (new Date).getTime()/1000

      @setItems @items

    setItems: (items)->
      slice_to = if items.length > Settings.feedSize then Settings.feedSize else items.length
      @items = items.slice(0, slice_to)

      db.feeds.upsert @id, (doc)=>
        doc.items = @items.map (item)->
          _.omit(_.clone(item), '$$hashKey')
        doc
      .catch (err)->console.log 'Error at feed.setItems', err


    setTitle: (@title)->

      db.feeds.upsert @id, (doc)=>
        doc.title = @title
        doc
      .catch (err)->console.log 'Error at feed.setTitle', err


    setUrl: (@url)->

      db.feeds.upsert @id, (doc)=>
        doc.url = @url
        doc
      .catch (err)->console.log 'Error at feed.setUrl', err

    setFolderId: (@folderId)->

      db.feeds.upsert @id, (doc)=>
        doc.folderId = @folderId
        doc
      .catch (err)->console.log 'Error at feed.setFolderId', err

    fetch: ()->
      
      @updating = true
      
      delete @error

      @getXML (resp)=>
        titles = (v.title for k, v of @items)
        items = @items.slice(0)

        if resp.items?.length

          $.each resp.items.reverse(), (k, item)=>
            return unless item.url

            if item.url.indexOf('http') != 0
              item.url = @url.replace(/^(https?:\/\/.+?)\/.+$/, '\$1') + item.url

            items.unshift(item) if titles.indexOf(item.title) == -1

          @setItems items


        else
          @error = true

        @updating = false

    getXML: (callback)->

      $http.get(@url).then (resp)=>

        try
          $xml = $($.parseXML(resp.data));
          $items = $xml.find("item,entry")
        catch e
          console.log e
          callback error: true, resp:resp.data
          return

        result =
          title: $xml.find('title:first').text()
          url: @url
          items: []

        $items.each ->
          $this = $(this)
          date_str = $this.find("pubDate").text() || $this.find("published").text() || $this.find("updated").text() || $this.find("date").text()
          time = (new Date(date_str)).getTime() || (new Date).getTime()

          console.log 'no date', $this.find("link").text() || $this.find("link").attr('href') unless date_str

          result.items.push
            title: $this.children("title").text(),
            url: $this.children("link").text() || $this.children("link").attr('href')
            date: parseInt(time/1000)

        callback(result)
      , (err)->
        callback error: true



        
      
    
    