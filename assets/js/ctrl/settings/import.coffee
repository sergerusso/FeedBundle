# Created by Serge P <contact@sergerusso.com> on 10/19/16.

angular.module('feedBundle').controller 'settingsImportCtrl', ($scope, Feeds, Folders, $routeParams, $location, Feed, Settings )->


  $scope.result = null;

  $scope.importFile = (input)->
    reader = new FileReader()
    reader.onload = (theFile)->

      $xml = $($.parseXML(reader.result));

      $scope.result = {};

      $xml.find("body > outline").each ->
        #top level
        folderName = $(this).attr('title')
        $scope.result[folderName] = []

        $(this).find("outline").each ->
          $outline = $(this);
          $scope.result[folderName].push
            url:$outline.attr('xmlUrl')
            title:$outline.attr('title')
            text:$outline.attr('text')

      $scope.$apply()

    reader.readAsText(input.files[0]);


  $scope.importResult = ->

    $.each $scope.result, (folderName, value)->
      Folders.add(folderName).then (folder)->

        $.each value, (feed)->
          return unless @.checked
          Feeds.insert
            url:@url
            title: @title
            folderId: folder.id
          .fetch()

    $scope.result = null
    $location.path('/settings/')

  $scope.export = ->

    $xml = $($.parseXML(
      '<opml version="1.0">'+
        '<head>'+
        '<title>FeedsBunde Export</title>'+
        #'<dateCreated>#{Date::today.rfc822}</dateCreated>'+
        '</head>'+
        '<body></body>'+
        '</opml>'
    ));

    result = []

    $.each( Folders.items, (k,folder) =>

      return if folder.isSystem && folder.id != 'unsorted'

      feeds = []
      $.each folder.getFeeds(), ->
        feeds.push {title:this.title, url:this.url}

      result.push {
        name: folder.name
        feeds: feeds
      } if feeds.length

    )

    result

    $.each result, (k, item) ->
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