// Created by Serge P <contact@sergerusso.com> on 10/24/16.

import Folder from './folder.js'
import Feeds from '../feed/feeds.js'
import FeedComposite from '../feed/composite.js'
import Settings from '/assets/js/model/settings.js'


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

    let count = 0
    Feeds.items.forEach( feed=> {
      feed.items.forEach(item => {
        if(count >= this.limit) return
        count++
        if(!Settings.unread && item.read){
          count--
        }
        results.push([feed, item])
      })
    });

    //sort


    results.sort(([,a = {}], [,b = {}]) => (
      (b.date || 0) - (a.date || 0)
    ))

    //hide u


    //results = results.slice(0, this.limit)

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


