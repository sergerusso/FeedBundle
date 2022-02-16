/**
 * Created by Serge <contact@sergerusso.com> on 10/14/17.
 */


const prepareOrigins = (origins) => {

  return (Array.isArray(origins) ? origins : [origins]).map(origin=> {
    let host = new URL(origin).hostname

    return `*://${host}/*`
  })
}

const permissions = {
  request: (origins)=>{

    if(!window.chrome) return Promise.resolve()
    origins = prepareOrigins(origins)

    origins = [...new Set(origins)] //uniq

    return new Promise((resolve, reject)=>{
      chrome.permissions.request({
        permissions: ['declarativeNetRequestWithHostAccess'],
        origins
      }, async (granted)=> {

        //todo UPD investigate
        //chrome.runtime.getBackgroundPage(async(backgroundPage) =>{

          if(granted) {
            setTimeout(()=>{
              resolve()
            }, 750)
          }else{
            reject('no_permissions_granted')
          }

        //})

      })

    })

  },

  remove: (origins)=>{

    if(!window.chrome) return Promise.resolve()

    origins = prepareOrigins(origins)

    return new Promise((resolve, reject)=>{
      chrome.permissions.remove({
        permissions: ['declarativeNetRequestWithHostAccess'],
        origins
      }, (granted)=> {
        granted ? resolve() : reject();
      })

    })

  },

  contains: (origins)=>{
    if(!window.chrome) return Promise.resolve()

    origins = prepareOrigins(origins)

    return new Promise((resolve, reject)=>{
      chrome.permissions.contains({
        permissions: ['declarativeNetRequestWithHostAccess'],
        origins
      }, (result)=>{
        resolve(result)
      });

    })

  },

  testURL: async (url)=>{
    //first check if it's ok

    try{
      let r = await fetch(url, {
        method: "HEAD",
        redirect:'follow',
        mode: 'no-cors',
        headers:{
          origin:'',
          //'Content-Encoding':'identity'
        }
      })

    }catch(e){
      //not accessible
      return false
    }

    try{
      let r = await fetch(url, {
        method: "HEAD",
        redirect:'manual',
        headers:{
          origin:'',
          //'Content-Encoding':'identity'
        }
      })

      if(r.type == 'opaqueredirect'){
         return false
      }

    }catch(e){
      //no permissions
      return url
    }


    return true //all right


  }
}

const setBadgetText = (text)=>{

  text = text.toString()

  if(typeof chrome !== 'undefined'){
    chrome.action.setBadgeText({text})
  }else{

    win = require('nw.gui').Window.get()
    win.setBadgeLabel(text)
  }
}

const sendGlobalRuntimeMessage = (msg) => {

  if(self.onRuntimeMessage){
    self.onRuntimeMessage(msg);
  }else{
    chrome.runtime.sendMessage(msg).catch(console.error);
  }
}

export {permissions, setBadgetText, sendGlobalRuntimeMessage}