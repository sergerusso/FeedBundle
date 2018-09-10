import Feeds from '../model/feed/feeds.js'
import Folders from '../model/folder/folders.js'
import Settings from '../model/settings.js'

export default function($rootScope, $scope){
  window.scp = $scope;

  //$scope.db = db
  //$scope.Folders = Folders

  $scope.sidebar_expanded = true

  $scope.feedItem = null

  $rootScope.loadDefer.then(()=> {
    $scope.selectedFolder = Folders.getById(Settings.folder)
    $scope.$apply()
  })

  $scope.getFolderClass = (folder)=> ({
    selected: $scope.selectedFolder == folder
  })

  $scope.selectFolder = (folder)=> {
    $scope.selectedFolder = folder
    Settings.set("folder", folder.id)
  }

  $scope.editFolder = (folder)=> {
    folder.newName = folder.name
    folder.editing = true
    //todo refactor
    setTimeout(() => $("#editFolder_" + folder.id).focus())
  }

  $scope.saveFolderName = (folder)=> {
    folder.setName(folder.newName)
    delete folder.newName
    folder.editing = false
  }

  $scope.showFeedItem = (item, feed)=> {
    feed.markRead(item)
    $scope.feedItem = item
  }

  $scope.isActiveFeedItem = (item)=> {
    $scope.feedItem && ($scope.feedItem.url == item.url)
  }

  $scope.collapseAll = ()=>{
    Feeds.items.forEach(item=>{
      delete item.expanded
    })
  }


  $scope.toggleFeed = (feed) => {
    feed.expanded = !feed.expanded
  }

  $scope.markRead = (feed)=> feed.markRead()

  $scope.toggleBookmark = (feed, item) => {
    feed.toggleMark(item)

    //todo prevent item disappearing
    //if $scope.selectedFolder.isBookmarks and !item.marked
  }


  $scope.removeFolder = (folder)=> {
    let toSelect = Folders.getById(folder.getFeeds().length ? 'unsorted' : 'all')
    Folders.remove(folder)
    if ($scope.selectedFolder == folder) {
      $scope.selectFolder(toSelect)
    }
  }


  $scope.$watch(() => (
    Folders.getById('all').unreadCount()
  ), (unread,b)=> {
    if (unread == 0) unread = ""
    setBadgetText(unread.toString())
  });

}


      

    



