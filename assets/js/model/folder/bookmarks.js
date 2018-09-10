// Created by Serge P <contact@sergerusso.com> on 10/22/16.

import Folder from './folder.js'
import FeedComposite from '../feed/composite.js'

import Feeds from '../feed/feeds.js'


class FolderBookmarks extends  Folder {

  constructor(data = {}) {
    super({id: "bookmarks", name: "Bookmarks", isSystem: true})
    this.compositeFeed = new FeedComposite({countRead: true})
    this.isBookmarks = true
    this.isComposite = true
  }


  getFeeds() {

    this.compositeFeed.items = []
    this.compositeFeed.feeds = []

    let results = []


    Feeds.items.forEach(feed => {
      feed.items.forEach(item => {
        if (item.marked) results.push([feed, item])
      })
    });

    //sort


    results.sort(([a = {}], [b = {}]) => (
      (b.date || 0) - (a.date || 0)
    ))


    //push
    results.forEach(result => {
      this.compositeFeed.feeds.push(result[0]) //todo why?
      this.compositeFeed.items.push(result[1])
    })

    return [this.compositeFeed]

  }
}

export default FolderBookmarks;





