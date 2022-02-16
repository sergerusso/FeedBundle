//sergerusso 2018

let activeIds = []
//window.addEventListener('beforeunload', ()=>{
//  chrome.tabs.remove(activeIds)
//})

export default async (params, callback) => {
  let width = params.width || 600,
    height = params.height || 280,
    dialog = {
      content: params.content || "",
      input: params.input || "",
      className: params.className,
      autoResize: params.autoResize,
      buttons: params.buttons || [{text: 'Ok', primary: true}, {text: 'Cancel'}],
      checkbox: params.checkbox
    };

  let win = await chrome.windows.getCurrent()

  chrome.windows.create({
    url: chrome.runtime.getURL("dialog.html#" + height),
    type: 'popup',
    top: Math.round(win.height / 2 - height * 1.5 + win.top),
    left: Math.round(win.width / 2 - width / 2 + win.left),
    width: Math.round(width),
    height: Math.round(height + 22) //window header todo test windows
  }, async (win) => {

    let tab = win.tabs[0]

    const onLoaded = () => {
      dialog.winId = win.id;
      chrome.tabs.sendMessage(tab.id, {dialog}, (...args) => {
        activeIds = activeIds.filter(id => id != tab.id)
        callback(...args)
      });
    }
    const checkStatus = () => { //wait for loading
      chrome.tabs.get(tab.id, async (tab) => {
        if (tab.status == 'complete') {
          onLoaded()
        } else {
          setTimeout(checkStatus, 20)
        }
      })
    }

    activeIds.push(tab.id)

    setTimeout(checkStatus, 20)


  })


}