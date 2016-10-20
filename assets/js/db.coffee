# Created by Serge P <contact@sergerusso.com> on 10/18/16.

angular.module('feedBundle').factory 'db', ()->
  folders: new PouchDB('FeedBundle_folders', auto_compaction: true)
  feeds: new PouchDB('FeedBundle_feeds', auto_compaction: true)

  reset: ->
    Promise.all([@feeds.destroy(), @folders.destroy()])







