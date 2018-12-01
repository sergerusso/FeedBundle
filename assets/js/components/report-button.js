//sergerusso 2018
import app from '../core/ng-module.js'
import mail from '../send-mail.js'

app
  .directive('reportButton', ()=>({
    template:`
            <div ng-click="report()">
                <div ng-if="sent">{{result}}</div>
                <ng-transclude ng-if="!sent"></ng-transclude>
            </div>          
            
    `,
    transclude: true,
    scope: {
      result: '=',
      message: '=',
    },
    controller: function($scope, $element, $rootScope, $timeout){

      $scope.sent = false

      $scope.report = () => {
        $scope.sent = true
        mail($scope.message)
      }

    }

  }))

export default angular