// Created by Serge P <contact@sergerusso.com> on 10/18/16.
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

  get(noUpdate){

    return db.feeds.allDocs({include_docs:true}).then (result=>{
      this.items = result.rows.map(item=>new Feed(item.doc))

      if(!noUpdate){
        this.update()
      }

      return this.items;


    })

  },

  insert(data, returnPromise){
    let id = data.url.match(/:\/\/([^\/]+)/i)
    id = id && id[1] || ""
    id = id.replace(/[^a-z0-9]/ig, '')
    id+= "_"+Math.random().toString(36).substr(2,4)

    let json = {
      _id: id,
      title: data.title,
      url: data.url
    }

    if(_.isArray(data.items)){
      json.items = data.items
    }
    if(data.folderId){
      json.folderId = data.folderId
    }


    let promise = db.feeds.put(json).catch((err)=>console.log('Error at feeds.insert', err))

    let feed = new Feed(json)
    this.items.push(feed)

    return returnPromise ? promise : feed;

  },

  remove(feed){
    if(!confirm('Are you sure?')){ //todo move out confirm
      return
    }
    this.items = _.without(this.items, feed);


    db.feeds.get(feed.id).then(doc=>db.feeds.remove(doc))
  }

}




