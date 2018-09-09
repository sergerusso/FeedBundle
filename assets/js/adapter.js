/**
 * Created by Serge <contact@sergerusso.com> on 10/14/17.
 */

const requestPermission = (origins)=>{

  if(!window.chrome) return Promise.resolve()
  //console.log(JSON.stringify(origins))
  origins = (Array.isArray(origins) ? origins : [origins]).map(origin=>(
    origin//.replace(/^https?:\/\/([^\/]+)(\/.*)?$/i, '*://$1/*')
  ))


  //console.log(origins)

  return new Promise((resolve, reject)=>{
    chrome.permissions.request({
      permissions: ['webRequest', 'webRequestBlocking'],
      origins: Array.isArray(origins) ? origins : [origins]
    }, (granted)=> {
      granted ? resolve() : reject();
      window.location.reload()
    })

  })

}

const removePermission = (origins)=>{

  if(!window.chrome) return Promise.resolve()

  origins = (Array.isArray(origins) ? origins : [origins]).map(origin=>(
    origin.replace(/^https?:\/\/([\/]+)(\/.*)?$/i, '*://$1/*')
  ))

  return new Promise((resolve, reject)=>{
    chrome.permissions.remove({
      permissions: ['webRequest', 'webRequestBlocking'],
      origins: Array.isArray(origins) ? origins : [origins]
    }, (granted)=> {
      granted ? resolve() : reject();
    })

  })

}

const setBadgetText = (text)=>{

  text = text.toString()

  if(window.chrome){
    chrome.browserAction.setBadgeText({text})
  }else{

    win = require('nw.gui').Window.get()
    win.setBadgeLabel(text)
  }
}