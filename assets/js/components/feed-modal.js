//sergerusso 2018
import Feeds from '../model/feed/feeds.js'
import Feed from '../model/feed/feed.js'
import Settings from '../model/settings.js'
import Folders from '../model/folder/folders.js'

import app from '../app.js'

app
  .directive('feedModal', ()=>({
    templateUrl:"views/modal/feed.html",
    scope: {
      // same as '=customer'
      feed: '=',
    },
    controller: function($scope, $rootScope){

      $scope.Folders = Folders;

      //open  modal
      $scope.$watch('feed.step', (newVal,oldVal) => {

        if(oldVal || !newVal) return;

        $("#feedModal").modal('show')
          .off('hidden.bs.modal')
          .one('shown.bs.modal', (e) => $(e.target).find("input").first().focus())
          .one('hidden.bs.modal', () => {
            $scope.$apply(() => {
              $scope.feed.step = null;
            })
          })

      }, true)


      $scope.addFeed = (e) => {

        let url = $scope.feed.new_feed_url

        if (!url || $scope.processing) return false;

        requestPermission(url).then(() => {


          $scope.processing = true
          let feed = new Feed({url})

          const callback = (data) => {

            delete  $scope.processing

            //console.log data
            if (data.error && data.resp) {
              //try to find url
              let $html = $("<div></div>").append($.parseHTML(data.resp)),
                url = $html.find('link[type="application/rss+xml"],link[type="application/atom+xml"]').attr('href');

              if (!url) {
                callback({error: true})
                return;
              }
              feed.url = url;
              feed.getXML(callback);
              return;
            }

            if (data.error) {
              return $scope.feed.step = "error"
            }


            Feeds.insert(data).then( feed => {
              //todo check

              if(!Folders.getById(Settings.folder).isSystem) {
                feed.folderId = Settings.folder;
              }
              $rootScope.editFeed(feed);

              $scope.$apply();
            })
          }


          feed.getXML(callback)
        }).catch((e) => {
          console.error(e)
          $scope.$apply(() => $scope.feed.step = "error")
        })

        return false;
      }


      $scope.saveFeed = () => {
        let {item, fields} = $scope.feed


        if (item.url != fields.url) {
          removePermission(item.url)
          requestPermission(fields.url)//todo wait promise
          console.log('req')
        }

        item.setTitle(fields.title)
        item.setUrl(fields.url)
        item.setFolderId(fields.folderId)

        Settings.set("folder", item.folderId);
      }


      $scope.remove = (feed) => {
        removePermission(feed.url)
        Feeds.remove(feed)
      }

      //todo rewite _name
      $scope.editingFolder = {}
      $scope.editFolder = (folder) => {
        folder._name = folder.name
        $scope.editingFolder = folder
        $("#editFolderInput").focus()
      }

      $scope.updateFolder = () => {
        if ($scope.editingFolder._name) {
          if ($scope.editingFolder.id) {
            $scope.editingFolder.setName($scope.editingFolder._name)
          } else {
            Folders.add($scope.editingFolder._name)
              .then((folder) => {
                $scope.feed.item._folderId = folder.id
                $scope.$apply()
              })
          }
        }

        $scope.editingFolder = {}
      }

      $scope.removeFolder = (folder) => {
        if ($scope.feed.item._folderId == folder.id) {
          $scope.feed.item._folderId = 'unsorted'
        }
        Folders.remove(folder)
      }



    }
  }))

export default angular