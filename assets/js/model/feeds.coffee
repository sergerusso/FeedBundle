# Created by Serge P <contact@sergerusso.com> on 10/18/16.

angular.module('feedBundle').service 'Feeds', (Feed, db)->
  self = @

  @items = []

  @clear = ->

  @update = ->
    $.each @items, -> @fetch()


  @get = (noUpdate)->

    db.feeds.allDocs(include_docs:true).then (result)=>
      @items = []
      result.rows.forEach (item)=>
        @items.push new Feed item.doc

      @update() unless noUpdate
      @items

  @getById = (id)-> _.find @items, (item)-> item.id is id

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

    json.folderId = data.folderId if data.folderId

    db.feeds.put(json).catch (err)->console.log 'Error at feeds.insert', err

    feed = new Feed json
    @items.push feed

    feed

  @remove = (feed)->

    return unless confirm('Are you sure?') #todo move out confirm

    @items = _.without @items, feed

    db.feeds.get(feed.id).then (doc)=>
      db.feeds.remove(doc)

  @exists = (url)->

    _.find @items, (feed)-> return feed.url == url


