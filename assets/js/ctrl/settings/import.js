// Created by Serge P <contact@sergerusso.com> on 10/19/16.

import Folders from '../../model/folder/folders.js'
import Feeds from '../../model/feed/feeds.js'
import Settings from '../../model/settings.js'


window.settingsImportCtrl = function($scope, $routeParams, $location) {


  $scope.result = null;

  $scope.importFile = (input) => {
    let reader = new FileReader()
    reader.onload = ( theFile => {
      let $xml = $($.parseXML(reader.result));

      $scope.result = {};
      $xml.find("body > outline").each((idx, el) => {
        //top level
        let folderName = $(el).attr('title')
        $scope.result[folderName] = []

        $(el).find("outline").each((idx, el) => {
          let $outline = $(el);
          $scope.result[folderName].push({
            url: $outline.attr('xmlUrl'),
            title: $outline.attr('title'),
            text: $outline.attr('text'),
          })
        })
      })

      $scope.$apply()
    })

    reader.readAsText(input.files[0]);
  }


  $scope.importResult = () => {

    let urls = []
    $.each($scope.result, (folderName, items) => {
      urls = [...urls, ...items.map(({url}) => url)]
    })

    requestPermission(urls).then( ()=> {

      //todo update afterward


      $.each($scope.result, (folderName, value) => {
        Folders.add(folderName).then(folder => {



          $.each(value, (idx, feed) => {
            if (!feed.checked) return;

            /*console.log({
             url: feed.url,
             title: feed.title,
             folderId: folder.isSystem ? undefined : folder.id
             });*/

            Feeds.insert({
              url: feed.url,
              title: feed.title,
              folderId: folder.isSystem ? undefined : folder.id
            }).then( feed => feed.fetch() )

            urls.push(feed.url)
          })
        })
      })


      $scope.result = null
      $location.path('/settings/')
      $scope.$apply();

    });

  }

  $scope.export = () => {

    let $xml = $($.parseXML(
        '<opml version="1.0">' +
        '<head>' +
        '<title>FeedsBunde Export</title>' +
        //'<dateCreated>#{Date::today.rfc822}</dateCreated>'+
        '</head>' +
        '<body></body>' +
        '</opml>'
      )),
      result = []

    $.each(Folders.items, (k, folder) => {

      if (folder.isSystem && folder.id != 'unsorted') return;

      let feeds = []
      $.each(folder.getFeeds(), (idx, feed) => {
        feeds.push({title: feed.title, url: feed.url})
      })

      if (feeds.length) {
        result.push({
          name: folder.name,
          feeds: feeds,
        })
      }
    })


    $.each(result, (k, item) => {
      let $outline = $("<outline></outline>");
      $outline.attr('title', item.name).appendTo($xml.find("body"));

      item.feeds.forEach((subItem) => {
        let $subOutline = $("<outline></outline>").attr({
          title: subItem.title,
          text: '',
          type: 'rss',
          version: 'rss',
        }).appendTo($outline)

        //argh https://bugs.jquery.com/ticket/11166
        $subOutline[0].setAttribute('xmlUrl', subItem.url)
        $subOutline[0].setAttribute('htmlUrl', subItem.url.replace(/^(https?:\/\/[^\/]+).*$/, '$1'))
      })
    })


    //save
    let a = document.createElement("a"),
      file = new Blob([$xml[0].documentElement.outerHTML], {type: 'text/xml'});

    a.href = URL.createObjectURL(file)
    a.download = 'FeedBundle Export.xml'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      URL.revokeObjectURL(a.href)
      document.body.removeChild(a)
    }, 0);
  }
}

export default angular;