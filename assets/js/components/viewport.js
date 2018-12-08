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
    
        <div class='' ng-show='broken'>
          <p><a ng-href="{{item.url}}" target="_blank">Content</a> cannot be loaded</p>          
        </div>
        
        <div class='' ng-show='noPerms'>
          <p>Some additional permissions required. </p>
          <a class="btn btn-primary btn-xs" ng-click="resolvePermissions()"  >Resolve</a>
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
        //todo https://news.yahoo.com/2019-best-places-revealed-glassdoor-180729801.html //bad html processing



        let $el = $element.find(".text-container")

        $el.scrollTop(0)


        let text

        try {
          text = await (await fetch($scope.item.url)).text()
        }catch(e){
          return testForErrors()
        }

        text = text.replace(/<\s*(script)[^><]*>[\s\S]*?<\s*\/\s*(script)\s*>/ig, '')


        let doc = (new DOMParser).parseFromString(text, 'text/html');

        [...doc.querySelectorAll("a,img")].forEach(el=>{
          let field = el.href ? 'href' : 'src'
          el[field] = new URL(el.getAttribute(field), $scope.item.url)

          if(el.href) el.target = '_blank'
        })


        let article = new Readability(doc).parse()
        let content = article.content

        content = `
             <div>
              <a class='header' href="${$scope.item.url}" target="_blank">${$scope.item.title}</a> 
              ${content}
             </div> `

        $el.html(content)

        $timeout(() => $scope.loading = false)



      }



      const loadContent = ()=> {
        if (!$scope.item) return

        $scope.loading = true

        $scope.broken = false
        $scope.noPerms = false

        if($scope.extractText){
          extractText()
        }
        //else iframe loads automatically

      }

      $element.find('iframe').on('load', async (e)=> {

        //no way to catch rejection x-frame-option rejection
        // so test it on each request :/

        if(!await testForErrors()){
          $timeout(() => $scope.loading = false)
        }


        //todo implementation for chrome; no way at the moment (open links in new tab)
        /*if (window.require) {
         $(elm[0].contentWindow.document).find("a").on('click', () => {
         if (this.href.indexOf('http') != 0) return;
         require('nw.gui').Shell.openExternal(this.href)
         return false
         })
         }*/

      })


      const testForErrors = async ()=>{
        let result = await permissions.testURL($scope.item.url)



        if(result == String(result)){
          $scope.noPerms = result
        }else if(result === false){
          $scope.broken = true
        }

        $scope.$apply()

        return $scope.broken || $scope.noPerms

      }


      $scope.$watchGroup(['item.url', 'extractText'], loadContent)


      $scope.resolvePermissions = async ()=>{

        await permissions.request($scope.noPerms)

        $scope.broken = false
        $scope.noPerms = false

        if($scope.extractText){

          extractText()

        }else{

          $element.find('iframe').each((idx, e) => {
            e.src = e.src
          }) //refresh

        }

        $scope.$apply()

      }


    }
  }))

export default angular