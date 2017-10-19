/**
 * Created by Serge <contact@sergerusso.com> on 10/14/17.
 */

let db = {
  folders: new PouchDB('FeedBundle_folders', {auto_compaction: true}),
  feeds: new PouchDB('FeedBundle_feeds', {auto_compaction: true})
}


chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': chrome.extension.getURL('index.html')}, function(tab) {
    // Tab opened.
  });
});

if(chrome.webRequest) {
  //todo chrome ext id
  chrome.webRequest.onHeadersReceived.addListener(({responseHeaders}) => ({
    responseHeaders: responseHeaders.filter(({name}) => !['x-content-type-options' ,'x-frame-options', 'content-security-policy', 'access-control-allow-origin'].includes(name.toLowerCase())).concat(
      [{name:'Access-Control-Allow-Origin', value:'chrome-extension://jeeenoibfemgniafnggmbhnioakgmdbm'}]

    )

  }), {urls: ['*://*/*']}, ['blocking', 'responseHeaders']);
  chrome.webRequest.onHeadersReceived.addListener(({url, responseHeaders}) => console.log(url, {
    responseHeaders: responseHeaders.filter(({name}) => !['x-frame-options', 'content-security-policy', 'access-control-allow-origin'].includes(name.toLowerCase()))

  }), {urls: ['*://*/*']}, ['blocking', 'responseHeaders']);
}


updatePermissions = ()=>{


  //todo promise chain
  db.feeds.allDocs({include_docs:true}).then((result)=>{
    let urls = result.rows.map(item=>item.doc.url);


    chrome.permissions.getAll(({origins})=>{
      console.log(origins)
      let toRemove = origins.filter(origin=>!urls.includes(origin))
      let toAdd = urls.filter(url=>!origins.includes(url))
      console.log({toRemove, toAdd});

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