export default function($scope, $location, $routeParams){
  window.scp2 = $scope;

  $scope.menu_class = (name) => ( {collapsed: $scope.view != name} )

  if ($routeParams.action != 'new') {
    $scope.view = $routeParams.action || 'feeds'
  }

}






