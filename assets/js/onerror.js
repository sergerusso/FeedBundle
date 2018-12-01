//sergerusso 2018


window.addEventListener('error', (e)=>{
  let errorReport = 'onerror: '+ String(e.error ? e.error.stack : e)
  sendGlobalRuntimeMessage({errorReport})
})

window.addEventListener("unhandledrejection", (event)=>{

  let {reason: {name, stack} = {}} = event || {};


  if(name == 'DatabaseClosedError' && !window.databaseClosedAlert) {
    window.databaseClosedAlert = true;
    alert("Database connection was closed.\nPlease reload the extension or restart browser.")
  }


  let errorReport = 'onunhandledrejection: '+ String( stack || event.reason || event.message)
  sendGlobalRuntimeMessage({errorReport})
})
