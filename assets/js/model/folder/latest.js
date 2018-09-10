// Created by Serge P <contact@sergerusso.com> on 10/24/16.

import Folder from './folder.js'
import Feeds from '../feed/feeds.js'
import FeedComposite from '../feed/composite.js'

class FolderLatest extends  Folder{

  constructor() {
    super({id: "Latest", name: "Latest news", isSystem: true})
    this.compositeFeed = new FeedComposite
    this.isComposite = true
    this.latestNews = true
    this.limit = 200  //todo make editable
  }


  getFeeds(){

    this.compositeFeed.items = []
    this.compositeFeed.feeds = []

    let results = []

    Feeds.items.forEach( feed=> {
      feed.items.forEach(item => results.push([feed, item]))
    });

    //sort


    results.sort(([,a = {}], [,b = {}]) => (
      (b.date || 0) - (a.date || 0)
    ))


    results = results.slice(0, this.limit)

    //push
    results.forEach( result=> {
      this.compositeFeed.feeds.push(result[0]) //todo why?
      this.compositeFeed.items.push(result[1])
    })

    return [this.compositeFeed]

  }
  setName(name){
      throw "Couldnt set name for a system folder"
  }
}


export default FolderLatest;


