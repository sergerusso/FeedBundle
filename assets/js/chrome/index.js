//sergerusso 2018

import db from '../db.js'
import Feeds from '../model/feed/feeds.js'
import errorReporting from './error-reporting.js'
import './request-interception.js'
import '../onerror.js'

window.onRuntimeMessage = async (request) => {
  if (request.errorReport) return errorReporting(request.errorReport);
}

chrome.runtime.onMessage.addListener(onRuntimeMessage);


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