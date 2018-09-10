//sergerusso 2018
import db from '../db.js'

export default {

  _defaults: {
    unread: 1,
    folder: "all",
    fullTitle: 0,
    updateEach: 10,
    feedSize: 100
  },
  _settings:{},

  fetch(){
    return db.storage.get('settings').then( item =>{
      let settings = item.value;
      this._settings = settings;
      Object.assign(this, settings);
      return settings;
    })
  },

  set(key, value){
    this._settings[key] = value
    this[key] = value;
    db.storage.update('settings', {value:this._settings})

  },

  reset(force){
    if (!force && !confirm('Are you sure?')) return;
    db.storage.update('settings', {value:this._defaults})

    this._settings = Object.assign({}, this._defaults);
    Object.assign(this, this._settings);

  }
}