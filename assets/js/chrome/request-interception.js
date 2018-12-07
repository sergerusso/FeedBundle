//sergerusso 2018
window.onRedirect = []


  //todo chrome ext id


  const onHeadersReceived = ({responseHeaders, url}) => {

    return ({
      responseHeaders: responseHeaders
        .filter(({name}) => !['x-content-type-options', 'x-frame-options', 'content-security-policy', 'access-control-allow-origin', 'link'].includes(name.toLowerCase()))
      // .concat(
      //   [{name:'Access-Control-Allow-Origin', value:'*'}]
      // )
    })
  }

  const onBeforeRedirect = ({url, redirectUrl}) => {

    onRedirect.forEach(fn => fn({[url]: redirectUrl}))

  }


  const updateWebHooks = () => {

    if(!chrome.webRequest) return

    console.log('hook initiated')
    chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceived)
    chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived, {urls: ['*://*/*']}, ['blocking', 'responseHeaders'])

    chrome.webRequest.onBeforeRedirect.removeListener(onBeforeRedirect)
    chrome.webRequest.onBeforeRedirect.addListener(onBeforeRedirect, {urls: ['*://*/*']}, ['responseHeaders'])
  }


  updateWebHooks()

  window.updateWebHooks = updateWebHooks


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
