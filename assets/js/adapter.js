/**
 * Created by Serge <contact@sergerusso.com> on 10/14/17.
 */


const prepareOrigins = (origins) => {

  return (Array.isArray(origins) ? origins : [origins]).map(origin=> {
    let host = new URL(origin).hostname

    //not treat permission ask with this
    //host = "*."+ host.split(".").slice(-2).join(".") //wildcard + top domain

    return `*://${host}/*`
  })
}

//todo move out
const permissions = {
  request: (origins)=>{

    //requestPermission(angular.element($0).scope().$parent.$parent.$parent.Feeds.items.map(i=>i.url))
    if(!window.chrome) return Promise.resolve()
    //console.log(JSON.stringify(origins))
    origins = prepareOrigins(origins)

    origins = [...new Set(origins)] //uniq


    //console.log(origins)

    return new Promise((resolve, reject)=>{
      chrome.permissions.request({
        permissions: ['webRequest', 'webRequestBlocking'],
        origins
      }, async (granted)=> {

        chrome.runtime.getBackgroundPage(async(backgroundPage) =>{

          if(granted) {
            backgroundPage.updateWebHooks()
            resolve()
          }else{
            reject('no_permissions_granted')
          }

        })

      })

    })

  },

  remove: (origins)=>{

    if(!window.chrome) return Promise.resolve()

    origins = prepareOrigins(origins)

    return new Promise((resolve, reject)=>{
      chrome.permissions.remove({
        permissions: ['webRequest', 'webRequestBlocking'],
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
        permissions: ['webRequest', 'webRequestBlocking'],
        origins
      }, (result)=>{
        resolve(result)
      });

    })

  },

  testURL: async (url)=>{
    //first check if it's ok

    try{

      await fetch(url, {
        method: "HEAD",
        headers:{
          origin:'',
          //'Content-Encoding':'identity'
        }
      })

      return true //all right

    }catch(e){}


    //failed; next check for redirect

    const collectRedirects = async ()=>{
      //no location header in fetch; do logging in ext

      let redirectMap = {}
      let bgPage = await new Promise(resolve => chrome.runtime.getBackgroundPage(resolve))

      const beforeRedirect = (redirect) => { Object.assign(redirectMap, redirect) }
      const remove = () => bgPage.onRedirect = bgPage.onRedirect.filter(fn => fn != beforeRedirect())


      bgPage.onRedirect.push(beforeRedirect)

      return [redirectMap, remove]
    }

    let [redirectMap, removeRedirectListener] = await collectRedirects()

    let finalUrl

    try {

      await fetch(url, {mode: 'no-cors'})

      finalUrl = url

      //2 level redirects

      while(redirectMap[finalUrl]){

        if(finalUrl == redirectMap[finalUrl]) break

        finalUrl = redirectMap[finalUrl]
      }



    }catch(e){
      finalUrl = false //network err
    }

    removeRedirectListener() //todo check

    //if there is redirect it's skipped now
    if(finalUrl && await permissions.contains(finalUrl)){
      return true
    }


    return finalUrl;

  }
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


window.sendGlobalRuntimeMessage = (msg)=>{
  if(window.onRuntimeMessage){
    onRuntimeMessage(msg)
  }else{
    chrome.runtime.sendMessage(msg);
  }
}