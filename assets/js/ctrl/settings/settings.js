import app from '../../core/ng-module.js'
import Settings from '../../model/settings.js'
app.controller('settingsCtrl',  function($scope, $location ){

  $scope.$watch('Settings.updateEach', () => {
    Settings.updateEach = parseInt(Settings.updateEach, 10) || 0
    if (Settings.updateEach < 1) {
      return Settings.updateEach = 1
    }

    Settings.set('updateEach', Settings.updateEach)
  })


  $scope.deleteAll = () => {
    if (!confirm('Are you sure?')) return;

    Dexie.delete('feedbundle').then(()=>location.reload());

  }
})

export default app