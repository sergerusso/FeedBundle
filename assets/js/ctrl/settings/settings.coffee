# Created by Serge P <contact@sergerusso.com> on 10/19/16.

angular.module('feedBundle').controller 'settingsCtrl', ($scope, Folders, $location, Settings )->

  $scope.$watch 'Settings.update_each', ->
    Settings.update_each = parseInt(Settings.update_each, 10) || 0
    if Settings.update_each < 1
      Settings.update_each = 1
      return

    Settings.set('update_each', Settings.update_each)


  $scope.deleteAll = ->
    return unless confirm('Are you sure?')
    Settings.reset true
    db.reset().then ->
      location.reload()



