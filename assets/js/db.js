// Created by Serge P <contact@sergerusso.com> on 10/18/16.

let db = {
  folders: new PouchDB('FeedBundle_folders', {auto_compaction: true}),
  feeds: new PouchDB('FeedBundle_feeds', {auto_compaction: true}),
  reset: ()=> Promise.all([db.feeds.destroy(), db.folders.destroy()])

}










