//sergerusso 2018

import app from './ng-module.js'
import config from './config.js'
import beforeRun from './before-run.js'

import '../ctrl/settings/feeds.js'
import '../ctrl/settings/settings.js'
import '../ctrl/settings/import.js'
import '../components/feed-modal.js'
import '../components/viewport.js'
import '../components/switch.js'
import '../components/report-button.js'
import '../onerror.js'

app
  .config(config)
  .run(beforeRun)


angular.bootstrap(document.body, ['feedBundle']);