
window.settingsRootCtrl = ($scope, Settings, $location, Feeds, Folders, $routeParams)->
  window.scp2 = $scope;

  $scope.Settings = Settings


  $scope.menu_class = (name)-> {collapsed: $scope.view != name }

  if $routeParams.action != 'new'
    $scope.view = $routeParams.action || 'feeds'





