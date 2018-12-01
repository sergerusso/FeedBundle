//sergerusso 2018
import app from '../core/ng-module.js'

app
  .directive('welcome', ()=>({
    template:`
        <div class="content">
        
          <div class="jumbotron">
            <h1>Feed<span class='color'>Bundle</span></h1>
            <p>online news reader<br/>
        
        
            <button class="share facebook" ng-click="share('facebook')">
              <i class="fa fa-facebook-square"></i>
              Share
            </button>
        
            <div class="extra">
              <div class="row">
        
                <!-- tuts and feedback buttons -->
                <div class="col-sm-6_ ">
        
                  <!-- feedback -->
        
        
                  <!-- tuts
                  <div class="btn-group">
                    <a class="btn btn-xs btn-default dropdown-toggle disabled" data-toggle="dropdown">Tutorials <span class="caret"></span></a>
                    <ul class="dropdown-menu tuts">
                      <li><a>It's<br/>coming</a></li>
                    </ul>
                  </div>  -->
        
                </div>
                 
              </div>
            </div>
        
          </div>
          
          <div class='copyright'>
            <a href="http://www.sergerusso.com/" browser-link target="_blank">by serge</a>
          </div>
        </div>            
            
    `,
    scope: {},
    controller: function($scope, $element, $rootScope, $timeout){


      $scope.share = (site) => {

        if(site == 'facebook'){
          let url = 'https://chrome.google.com/webstore/detail/feedbundle-online-rss-new/phpkhhdfcdlkcmakbfieencikecnddck'
          window.open("https://www.facebook.com/sharer.php?u="+url, "facebook_share", "menubar=no,width=550,height=450,scrollbars=no")
        }
      }
    }
  }))

export default angular