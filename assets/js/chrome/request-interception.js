//sergerusso 2018

//todo chrome ext id
chrome.webRequest.onHeadersReceived.addListener(({responseHeaders, url}) => {

  return ({
    responseHeaders: responseHeaders
      .filter(({name}) => !['x-content-type-options' ,'x-frame-options', 'content-security-policy', 'access-control-allow-origin'].includes(name.toLowerCase()))
    // .concat(
    //   [{name:'Access-Control-Allow-Origin', value:'*'}]
    // )
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
