// Created by Serge P <contact@sergerusso.com> on 10/18/16.

import db from '../../db.js'

//todo remove items with the same url, dif names
class Feed{
  constructor(data = {}) {
    this.title = data.title
    this.url = data.url
    this.id = data.id
    this.folderId = data.folderId || "unsorted"
    this.items = data.items || []
    this.extractText = data.extractText
  }


  unreadCount() {
    return this.items.filter(item => !item.read).length
  }

  markRead(targetItem){
    this.items.forEach(item =>{
        if(!targetItem || item == targetItem){
          item.read = true
        }
    })
    this.setItems(this.items); //save
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
        titles = this.items.map(item => item.title),
        items = this.items.slice(0)

    if(resp.items && resp.items.length){

      resp.items.reverse().forEach(item=>{
        if(!item.url) return;
        /*
         if item.url.indexOf('http') != 0
            item.url = @url.replace(/^(https?:\/\/.+?)\/.+$/, '\$1') + item.url
         */
        if(!titles.includes(item.title)) {
          items.unshift(item)
        }
      })


      this.setItems(items); //save

    }else{
      this.error = true
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


  //, {redirect:'manual'}
      fetch(this.url, {}).then((resp)=>{
        //console.log(this.url, resp);


        let search = resp.headers.get('Content-Type').match(/charset=([^\n]+)/),
            encoding = search && search[1] || 'UTF-8';


        return resp.blob().then(blob=>{
          let reader = new FileReader()
          reader.readAsText(blob, encoding)
          return fileReaderReady(reader)
        })
      }).then ( text=>{
      //$.get(this.url).then(resp=>{
        let $xml, $items,result;
        //let text =resp
        try {
          $xml = $($.parseXML(text));
          $items = $xml.find("item,entry")
        }catch(e) {
          console.log(this.url, 'cannot parse xml')
          callback({error: true}, {resp: text})
          return
        }
        ;
        //console.log($items, $xml.find('title:first').text());
        result = {
          title: $xml.find('title:first').text(),
          url: this.url,
          items: []
        }

        $items.toArray().forEach( item=>{
          let $this = $(item),
            date_str = $this.find("pubDate").text() || $this.find("published").text() || $this.find("updated").text() || $this.find("date").text(),
            time = (new Date(date_str)).getTime() || (new Date).getTime(),
            title = $this.children("title").text();

          if(!date_str) {
            //console.log('no date', $this.find("link").text() || $this.find("link").attr('href'))
          }

          if(!title) return;

          result.items.push({
            title,
            url: $this.children("link").text() || $this.children("link").attr('href'),
            date: parseInt(time / 1000)
          })
        })

        callback(result)
        document.dispatchEvent(new Event('feedUpdated')); //todo use promise chain


      }, (err)=>{
        callback({error: true})
        document.dispatchEvent(new Event('feedUpdated'));
      })

    })

  }

}

export default Feed;



    
    