window.readerCtrl = ($scope, Feeds, Storage, Settings)->
  window.scp = $scope;

  $scope.Feeds = Feeds
  $scope.Settings = Settings
  $scope.Storage = Storage
  $scope.reader = {}
  $scope.sidebar_expanded = true;
  Feeds.viewFrame = {}

  $scope.$watch 'Feeds.feeds', (-> Feeds.save()), true
  $scope.$watch 'Feeds.folders', (-> Feeds.save()), true

  $scope.edited_folder = false;
  $scope.$watch 'new_folder', (name)->
    return unless name
    unless $scope.edited_folder
      $scope.edited_folder = Feeds.new_folder(name)

    $scope.edited_folder.name = name




readerCtrl.$inject = ['$scope', 'Feeds', 'Storage', 'Settings']