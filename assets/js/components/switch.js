//sergerusso 2018
import app from '../core/ng-module.js'

app
  .directive('switch', ()=>({
    template:`
            <div class="btn-group swither">
               <button ng-repeat='value in options' 
                class="btn btn-default"
                ng-disabled="value[0] == selected"
                ng-click="onSelect({value: value[0]})">
                {{value[1]}}
            </button>               
            </div>
    `,
    scope: {
      // same as '=customer'
      options: '=',
      selected: '=',
      onSelect: '&',
    },
    controller: function($scope, $element, $rootScope, $timeout){

    }
  }))

export default angular