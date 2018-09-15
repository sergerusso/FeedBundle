//sergerusso 2018

import app from './ng-module.js'
import config from './config.js'
import beforeRun from './before-run.js'

import '../ctrl/settings/feeds.js'
import '../ctrl/settings/settings.js'
import '../ctrl/settings/import.js'
import '../components/feed-modal.js'

app
  .config(config)
  .run(beforeRun)


angular.bootstrap(document.body, ['feedBundle']);