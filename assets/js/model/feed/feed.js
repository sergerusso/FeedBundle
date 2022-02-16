// Created by Serge P <contact@sergerusso.com> on 10/18/16.
import {permissions} from "/assets/js/adapter.js"
import XMLParser from '/assets/js/lib/mod_xmlParser.min.js'
import _ from '/assets/js/lib/mod_underscore.js'
import db from '../../db.js'

class Feed{
  constructor(data = {}) {
    this.title = data.title
    this.url = data.url
    this.regexp = data.regexp
    this.id = data.id
    this.folderId = data.folderId || "unsorted"
    this.items = data.items || []
    this.extractText = data.extractText

    this.diagnosing = false
    this.broken = []
    this.noPerms = []

  }

  get isBroken(){
    return !this.isJailed && (this.broken.includes(this.url) || this.error)
  }
  get isJailed(){
    return this.noPerms.length
  }

  unreadCount() {
    return this.items.filter(item => !item.read).length
  }

  markRead(targetItem){
    let changed = false
    this.items.forEach(item =>{
        if((!targetItem || item == targetItem) && !item.read){
          item.read = true
          changed = true
        }
    })
    if(changed) this.setItems(this.items); //save
  }


  toggleMark(item){
    //todo cache table
    if(item.marked){
      delete item.marked
    }else{
      item.marked = parseInt((new Date).getTime()/1000)
    }

    this.setItems(this.items); //save
  }


  setItems(items){

    //slice_to = if items.length > Settings.feedSize then Settings.feedSize else items.length //todo use sttings
    let slice_to = items.length > 350 ? 350 : items.length;

    this.items = items.filter((item, idx)=>(
      idx <= slice_to || item.marked
    ))

    items = this.items.map(item => _.omit(_.clone(item), '$$hashKey'));
    return db.feeds.update(this.id, {items})


  }


  setTitle(title) {
    this.title = title
    db.feeds.update(this.id, {title})
  }
  setRegexp(regexp) {
    this.regexp = regexp
    db.feeds.update(this.id, {regexp})
  }


  setUrl(url) {
    this.url = url
    db.feeds.update(this.id, {url})
  }

  setFolderId(folderId) {
    this.folderId = folderId
    db.feeds.update(this.id, {folderId})
  }
  setExtractText(extractText) {
    this.extractText = extractText
    db.feeds.update(this.id, {extractText})
  }

  async fetch(){

    this.updating = true
    delete this.error

    let resp = await this.getXML(),
        urls = this.items.map(item => item.url),
        items = this.items.slice(0)

    if(resp.items && resp.items.length){

      resp.items.reverse().forEach(item=>{
        if(!item.url) return;
        /*
         if item.url.indexOf('http') != 0
            item.url = @url.replace(/^(https?:\/\/.+?)\/.+$/, '\$1') + item.url
         */
        //todo remove items with the same url, dif names
        if(!urls.includes(item.url)) {

          items.unshift(item)
        }else{
          //todo put it and remove the old one to preserve sticky posts
        }
      })


      this.setItems(items); //save

    }else{
      this.error = true
      this.diagnose(true)
    }
    this.updating = false

  }

  getXML(){

    return new Promise(callback => {
      //todo move to helper
      //todo querySelector from plain html

      const fileReaderReady = (reader) =>{
        return new Promise((resolve, reject) =>{
          reader.onload = ()=>resolve(reader.result)
          reader.onerror = ()=>reject(reader.error)
        })
      }


      fetch(this.url, {redirect:'error'}).then((resp)=>{
        //console.log(this.url, resp);


        let search = resp.headers.get('Content-Type').match(/charset=([^\n]+)/),
            encoding = search && search[1] || 'UTF-8';


        return resp.blob().then(blob=>{
          let reader = new FileReader()
          reader.readAsText(blob, encoding)
          return fileReaderReady(reader)
        })
      }).then ( text=>{
        let $items, title;

        try {

          if(this.regexp){
            let regexp = this.regexp//.replaceAll("\\", "\\")

            let matches = [...text.matchAll(new RegExp(regexp, 'ig'))]

            if(!matches.length) throw new Error('no match for regexp')

            let titleMatch = text.match(/<title>\s*([^>]+)\s*<\/title>/)
            title = titleMatch && titleMatch[1] || 'Site Title'
            $items = matches.map( (i, idx) => {
              let link = i.groups.url
              if(link.startsWith("/")){
                let urlObj = new URL(this.url)
                link = urlObj.origin + link
              }
              return {
                link,
                title: i.groups.title,
                pubDate: Date.now() - idx
              }

            })

          }else{ //xml
            if(XMLParser.validate(text) !== true) return callback({error: true});

            let $xml = XMLParser.parse(text, {ignoreAttributes: false});

            if($xml.rss){
              $items = $xml.rss.channel.item
              title = $xml.rss.channel.title
            }else if($xml.feed){
              $items = $xml.feed.entry
              title = $xml.feed.title

            }else{
              throw new Error('cannot find item element')
            }
          }


          //console.log(title, $items, $xml, this.url)

        }catch(e) {
          console.log(this.url, 'cannot parse', e)
          callback({error: true}, {resp: text})
          return
        }


        let result = {
          title,
          regexp: this.regexp,
          url: this.url,
          items: []
        }

        $items.forEach( item=>{

          let  date_str = item.pubDate || item.published || item.updated || item.date
          let  time = (new Date(date_str)).getTime() || (new Date).getTime()
          let  title = item.title
          //console.log(item.link)

          if(!date_str) {
            //console.log('no date', $this.find("link").text() || $this.find("link").attr('href'))
          }

          if(!title) return;

          result.items.push({
            title,
            url: item.link['@_href'] || item.link,
            date: parseInt(time / 1000)
          })
        })


        callback(result)
        typeof document !== 'undefined' && document.dispatchEvent(new Event('feedUpdated')); //todo use promise chain


      }).catch((err)=>{
        callback({error: true})

        typeof document !== 'undefined' && document.dispatchEvent(new Event('feedUpdated'));


      })

    })

  }

  async diagnose(short){

    if(this.diagnosing){
      return
    }

    this.broken = []
    this.noPerms = []

    let {noPerms, broken} = this

    let toTest = [
      this.url,
      ...this.items
        .slice(0, short ? 0 : 5)
        .map(i => new URL(i.url).origin)
    ]

    toTest = [...new Set(toTest)] //uniq

    this.diagnosing = true

    //todo concurrents
    for(let url of toTest){

      let result = await permissions.testURL(url)

      if(result === false) { //broken
        broken.push(url)
      }else if(result !== true){ //no permission
        noPerms.push(result)
      }

    }

    this.diagnosing = false

    Object.assign(this, {broken, noPerms})


    typeof document !== 'undefined' && document.dispatchEvent(new Event('feedUpdated'));

    //console.log('dia', this)

    return {broken, noPerms}


  }

  async fix(fn){

     if(this.isJailed){

      await permissions.request(this.noPerms)

      this.fetch()

    }else {
       fn(this)
    }

  }



}



export default Feed;




