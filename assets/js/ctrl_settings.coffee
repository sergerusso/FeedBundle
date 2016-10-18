
window.settingsCtrl = ($scope, Feeds, Settings, Storage,$location, $routeParams)->
  window.scp2 = $scope;


  $scope.modal =
    feed:
      step: null
      new_feed_url: ''
      item: null
    edited_folder: false
  $scope.Feeds = Feeds
  $scope.Settings = Settings

  $scope.feeds =
    folder: -1

  $scope.general =
    update_each: Settings.update_each

  $scope.opml_result = null;


  $scope.menu_class = (name)-> {collapsed: $scope.view != name }

  $scope.add_new_feed = ->
    $scope.modal.feed.step = "add"
    $scope.modal.feed.new_feed_url = ''

    $("#feedModal").modal('show').off('hidden.bs.modal').on 'hidden.bs.modal', ()->
      $scope.$apply ()->
         $location.path( if $routeParams.sub == 'return' then "/reader/" else "/settings/" )  ;

  $scope.process_new_feed = ->
    return unless $scope.modal.feed.new_feed_url
    $scope.ajax = true
    Feeds.load $scope.modal.feed.new_feed_url, (data)->

      if data.error
        $scope.modal.feed.step = "error"
        return
      $scope.modal.feed.item = Feeds.insert(data)
      $scope.modal.feed.item.folder?= 0
      $scope.modal.feed.step = "edit"
      Feeds.update(true)
      $scope.ajax.false

  $scope.edit_feed = (feed)->
    $scope.modal.feed.step = "edit"
    $scope.modal.feed.item = feed
    $scope.modal.feed.item.folder?= 0

    $("#feedModal").modal('show').off('hidden.bs.modal').on 'hidden.bs.modal', ()->
      $scope.$apply ()->
        if $routeParams.action == 'edit'
          $location.path( "/" )


  $scope.get_opml_import = (input)->
    reader = new FileReader()
    reader.onload = (theFile)->

      $xml = $($.parseXML(reader.result));

      $scope.opml_result = {};

      $xml.find("body > outline").each ->
        #top level

        folderName = $(this).attr('title')
        $scope.opml_result[folderName] = []

        $(this).find("outline").each ->
          $outline = $(this);
          $scope.opml_result[folderName].push
            url:$outline.attr('xmlUrl')
            title:$outline.attr('title')
            text:$outline.attr('text')

      $scope.$apply()

    reader.readAsText(input.files[0]);



    console.log 'imp'

  $scope.process_opml_import = ->
    $.each $scope.opml_result, (folder_name, value)->
      new_folder = Feeds.new_folder(folder_name)
      $.each value, (feed)->
        return unless this.checked
        Feeds.insert
          url:this.url
          title: this.title
          folder: new_folder.id
          collapsed: true
    $scope.opml_result = null
    Feeds.update(true)
    $location.path('/settings/')

  $scope.export_to_opml = ->

    $xml = $($.parseXML(
      '<opml version="1.0">'+
        '<head>'+
          '<title>FeedsBunde Export</title>'+
          #'<dateCreated>#{Date::today.rfc822}</dateCreated>'+
        '</head>'+
        '<body></body>'+
      '</opml>'
    ));

    $.each Feeds.export(), (k, item) ->
      $outline = $("<outline></outline>");
      $outline.attr('title', item.name).appendTo $xml.find("body");

      item.feeds.forEach (subItem)->
        $subOutline = $("<outline></outline>").attr
          title: subItem.title
          text: ''
          type: 'rss'
          version: 'rss'
        .appendTo $outline

        #argh https://bugs.jquery.com/ticket/11166
        $subOutline[0].setAttribute('xmlUrl', subItem.url)
        $subOutline[0].setAttribute('htmlUrl', subItem.url.replace(/^(https?:\/\/[^\/]+).*$/, '$1'))


    #save
    a = document.createElement("a")
    file = new Blob([$xml[0].documentElement.outerHTML], {type: 'text/xml'});

    a.href = URL.createObjectURL(file)
    a.download = 'FeedBundle export.xml'
    document.body.appendChild(a)
    a.click()
    setTimeout ->
      URL.revokeObjectURL(a.href)
      document.body.removeChild(a)
    ,0











  $scope.$watch "modal.feed.item", (->Feeds.save()),true
  $scope.$watch 'Feeds.folders', (->Feeds.save()), true

  $scope.$watch 'general.update_each', ->
    $scope.general.update_each = parseInt $scope.general.update_each, 10
    if isNaN($scope.general.update_each) or $scope.general.update_each < 1
      $scope.general.update_each = 1
      return

    Settings.set('update_each', $scope.general.update_each)

  $scope.$watch 'modal.new_folder', (name)->
    return unless name
    unless $scope.modal.edited_folder
      $scope.modal.edited_folder = Feeds.new_folder(name)
      $scope.modal.feed.item.folder = $scope.modal.edited_folder.id

    $scope.modal.edited_folder.name = name



  #routing
  if($routeParams.action == 'new')
    $scope.add_new_feed()
  else
    $scope.view = $routeParams.action || 'feeds'

  if($routeParams.action == 'edit' && $routeParams.sub)
    item = Feeds.all()[$routeParams.sub]
    return unless item
    $scope.edit_feed item


  if($routeParams.action == 'folder' && !isNaN(parseInt($routeParams.sub)))
    $scope.feeds.folder = parseInt($routeParams.sub)




settingsCtrl.$inject = ['$scope', 'Feeds', 'Settings', 'Storage', '$location', '$routeParams']