//sergerusso 2018
import Feeds from '../model/feed/feeds.js'
import Feed from '../model/feed/feed.js'
import Settings from '../model/settings.js'
import Folders from '../model/folder/folders.js'

import app from '../core/ng-module.js'

app
  .directive('viewport', ()=>({
    template:`
    <div class='viewport' clear-view hotkeys>
      <iframe id="viewFrame" 
              ng-src='{{extractText ? "" : item.url}}'
              ng-hide='loading || !item.url || extractText' 
              view-frame 
              _sandbox="allow-forms allow-scripts" 
              nwfaketop>  
      </iframe>
      <div id="viewFrame"    
           class="text-container"
           ng-style="fontStyle()"
           ng-hide='loading || !item.url' 
           ng-if="extractText">  
      </div>
      <div class='loading' ng-show='loading'>
        <img src='../../assets/images/loader-large.gif'/>
    
        <div class='' ng-show='loading_expired'>
          Something went wrong.<br/>
          <!-- <a href="#">Reload</a> TODO reload -->
    
          <!--Try to turn on <a href='#/settings/edit/{{Feeds.viewFrame.id}}'>proxy mode</a> for this feed.<br/>-->
          <!--<a href>Find the problem</a>-->
        </div>
      </div>
      <welcome class="welcome" ng-show="!loading && !item "></welcome>      
    </div>
    `,
    scope: {
      // same as '=customer'
      item: '=',
      extractText:'=',
      fontStyle:'=',

    },
    controller: function($scope, $element, $rootScope, $timeout){


      const extractText = async () => {
        let $el = $element.find(".text-container")


        let text = await (await fetch($scope.item.url)).text()
        let doc = (new DOMParser).parseFromString(text, 'text/html')
        let article = new Readability(doc).parse()
        let content = article.content

        content = `<h1><a href="${$scope.item.url}">${$scope.item.title}</a></h1> ${content}`
        content = content.replace(/<\s*(script)[^><]*>[\s\S]*?<\s*\/\s*(script)\s*>/ig, '');

        $el.html(content)

        $timeout(() => $scope.loading = false )

      }

      const setIframeTimeout = () => {

        let loading_limit = 30000

        clearInterval(window.frameLoaderInsperctor)

        $scope.loading_expired = false

        let start = Date.now()

        window.frameLoaderInsperctor = setInterval(() => {
          if (Date.now() - start >= loading_limit) {
            clearTimeout(window.frameLoaderInsperctor)

            $scope.$apply(() => $scope.loading_expired = true)
          }
        }, 2000);

      }


      $scope.$watchGroup(['item.url', 'extractText'], ()=> {
        if (!$scope.item) return

        $scope.loading = true

        if($scope.extractText){
          extractText()
        }else{
          setIframeTimeout()
        }
      })

      //todo request permission if needed
      //disable scripts


      $scope.$on('destroy', ()=> clearInterval(window.frameLoaderInsperctor))

      $element.find('iframe').on('load', ()=> {
        $timeout(() => $scope.loading = false)

        //todo implementation for chrome; no way at the moment (open links in new tab)
        if (window.require) {
          $(elm[0].contentWindow.document).find("a").on('click', () => {
            if (this.href.indexOf('http') != 0) return;
            require('nw.gui').Shell.openExternal(this.href)
            return false
          })
        }



      })

    }
  }))

export default angular