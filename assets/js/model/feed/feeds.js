// Created by Serge P <contact@sergerusso.com> on 10/18/16.

import Feed from '../../model/feed/feed.js'
import db from '../../db.js'



const Feeds = {
  items:[],

  update(){
    this.items.forEach(item=>item.fetch())
  },

  getById(id){
    return _.find(this.items, item=> item.id == id)
  },

  exists(url){
    return _.find(this.items, feed => feed.url == url)
  },

  fetch(noUpdate){

    return db.feeds.toArray().then (result=>{
      this.items = result.map(item=>new Feed(item))

      if(!noUpdate){
        this.update() //todo refactor feeds loa->update not working now
      }

      return this;

    })

  },

  insert(data){

    let json = {
      title: data.title,
      url: data.url
    }

    if(_.isArray(data.items)){
      json.items = data.items
    }
    if(data.folderId){
      json.folderId = data.folderId
    }
    if(data.regexp){
      json.regexp = data.regexp
    }
    if(data.extractText){
      json.extractText = data.extractText
    }


    return db.feeds.add(json).then( id =>{
      json.id = id;

      let feed = new Feed(json)
      this.items.push(feed)

      return feed;

    });



  },

  remove(feed){
    if(!confirm('Are you sure?')){ //todo move out confirm
      return
    }
    this.items = _.without(this.items, feed);


    return db.feeds.delete(feed.id)
  }

}

export default Feeds
