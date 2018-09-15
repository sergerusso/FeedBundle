//sergerusso 2018

import Settings from './model/settings.js'

const db = new Dexie("feedbundle")

db.version(1).stores({
  folders: "++id", //id, name
  feeds:"++id",  //id, title, url, folder, items
  storage:"key",
});


db.on("populate", ()=>{

  db.storage.add({
    key:'settings',
    value: Settings._defaults
  })

});


db.open();

export default db;