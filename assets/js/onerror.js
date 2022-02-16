//sergerusso 2018
import {sendGlobalRuntimeMessage} from "/assets/js/adapter.js" //todo check if eveerything imported everywhere

self.addEventListener('error', (e)=>{
  let errorReport = 'onerror: '+ String(e.error ? e.error.stack : e)
  sendGlobalRuntimeMessage({errorReport})
})

self.addEventListener("unhandledrejection", (event)=>{

  let {reason: {name, stack} = {}} = event || {};

  if(name == 'DatabaseClosedError') return

  if(event.reason == 'no_permissions_granted') return

  let errorReport = 'onunhandledrejection: '+ String( stack || event.reason || event.message)

  if(String(event.reason).includes("Browser is shutting down")) return

  sendGlobalRuntimeMessage({errorReport})
})
