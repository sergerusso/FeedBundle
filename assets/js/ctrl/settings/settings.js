import app from '../../core/ng-module.js'
import Settings from '../../model/settings.js'
app.controller('settingsCtrl',  function($scope, $location ){

  $scope.Settings = Settings



  $scope.$watch('Settings.updateEach', () => {
    Settings.updateEach = parseInt(Settings.updateEach, 10) || 0
    if (Settings.updateEach < 1) {
      return Settings.updateEach = 1
    }

    Settings.set('updateEach', Settings.updateEach)
  })

  //todo loop refactor
  $scope.$watchGroup(['Settings.viewportFontSize','Settings.viewportLineHeight','Settings.viewportFontWeight'], () => {

    Settings.set('viewportFontSize', Settings.viewportFontSize)
    Settings.set('viewportLineHeight', Settings.viewportLineHeight)
    Settings.set('viewportFontWeight', Settings.viewportFontWeight)
  })


  $scope.deleteAll = () => {
    if (!confirm('Are you sure?')) return;

    Dexie.delete('feedbundle').then(()=>location.reload());

  }
})

export default app