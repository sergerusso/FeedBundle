//sergerusso 2018
export default (params, callback) => {
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


  chrome.windows.create({
    url: chrome.extension.getURL("dialog.html#" + height),
    type: 'popup',
    top: Math.round(screen.height / 2 - height * 1.5),
    left: Math.round(screen.width / 2 - width / 2),
    width: Math.round(width),
    height: Math.round(height + 22) //window header todo test windows
  }, async (win) => {

    let tab = win.tabs[0],


      onLoaded = () => {
        dialog.winId = win.id;
        chrome.tabs.sendMessage(tab.id, {dialog}, callback);
      },
      checkStatus = () => { //wait for loading
        chrome.tabs.get(tab.id, async (tab) => {

          if (tab.status == 'loading') {
            setTimeout(checkStatus, 20);
          } else {
            setTimeout(onLoaded, 100);
          }
        })
      };

    setTimeout(checkStatus, 20);
    //chrome.windows.remove(win.id);


  })


}