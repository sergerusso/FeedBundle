// Created by Serge Russo <serge.rsb@gmail.com> on 10/18/16.

import Folder from './folder.js'
import FolderLatest from './latest.js'
import FolderBookmarks from './bookmarks.js'

import db from '../../db.js'

export default {
  systemFolders: [
    new Folder({id:"all", name:'All feeds', isSystem: true}),
    new FolderLatest,
    new FolderBookmarks,
    new Folder({id:"unsorted", name:'Unsorted', isSystem: true})
  ],

  items: [],

  add(name){
    if(!name) return;

    if(this.getByName(name)) return Promise.resolve(this.getByName(name));

    let json = {
      name: name
    };
    return db.folders.add(json).then( result =>{
      json.id = result;
      let folder = new Folder(json)
      this.items.push (folder)
      return folder;
    } )

  },

  remove(folder){
    if(!confirm('Are you sure?')) return;

    folder.getFeeds().forEach( feed=> feed.setFolderId('unsorted') )
    console.log(this.items)
    this.items = this.items.filter( item => item != folder)

    return db.folders.delete(folder.id)

  },

  fetch(){
    this.items = this.systemFolders.slice(0)
    return db.folders.toArray().then( result =>{
      result.forEach( item => this.items.push( new Folder(item) ))
      return this.items;
    });
  },

  getById(id){
    return this.items.find((folder)=> folder.id == id)
  },

  getByName(name){
    return this.items.find((folder)=> folder.name == name)
  }
}


