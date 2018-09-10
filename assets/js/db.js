//sergerusso 2018

import Settings from './model/settings.js'

const db = new Dexie("feedbundle")

db.version(1).stores({
  folders: "++id", //id, name
  feeds:"++id",  //id, title, url, folder, items
  storage:"key",
});


db.on("populate", ()=>{

  //todo set defaults
  db.storage.add({
    key:'settings',
    value: Settings._defaults
  })

  /*Object.entries(this.constructor.storageDefaults).forEach( ([key, value]) =>{
    this.storage.add({ key, value })
  })


   Feeds.insert
   title: 'CNET News'
   url: 'https://www.cnet.com/rss/news/'
   , true
   .then -> resolve()


  this.sessions.add({
    id: 1,
    name: "_not_saved_",
    urls: [],
    titles: [],
    favIcons: [],
    tags: [],
    windowsMap:[],
    pinned:[]
  });*/

});


db.open();

export default db;