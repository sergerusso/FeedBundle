angular.module('feeds', [])
  .service('Feeds', ['$rootScope', 'Storage', 'Settings', '$http', ($scope, Storage, Settings, $http)->
    self = @
    @feeds = Storage.read('feeds') || {}
    @viewFrame = {}
    @feed_size = 100

    @sys_folders = [
      {id:-1, name:'All feeds', system:true},
      {id:0, name:'Unsorted', system:true},
      {id:1, name:'Bookmarks', system:true}
    ]
    @folders = Storage.read('folders') || []

    $.each @feeds, -> @collapsed = true


    @delete_all_data = ->
      return unless (prompt("Are you sure? Type 'yes' to continue", '')).toLowerCase() == 'yes'
      @folders = []
      @feeds = {}
      @save()


    @update = (only_new)->
      feed_size = @feed_size;
      $.each @feeds, ()->

        @items ?= []
        return if @items.length and only_new
        @updating = true
        delete @error

        self.load @url, (resp)=>
          urls = for k, v of @items
            v.url

          if resp.items?.length

            $.each resp.items.reverse(), (k, item)=>

              if item.url && item.url.indexOf('http') != 0
                item.url = @url.replace(/^(https?:\/\/.+?)\/.+$/, '\$1') + item.url

              @items.unshift({title: item.title, url: item.url}) if item.url && urls.indexOf(item.url) == -1

            slice_to = if resp.items.length > feed_size then resp.items.length else feed_size
            @items = @items.slice(0, slice_to)

          else if (resp.error)
            @error = true

          @updating = false
        , true


    @all = ->
      @feeds

    @load = (url, callback, noFind)->
      $http.get(url).then (resp)=>

        try
          $xml = $($.parseXML(resp.data));
          $items = $xml.find("item,entry")
        catch e
          console.log e
          @try_to_find url, callback unless noFind
          return

        result =
          title: $xml.find('title:first').text()
          url: url
          items: []

        $items.each ->
          $this = $(this)
          result.items.push
            title: $this.find("title").text(),
            url: $this.find("link").text() || $this.find("link").attr('href')

        callback(result)
      , (err)->
        callback error: true
        
    @try_to_find = (url, callback)->
      $.get url, (resp)=>

        $html = $("<div></div>").append($.parseHTML(resp))
        url = $html.find('link[type="application/rss+xml"],link[type="application/atom+xml"]').attr('href')
        return callback({error:true}) unless url
        @load url, callback, true
        #


    @save = ->
      Storage.write('feeds', @feeds)
      Storage.write('folders', @folders)

    @export = ->
      _export = []

      $.each( @get_folders(), (k,folder) =>
        return if folder.id == -1
        feeds = []
        $.each @get_feeds(folder.id), ->
          feeds.push {title:this.title, url:this.url}

        _export.push {
          name: folder.name
          feeds: feeds
        } if feeds.length

      )
      _export

    @isset = (folder)->
      flag = false
      $.each @get_feeds(folder), ()->
        flag = true
        return false
      flag

    @is_read = ->
      flag = true
      $.each @feeds, (k,feed)=>
        if @unread(feed.items) > 0
          flag = false
          return false
      flag


    @insert = (data)->
      id = data.url.match(/:\/\/([^\/]+)/i)
      id = id && id[1] || ""
      id = id.replace(/[^a-z0-9]/ig, '')
      id+= "_"+Math.random().toString(36).substr(2,4)
      feed = {
        id:id,
        title: data.title
        url: data.url
        collapsed:!!data.collapsed
      }
      feed.folder = data.folder if data.folder
      @feeds[feed.id] = feed
      @save()
      feed

    @remove = (id)->
      return unless confirm('Are you sure?')
      delete @feeds[id]
      @save()

    @setViewFrame = (id, index)->
      @viewFrame =
        index: index
        id: id

    @collapse_all = ->
      $.each @feeds, ()->
        @collapsed = true

    @expand_all = ->
      $.each @feeds, ()->
        @collapsed = false

    @getViewFrame = ->
      try
        item = @feeds[@viewFrame.id].items[@viewFrame.index]
        item.read = true
        item.save_url = @feeds[@viewFrame.id].proxy && "/gate/"+encodeURIComponent(item.url) || item.url
        item
      catch error
        false

    @next_item = ->
      flag = !@viewFrame.id || false
      item = null

      if !@viewFrame.id || @viewFrame.index+1 > @feeds[@viewFrame.id].items.length-1
        $.each @feeds, ()->
          if(flag)
            item = this
            return false

          flag = true if this.id == viewFrame.id

        if(!item)
          $.each @feeds, ()->
            item = this
            return false

        @viewFrame.id = item.id
        @viewFrame.index = 0
      else
        @viewFrame.index++

    @unread = (items)->
      count = 0
      $.each items || [], ()->
        count++ unless this.read

      count

    @is_active_item = (index, feed)->
      index == @viewFrame.index && feed.id == @viewFrame.id

    @exist = (url)->
      _.find @feeds, (feed)-> return feed.url == url

    @mark_read = (id) ->
      $.each @feeds[id] && @feeds[id].items || [], ()->
        this.read = true

    @get_feeds = (folder_id) ->
      _.filter @feeds, (feed)->
        feed.folder?=0
        feed.folder == folder_id || folder_id == -1

    @unread_in_folder = (folder_id)->
      feeds = @get_feeds folder_id
      count = 0
      _.each feeds, (feed,index)=>
        count+=@unread feed.items
      count

    @new_folder = (name)->
      return unless name
      id = (Math.max (folder.id for folder in @get_folders())...)+1

      folder =
        name: name,
        id: id

      @folders.push folder

      folder

    @remove_folder = (folder)->
      return unless confirm('Are you sure?')
      Settings.set('folder', -1) if Settings.folder == folder.id
      @folders = _.filter @folders, (sf)-> sf.id != folder.id
      #clear items
      _.each @feeds, (feed)->
        delete feed.folder if feed.folder == folder.id

      @folders

    @get_folder = (id = 0)->_.find @get_folders(), ((lf)-> lf.id == id)
    @get_folders = ()->
      $.merge( $.merge([],@sys_folders), @folders);

  ])