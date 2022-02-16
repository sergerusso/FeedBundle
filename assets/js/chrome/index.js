//sergerusso 2018

import db from '../db.js'
import Feeds from '../model/feed/feeds.js'
import errorReporting from './error-reporting.js'
import {setBadgetText} from "/assets/js/adapter.js"
import '/assets/js/onerror.js'   //TODO check/implement

self.onRuntimeMessage = (request) => {
  console.log('onRuntimeMessage', request)
  if (request.errorReport) errorReporting(request.errorReport);
  return true
}

chrome.runtime.onMessage.addListener(onRuntimeMessage);

chrome.action.onClicked.addListener(async function(tab) {

    let {tabOpen} = await chrome.storage.local.get('tabOpen')

    chrome.tabs.get(parseInt(tabOpen) || 0, function (tab, b) {

      if(chrome.runtime.lastError || !tab){

        chrome.tabs.create({'url': chrome.runtime.getURL('index.html')}, function(tab) {
          // Tab opened.
          chrome.storage.local.set({'tabOpen': String(tab.id)})
          //window.
        });

      }else{

        chrome.tabs.update(tab.id, {active: true});
        chrome.windows.update(tab.windowId, {focused: true});

      }

    })

});

chrome.runtime.onStartup.addListener(()=>{
  chrome.storage.local.set({'tabOpen': String(0)})
})



const updatePermissions = ()=>{

  //todo promise chain
  //Error while running permissions.request: This function must be called during a user gesture
  db.feeds.allDocs({include_docs:true}).then((result)=>{
    let urls = result.rows.map(item=>item.doc.url);


    chrome.permissions.getAll(({origins})=>{

      let toRemove = origins.filter(origin=>!urls.includes(origin))
      let toAdd = urls.filter(url=>!origins.includes(url))
      console.log({toRemove, toAdd});
      window.toAdd = toAdd

      chrome.permissions.remove({
        origins:toRemove
      }, ()=>{
        console.log(origins)
        chrome.permissions.request({
          permissions: ['declarativeNetRequestWithHostAccess'],
          origins: toAdd
        }, function(granted) {
          // The callback argument will be true if the user granted the permissions.
          console.log('grd', granted)
        });

      })

    })
  })
}

chrome.alarms.create("upd feeds", {
  when: Date.now(),
  periodInMinutes: 30
})


chrome.alarms.onAlarm.addListener(()=>{
  //todo check in perm mode
  console.log('updating')
  Feeds.fetch().then(()=>{
    let unread = Feeds.items.reduce((sum, feed)=>sum+feed.unreadCount(), 0)
    setBadgetText(unread || "");
  })
})
