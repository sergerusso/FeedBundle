# Created by Serge P <contact@sergerusso.com> on 10/18/16.

angular.module('feedBundle').service 'Feeds', ($rootScope, Feed, db)->
  self = @

  @items = {}  #Todo to array

  @clear = ->

  @update = ->
    $.each @items, ()-> @fetch()


  @get = (noUpdate)->

    db.feeds.allDocs(include_docs:true).then (result)=>
      @items = {}
      result.rows.forEach (item)=>
        @items[item.doc._id] = new Feed item.doc

      $rootScope.$apply()
      @update() unless noUpdate
      @items

  @getById = (id)->
    _.find @items, (item)-> item.id is id

  @insert = (data)->
    id = data.url.match(/:\/\/([^\/]+)/i)
    id = id && id[1] || ""
    id = id.replace(/[^a-z0-9]/ig, '')
    id+= "_"+Math.random().toString(36).substr(2,4)

    json =
      _id:id,
      title: data.title
      url: data.url

    json.items = data.items if _.isArray(data.items)

    json.folder = data.folder if data.folder

    db.feeds.put(json).catch (err)->console.log 'Error at feeds.insert', err

    feed = new Feed json
    @items[feed.id] = feed

    feed

  @remove = (feed)->
    return unless confirm('Are you sure?')

    db.feeds.get(feed.id).then (doc)=>
      db.feeds.remove(doc)
      @get true

  @exists = (url)->

    _.find @items, (feed)-> return feed.url == url


