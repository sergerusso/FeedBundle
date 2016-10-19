# Created by Serge P <contact@sergerusso.com> on 10/18/16.

angular.module('feedBundle').factory 'Feed', ($http, db)->
  
  class Feed
    constructor: (data)->
      @title = data.title
      @url = data.url
      @id = data._id
      @folder = data.folder or "unsorted"
      @feedSize = 300 #todo feedSize
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

    setItems: (items)->
      slice_to = if items.length > @feedSize then items.length else @feedSize
      @items = items.slice(0, slice_to)

      #TODO get rid of $$hashKey
      db.feeds.upsert @id, (doc)=>
        doc.items = @items
        doc
      .catch (err)->console.log 'Error at feed.setItems', err


    setTitle: (@title)->
      #todo rewrite others as well
      db.feeds.upsert @id, (doc)=>
        doc.title = @title
        doc
      .catch (err)->console.log 'Error at feed.setTitle', err

    setUrl: (@url)->

      db.feeds.upsert @id, (doc)=>
        doc.url = @url
        doc
      .catch (err)->console.log 'Error at feed.setUrl', err

    setFolder: (@folder)-> #todo rename to fid?

      db.feeds.upsert @id, (doc)=>
        doc.folder = @folder
        doc
      .catch (err)->console.log 'Error at feed.setFolder', err

    fetch: ()->
      
      @updating = true
      
      delete @error

      @getXML (resp)=>
        urls = (v.url for k, v of @items)
        items = @items.slice(0)

        if resp.items?.length

          $.each resp.items.reverse(), (k, item)=>
            return unless item.url

            if item.url.indexOf('http') != 0
              item.url = @url.replace(/^(https?:\/\/.+?)\/.+$/, '\$1') + item.url

            items.unshift({title: item.title, url: item.url}) if urls.indexOf(item.url) == -1

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
          result.items.push
            title: $this.find("title").text(),
            url: $this.find("link").text() || $this.find("link").attr('href')

        callback(result)
      , (err)->
        callback error: true



        
      
    
    