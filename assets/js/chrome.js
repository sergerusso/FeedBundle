//sergerusso 2018

import db from './db.js'
import Feeds from './model/feed/feeds.js'


chrome.browserAction.onClicked.addListener(function(tab) {

    chrome.tabs.get(window.tabOpen || 0, function (tab, b) {

      if(chrome.runtime.lastError || !tab){

        chrome.tabs.create({'url': chrome.extension.getURL('index.html')}, function(tab) {
          // Tab opened.
          window.tabOpen = tab.id
          //window.
        });

      }else{

        chrome.tabs.update(tab.id, {active: true});
        chrome.windows.update(tab.windowId, {focused: true});

      }

    })


});

if(chrome.webRequest) {
  //todo chrome ext id

  chrome.webRequest.onHeadersReceived.addListener(({responseHeaders, url}) => {

    return ({
      responseHeaders: responseHeaders.filter(({name}) => !['x-content-type-options' ,'x-frame-options', 'content-security-policy', 'access-control-allow-origin'].includes(name.toLowerCase())).concat(
        [{name:'Access-Control-Allow-Origin', value:'*'}]

      )
    })
  }, {urls: ['*://*/*']}, ['blocking', 'responseHeaders']);

  chrome.webRequest.onBeforeRedirect.addListener(({url, redirectUrl})=>{
    //console.log(url, redirectUrl);
    //todo update feedUrl
  }, {urls: ['*://*/*']});
  // chrome.webRequest.onHeadersReceived.addListener(({responseHeaders}) => {
  //   console.log(12321, {
  //     responseHeaders: responseHeaders.concat(
  //           [{name:'Access-Control-Allow-Origin', value:'*'}]
  //
  //     )
  //
  //   })
  //   responseHeaders =[{name:'Content-Type', value:'text/html'}];
  //   return {responseHeaders}
  //
  //
  // }, {urls: ['*://*/*']}, ['blocking', 'responseHeaders']);

/*  chrome.webRequest.onHeadersReceived.addListener(({responseHeaders}) => {

    let headers = {
      responseHeaders: responseHeaders.filter(({name}) => !['x-content-type-options' ,'x-frame-options', 'content-security-policy', 'access-control-allow-origin'].includes(name.toLowerCase())).concat(
        //[{name:'Access-Control-Allow-Origin', value:'chrome-extension://jeeenoibfemgniafnggmbhnioakgmdbm'}]

      )
    }

    console.log(headers)

    return headers
  }, {urls: ['*://!*!/!*']}, ['blocking', 'responseHeaders']);*/
}


const updatePermissions = ()=>{



  //todo promise chain
  //Error while running permissions.request: This function must be called during a user gesture
  db.feeds.allDocs({include_docs:true}).then((result)=>{
    let urls = result.rows.map(item=>item.doc.url);


    chrome.permissions.getAll(({origins})=>{
      console.log(origins)
      let toRemove = origins.filter(origin=>!urls.includes(origin))
      let toAdd = urls.filter(url=>!origins.includes(url))
      console.log({toRemove, toAdd});
      window.toAdd = toAdd

      chrome.permissions.remove({
        origins:toRemove
      }, ()=>{
        console.log(origins)
        chrome.permissions.request({
          permissions: ['webRequest', 'webRequestBlocking'],
          origins: toAdd
        }, function(granted) {
          // The callback argument will be true if the user granted the permissions.
          console.log('grd', granted)
        });

      })

    })
  })
}

/*setTimeout(function(){
  console.log(1)
  window.location.reload()
},10400);*/

chrome.alarms.create("upd feeds", {
  when: Date.now(),
  periodInMinutes: 5
})

chrome.alarms.onAlarm.addListener(()=>{
  console.log('updating')
  Feeds.fetch().then(feeds=>{
    console.log(feeds);
    let unread = feeds.reduce((sum, feed)=>sum+feed.unreadCount(), 0)
    setBadgetText(unread || "");
  })
})