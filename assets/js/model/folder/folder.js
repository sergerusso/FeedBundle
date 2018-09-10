// Created by Serge P <contact@sergerusso.com> on 10/18/16.

import Feeds from '../feed/feeds.js'
import db from '../../db.js'


class Folder {

 constructor(data) {
   this.id = data.id
   this.name = data.name
   this.isSystem = data.isSystem
 }

 unreadCount() {
   let count = 0
   this.getFeeds().forEach(feed => count += feed.unreadCount())
   return count
 }

 getFeeds() {

   let feeds = Feeds.items.filter(feed => feed.folderId == this.id || this.id == 'all')

   //sort
   return feeds.sort(({items:[a = {}]}, {items:[b = {}]}) => (
     (b.date || 0) - (a.date || 0)
   ))
 }


 setName(name) {
   if (this.isSystem) throw "Couldnt set name for a system folder";

   this.name = name

   db.folders.update(this.id, {name})
 }
}

export default Folder



      


