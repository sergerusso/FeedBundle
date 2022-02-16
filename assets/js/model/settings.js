//sergerusso 2018
import db from '../db.js'

export default {

  _defaults: {
    unread: 1,
    folder: "all",
    fullTitle: 1,
    updateEach: 10,
    feedSize: 100,
    viewportFontSize: 16,
    viewportLineHeight: 1.4,
    viewportFontWeight: 400,
    errorReporting: undefined
  },
  _settings:{},

  fetch(){
    return db.storage.get('settings').then( item =>{
      let settings = Object.assign({}, this._defaults, item.value);
      this._settings = settings;
      Object.assign(this, settings);
      return settings;
    })
  },

  set(key, value){
    this._settings[key] = value
    this[key] = value;
    return db.storage.update('settings', {value:this._settings})

  },

  reset(force){
    if (!force && !confirm('Are you sure?')) return;
    db.storage.update('settings', {value:this._defaults})

    this._settings = Object.assign({}, this._defaults);
    Object.assign(this, this._settings);

  }
}