//sergerusso 2018
import Feeds from '../model/feed/feeds.js'
import Feed from '../model/feed/feed.js'
import Settings from '../model/settings.js'
import Folders from '../model/folder/folders.js'
import {permissions} from "/assets/js/adapter.js"

import app from '../core/ng-module.js'

let template = `
<div class="modal fade" id="feedModal" tabindex="-1" role="dialog" aria-labelledby="feedModalLabel" data-backdrop="static" >
    <div class="modal-dialog">
        <div class="modal-content">


            <div ng-switch on="feed.step">
                <!-- add feed -->
                <div ng-switch-default>
                    <form ng-submit="addFeed()">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                            <h4 class="modal-title">Add New Feed</h4>
                        </div>

                        <div class="modal-body">

                            <p class="alert alert-danger" ng-if="newFeedRedirect">
                                <i class="fa fa-warning"></i>
                                There was a redirect to
                                <a ng-href="{{newFeedRedirect}}" target="_blank">{{newFeedRedirect | url_host}}</a>.
                                 URL was updated, please try again.
                                                                            
                            </p>
                            
                            <label>URL:</label>
                            <input class='form-control' name="feed_url" ng-model='feed.new_feed_url' type="text" placeholder="https://.../rss"/>
                        
                            <label>
                              <input type="checkbox" ng-model='feed.use_regexp' style="position:relative; top:2px;"/> 
                                use <a href="https://www.google.com/search?q=regex+guide" target="_blank" style="color:inherit; text-decoration:underline">regex</a> to extract news from any url
                                <i class="fa fa-question-circle" 
                                tooltip 
                                data-placement="bottom" 
                                data-html="true"
                                data-original-title="Advanced feature that parses site's HTML with given rules and extracts titles and urls<br/><br/>Following named capturing groups should be present: <br/>title, url">
                               </i>
                              </label>
                            <textarea ng-if='feed.use_regexp' ng-model='feed.new_feed_regexp' class='form-control' rows="10"></textarea>

                            <br/>
                            <div ng-if="Feeds.items.length > 5 || true" class="suggestions">
                                <label>Suggestions:</label>
                                <br/>

                                <div class='dropdown ' ng-repeat="item in suggestions">
                                    <button class='btn btn-primary btn-xs dropdown-toggle' data-toggle="dropdown">
                                        {{item.name}}
                                        <small><i class="glyphicon glyphicon-chevron-down"></i></small>
                                    </button>


                                      <ul class="dropdown-menu" role="menu">
                                        <li ng-repeat="item in item.items">
                                            <a href ng-click="selectSuggestion(item[1])">
                                                {{item[0]}}
                                            </a>
                                        </li>

                                      </ul>
                              </div>


                            </div>

                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-default" type="button" data-dismiss="modal" aria-hidden="true">Cancel</button>
                            <button class="btn btn-primary" type="submit">
                                Next
                                <i class="fa fa-spin fa-refresh" ng-if="processing"></i>

                            </button>
                        </div>
                    </form>
                </div>

                <div ng-switch-when="edit">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">
                        Edit Feed
                        
                        </h4>
                    </div>
                    <div class="modal-body">
                    
                        <p class="alert alert-danger" ng-if="feed.item.isJailed">
                            <i class="fa fa-warning"></i>
                            This feed requires some additional permissions. 
                            <button class="btn btn-primary btn-xs" ng-click="updatePermissions()">Resolve</button>
                                                                         
                        </p>
                        <p class="alert alert-danger" ng-if="feed.item.isBroken">
                            <i class="fa fa-warning"></i>
                            Broken <a ng-href="{{feed.fields.url}}" target="_blank">feed url</a>!                                                                        
                        </p>
                        
                        
                        <p>
                            Name:
                            <input class='form-control' ng-model="feed.fields.title" type="text"/><br/>
                            
                            
                            <span ng-class="[feed.item.isBroken ? 'text-danger' : '']">
                                <i class="fa fa-warning" ng-if="feed.item.isBroken"></i>
                                
                                Url:
                                    
                            </span> 
                             
                            <input class='form-control' 
                                    ng-style="{
                                            borderColor: feed.item.isBroken ? '#a94442' : '',
                                            color: feed.item.isBroken ? '#a94442' : ''
                                            }" 
                                    ng-model="feed.fields.url" type="text"/> <!-- todo update bootstrap -->
                            
                            <label class="checkbox" style="font-weight: normal !important;">
                              <input type="checkbox" ng-model="feed.fields.extractText"> 
                              Extract main content 
                              <i class="fa fa-question-circle" 
                                tooltip 
                                data-placement="bottom" 
                                data-html="true"
                                data-original-title="By default FeedBundle displays full site when browsing, you can switch this option to show only main content.<br/><br/>It might not work properly with some sites.">
                               </i>
                            </label>
                            
                            
                            <label>
                              <input type="checkbox" ng-model='feed.fields.use_regexp' /> 
                                use <a href="https://www.google.com/search?q=regex+guide" target="_blank" style="color:inherit; text-decoration:underline">regex</a> to extract news from any url
                                <i class="fa fa-question-circle" 
                                tooltip 
                                data-placement="bottom" 
                                data-html="true"
                                data-original-title="Advanced feature that parses site's HTML with given rules and extracts titles and urls<br/><br/>Following named capturing groups should be present: <br/>title, url">
                               </i>
                              </label>
                            <textarea ng-if='feed.fields.use_regexp' ng-model='feed.fields.regexp' class='form-control' rows="10"></textarea>                            
                            
                            
                            <br/>
                            <!--<label class="checkbox">
                              <input type="checkbox" ng-model="feed.item.proxy"> Use proxy (<a href='https://developer.mozilla.org/en-US/docs/HTTP/X-Frame-Options' target='_blank' tooltip  data-placement="bottom"  data-original-title="It is for sites with no frame-browsing support (X-Frame-Options: SAMEORIGIN)">?</a>)
                            </label>-->
                        </p>
                        <div class='folders'>
                            <div class='title'><i class='glyphicon glyphicon-folder-open'></i> Folder: {{Folders.getById(feed.fields.folderId).name}}</div>
                            <div class='inner '>
                                <div class='list'>
                                    <div class='folder row' ng-repeat='folder in Folders.items' ng-hide="folder.isSystem">
                                        <div class='col-sm-10 name' ng-class='{selected: folder.id == feed.fields.folderId}' ng-click='feed.fields.folderId = folder.id'>{{folder.name}}</div>
                                        <div class='col-sm-2 text-right' ng-hide='folder.isSystem'>
                                            <i class='glyphicon glyphicon-pencil edit' ng-click='editFolder(folder)'> </i>
                                            <i class='glyphicon glyphicon-remove remove' ng-click='removeFolder(folder)'></i>
                                        </div>
                                    </div>
                                </div>
                                <div class='new-folder '>

                                    <form ng-submit="updateFolder()">
                                        <input class='form-control' id="editFolderInput" type='text' ng-model='editingFolder._name' placeholder='Enter new folder name...' />
                                        <i class='glyphicon glyphicon-ok' ng-click='updateFolder()'></i>
                                    </form>
                                </div>


                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div style="float:left">
                            <button class="btn btn-danger" type="button"  data-dismiss="modal" ng-click='remove(feed.item)'>Delete</button>
                                <!--todo style -->
                            &nbsp;<span ng-if="feed.item.diagnosing">
                                <i class="fa fa-spin fa-refresh" ></i>
                                checking status...
                            </span>
                        </div>
                        
                        <button class="btn btn-default" type="button" data-dismiss="modal" >Close</button>
                        <button class="btn btn-primary" type="submit" ng-click="saveFeed()" data-dismiss="modal">Save</button>
                    </div>
                </div>
                <!-- error -->
                <div ng-switch-when="error">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Error Occurred</h4>
                    </div>
                    <div class="modal-body">                    
                        <p>
                            No appropriate source found.
                        </p>
                        
                        <br/>
                        
                        
                        <small><i>  
                            <report-button result="'Thanks. It will be checked.'"
                                           message="'No feed data: ' + feed.new_feed_url">
                                                       
                                  <button 
                                      class="btn btn-xs btn-primary"
                                      ng-click="onSelect({value: value[0]})">
                                      Report
                                  </button>
                                  
                                  about this rss/atom link. 
                                
                            </report-button>
                        </i></small>
                      
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-default" ng-click="feed.step = 'add'">Back</button>
                        <button class="btn btn-default" data-dismiss="modal" aria-hidden="true">Close</button>
                    </div>
                </div>
                <div ng-switch-when="no_perm">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Error Occurred</h4>
                    </div>
                    <div class="modal-body">
                        <p>
                            Seems like you just denied access to the site. <br/>
                            Go back and try again.
                        </p>
                      
                      
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" ng-click="feed.step = 'add'">Back</button>
                    </div>
                </div>
            </div>

        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
`

app
  .directive('feedModal', ()=>({
    template,
    scope: {
      feed: '=',
    },
    controller: function($scope, $rootScope, $timeout){



      $scope.Folders = Folders;
      $scope.Feeds = Feeds;

      $scope.suggestions = [
        //todo add permission modal for gogole news; contains link to other sites
        /*{
          name: 'Google News',
          items: [
            ['World', 'https://news.google.com/news/rss/headlines/section/topic/WORLD'],
            ['Nation', 'https://news.google.com/news/rss/headlines/section/topic/NATION'],
            ['Business', 'https://news.google.com/news/rss/headlines/section/topic/BUSINESS'],
            ['Technology', 'https://news.google.com/news/rss/headlines/section/topic/TECHNOLOGY'],
            ['Science', 'https://news.google.com/news/rss/headlines/section/topic/SCIENCE'],
            ['Entertainment', 'https://news.google.com/news/rss/headlines/section/topic/ENTERTAINMENT'],
            ['Sports', 'https://news.google.com/news/rss/headlines/section/topic/SPORTS'],
            ['Health', 'https://news.google.com/news/rss/headlines/section/topic/HEALTH'],

          ]
        },*/
        {
          name: 'Reddit',
          items: [["/r/worldnews","https://www.reddit.com/r/worldnews.rss"],["/r/science","https://www.reddit.com/r/science.rss"],["/r/todayilearned","https://www.reddit.com/r/todayilearned.rss"],["/r/gaming","https://www.reddit.com/r/gaming.rss"],["/r/news","https://www.reddit.com/r/news.rss"],["/r/blog","https://www.reddit.com/r/blog.rss"],["/r/askscience","https://www.reddit.com/r/askscience.rss"],["/r/explainlikeimfive","https://www.reddit.com/r/explainlikeimfive.rss"],["/r/books","https://www.reddit.com/r/books.rss"],["/r/LifeProTips","https://www.reddit.com/r/LifeProTips.rss"],["/r/Jokes","https://www.reddit.com/r/Jokes.rss"],["/r/DIY","https://www.reddit.com/r/DIY.rss"],["/r/gadgets","https://www.reddit.com/r/gadgets.rss"],["/r/nottheonion","https://www.reddit.com/r/nottheonion.rss"],["/r/sports","https://www.reddit.com/r/sports.rss"],["/r/GetMotivated","https://www.reddit.com/r/GetMotivated.rss"],["/r/Documentaries","https://www.reddit.com/r/Documentaries.rss"],["/r/UpliftingNews","https://www.reddit.com/r/UpliftingNews.rss"],["/r/dataisbeautiful","https://www.reddit.com/r/dataisbeautiful.rss"],["/r/history","https://www.reddit.com/r/history.rss"],["/r/Futurology","https://www.reddit.com/r/Futurology.rss"],["/r/personalfinance","https://www.reddit.com/r/personalfinance.rss"],["/r/philosophy","https://www.reddit.com/r/philosophy.rss"],["/r/WritingPrompts","https://www.reddit.com/r/WritingPrompts.rss"],["/r/technology","https://www.reddit.com/r/technology.rss"],["/r/Fitness","https://www.reddit.com/r/Fitness.rss"],["/r/politics","https://www.reddit.com/r/politics.rss"],["/r/relationships","https://www.reddit.com/r/relationships.rss"],["/r/europe","https://www.reddit.com/r/europe.rss"],["/r/travel","https://www.reddit.com/r/travel.rss"],["/r/lifehacks","https://www.reddit.com/r/lifehacks.rss"],["/r/Android","https://www.reddit.com/r/Android.rss"],["/r/Games","https://www.reddit.com/r/Games.rss"],["/r/programming","https://www.reddit.com/r/programming.rss"],["/r/PS4","https://www.reddit.com/r/PS4.rss"],["/r/sex","https://www.reddit.com/r/sex.rss"],["/r/xboxone","https://www.reddit.com/r/xboxone.rss"],["/r/Bitcoin","https://www.reddit.com/r/Bitcoin.rss"]]
        },
        {
          name: 'Yahoo! News',
          items: [
            ['Latest News & Headlines', 'https://www.yahoo.com/news/rss'],
            ['Business Finance, Stock Market', 'https://finance.yahoo.com/news/rssindex'],
            ['Sports, Scores, Standings', 'https://sports.yahoo.com/cycling/rss.xml'],
            ['Entertainment', 'https://www.yahoo.com/entertainment/rss'],
            ['Lifestyle', 'https://www.yahoo.com/lifestyle/rss'],
          ]
        },
        // {
        //   name: ' Fox News',
        //   //JSON.stringify([...$0.querySelectorAll("a")].map( i => [i.innerText, "http:"+i.dataset.url]))
        //   items: [["Latest Headlines","http://feeds.foxnews.com/foxnews/latest.rss"],["Most Popular","http://feeds.foxnews.com/foxnews/most-popular.rss"],["Entertainment","http://feeds.foxnews.com/foxnews/entertainment.rss"],["Health","http://feeds.foxnews.com/foxnews/health.rss"],["Lifestyle","http://feeds.foxnews.com/foxnews/section/lifestyle.rss"],["Opinion","http://feeds.foxnews.com/foxnews/opinion.rss"],["Politics","http://feeds.foxnews.com/foxnews/politics.rss"],["Science","http://feeds.foxnews.com/foxnews/science.rss"],["Sports","http://feeds.foxnews.com/foxnews/sports.rss"],["Tech","http://feeds.foxnews.com/foxnews/tech.rss"],["Travel","http://feeds.foxnews.com/foxnews/internal/travel/mixed.rss"],["U.S.","http://feeds.foxnews.com/foxnews/national.rss"],["Video","http://feeds.foxnews.com/foxnews/video.rss"],["World","http://feeds.foxnews.com/foxnews/world.rss"]]
        // },
        // {
        //   name: 'HuffingtonPost',
        //   //JSON.stringify([...$0.querySelectorAll("a")].map( i => [i.innerText, i.href]))
        //   items: [["Asian Voices","https://www.huffingtonpost.com/section/asian-voices/feed.rss"],["Black Voices","https://www.huffingtonpost.com/section/black-voices/feed.rss"],["Books","https://www.huffingtonpost.com/section/books/feed.rss"],["Business","https://www.huffingtonpost.com/section/business/feed.rss"],["Celebrity","https://www.huffingtonpost.com/section/celebrity/feed.rss"],["College","https://www.huffingtonpost.com/section/college/feed.rss"],["Comedy","https://www.huffingtonpost.com/section/comedy/feed.rss"],["Crime","https://www.huffingtonpost.com/section/crime/feed.rss"],["Culture & Arts","https://www.huffingtonpost.com/section/arts/feed.rss"],["Divorce","https://www.huffingtonpost.com/section/divorce/feed.rss"],["Education","https://www.huffingtonpost.com/section/education/feed.rss"],["Entertainment","https://www.huffingtonpost.com/section/entertainment/feed.rss"],["Environment","https://www.huffingtonpost.com/section/green/feed.rss"],["Food & Drink","https://www.huffingtonpost.com/section/taste/feed.rss"],["Health","https://www.huffingtonpost.com/section/health/feed.rss"],["Home & Living","https://www.huffingtonpost.com/section/huffpost-home/feed.rss"],["HuffPost Code","https://www.huffingtonpost.com/section/huffpost-code/feed.rss"],["HuffPost Personal","https://www.huffingtonpost.com/section/huffpost-personal/feed.rss"],["Impact","https://www.huffingtonpost.com/section/impact/feed.rss"],["Latino Voices","https://www.huffingtonpost.com/section/latino-voices/feed.rss"],["Media","https://www.huffingtonpost.com/section/media/feed.rss"],["Money","https://www.huffingtonpost.com/section/money/feed.rss"],["OWN","https://www.huffingtonpost.com/section/own/feed.rss"],["Opinion","https://www.huffingtonpost.com/section/opinion/feed.rss"],["Parenting","https://www.huffingtonpost.com/section/parents/feed.rss"],["Politics","https://www.huffingtonpost.com/section/politics/feed.rss"],["Post 50","https://www.huffingtonpost.com/section/fifty/feed.rss"],["Queer Voices","https://www.huffingtonpost.com/section/queer-voices/feed.rss"],["Relationships","https://www.huffingtonpost.com/section/relationships/feed.rss"],["Religion","https://www.huffingtonpost.com/section/religion/feed.rss"],["Science","https://www.huffingtonpost.com/section/science/feed.rss"],["Sports","https://www.huffingtonpost.com/section/sports/feed.rss"],["Style & Beauty","https://www.huffingtonpost.com/section/style/feed.rss"],["TV & Film","https://www.huffingtonpost.com/section/tv/feed.rss"],["Tech","https://www.huffingtonpost.com/section/technology/feed.rss"],["Teen","https://www.huffingtonpost.com/section/teen/feed.rss"],["Travel","https://www.huffingtonpost.com/section/travel/feed.rss"],["U.S. News","https://www.huffingtonpost.com/section/us-news/feed.rss"],["Videos","https://www.huffingtonpost.com/section/video/feed.rss"],["Weddings","https://www.huffingtonpost.com/section/weddings/feed.rss"],["Weird News","https://www.huffingtonpost.com/section/weird-news/feed.rss"],["Wellness","https://www.huffingtonpost.com/section/healthy-living/feed.rss"],["Women","https://www.huffingtonpost.com/section/women/feed.rss"],["World News","https://www.huffingtonpost.com/section/world-news/feed.rss"]]
        // },
        // {
        //   name: 'Washington Post',
        //   //JSON.stringify([...$0.querySelectorAll("b > a.rss")].map( i => [i.innerText, i.href]))
        //   items: [["Politics","http://feeds.washingtonpost.com/rss/politics.rss"],["Opinions","http://feeds.washingtonpost.com/rss/opinions.rss"],["Local","http://feeds.washingtonpost.com/rss/local.rss"],["Sports","http://feeds.washingtonpost.com/rss/sports.rss"],["National","http://feeds.washingtonpost.com/rss/national.rss"],["World","http://feeds.washingtonpost.com/rss/world.rss"],["Business","http://feeds.washingtonpost.com/rss/business.rss"],["Lifestyle","http://feeds.washingtonpost.com/rss/lifestyle.rss"],["Entertainment","http://feeds.washingtonpost.com/rss/entertainment.rss"]]
        // },
        // {
        //   name: 'The Guardian',
        //   items: [["World news","https://www.theguardian.com/world/rss.rss"],["UK news","https://www.theguardian.com/uk-news/rss.rss"],["Science","https://www.theguardian.com/science/rss.rss"],["Cities","https://www.theguardian.com/cities/rss.rss"],["Global development","https://www.theguardian.com/global-development/rss.rss"],["Football","https://www.theguardian.com/football/rss.rss"],["Tech","https://www.theguardian.com/uk/technology/rss.rss"],["Business","https://www.theguardian.com/uk/business/rss.rss"],["Environment","https://www.theguardian.com/uk/environment/rss.rss"],["Obituaries","https://www.theguardian.com/tone/obituaries/rss.rss"], ['Sports','https://www.theguardian.com/sport/rss'], ['Culture','https://www.theguardian.com/culture/rss'], ['LifeStyle','https://www.theguardian.com/lifeandstyle/rss']]
        // },
        //
        // {
        //   name: 'ABCNews',
        //   items: [["Top Stories","http://feeds.abcnews.com/abcnews/topstories.rss"],["World Headlines","http://feeds.abcnews.com/abcnews/internationalheadlines.rss"],["US Headlines","http://feeds.abcnews.com/abcnews/usheadlines.rss"],["Politics Headlines","http://feeds.abcnews.com/abcnews/politicsheadlines.rss"],["The Blotter from Brian Ross","http://feeds.abcnews.com/abcnews/blotterheadlines.rss"],["Cuomo on the Case","http://feeds.abcnews.com/abcnews/thelawheadlines.rss"],["Money Headlines","http://feeds.abcnews.com/abcnews/moneyheadlines.rss"],["Technology Headlines","http://feeds.abcnews.com/abcnews/technologyheadlines.rss"],["Health Headlines","http://feeds.abcnews.com/abcnews/healthheadlines.rss"],["Entertainment Headlines","http://feeds.abcnews.com/abcnews/entertainmentheadlines.rss"],["Travel Headlines","http://feeds.abcnews.com/abcnews/travelheadlines.rss"],["ESPN Sports","http://feeds.abcnews.com/abcnews/sportsheadlines.rss"],["World News Headlines","http://feeds.abcnews.com/abcnews/worldnewsheadlines.rss"],["20/20 Headlines","http://feeds.abcnews.com/abcnews/2020headlines.rss"],["Primetime Headlines","http://feeds.abcnews.com/abcnews/primetimeheadlines.rss"],["Nightline Headlines","http://feeds.abcnews.com/abcnews/nightlineheadlines.rss"],["Good Morning America Headlines","http://feeds.abcnews.com/abcnews/gmaheadlines.rss"],["This Week Headlines","http://feeds.abcnews.com/abcnews/thisweekheadlines.rss"]]
        // },
        {
          name: 'BBC News',
          items: [["Top Stories","http://feeds.bbci.co.uk/news/rss.xml"],["World","http://feeds.bbci.co.uk/news/world/rss.xml"],["UK","http://feeds.bbci.co.uk/news/uk/rss.xml"],["Business","http://feeds.bbci.co.uk/news/business/rss.xml"],["Politics","http://feeds.bbci.co.uk/news/politics/rss.xml"],["Health","http://feeds.bbci.co.uk/news/health/rss.xml"],["Education & Family","http://feeds.bbci.co.uk/news/education/rss.xml"],["Science & Environment","http://feeds.bbci.co.uk/news/science_and_environment/rss.xml"],["Technology","http://feeds.bbci.co.uk/news/technology/rss.xml"],["Entertainment & Arts","http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml"]]
        },
        {
          name: 'CNBC',
          items: [["Top News","https://www.cnbc.com/id/100003114/device/rss/rss.html.rss"],["World News","https://www.cnbc.com/id/100727362/device/rss/rss.html.rss"],["US News","https://www.cnbc.com/id/15837362/device/rss/rss.html.rss"],["Asia News","https://www.cnbc.com/id/19832390/device/rss/rss.html.rss"],["Europe News","https://www.cnbc.com/id/19794221/device/rss/rss.html.rss"],["Business","https://www.cnbc.com/id/10001147/device/rss/rss.html.rss"],["Earnings","https://www.cnbc.com/id/15839135/device/rss/rss.html.rss"],["Commentary","https://www.cnbc.com/id/100370673/device/rss/rss.html.rss"],["Economy","https://www.cnbc.com/id/20910258/device/rss/rss.html.rss"],["Finance","https://www.cnbc.com/id/10000664/device/rss/rss.html.rss"],["Technology","https://www.cnbc.com/id/19854910/device/rss/rss.html.rss"],["Politics","https://www.cnbc.com/id/10000113/device/rss/rss.html.rss"],["Health Care","https://www.cnbc.com/id/10000108/device/rss/rss.html.rss"],["Real Estate","https://www.cnbc.com/id/10000115/device/rss/rss.html.rss"],["Wealth","https://www.cnbc.com/id/10001054/device/rss/rss.html.rss"],["Autos","https://www.cnbc.com/id/10000101/device/rss/rss.html.rss"],["Energy ","https://www.cnbc.com/id/19836768/device/rss/rss.html.rss"],["Media","https://www.cnbc.com/id/10000110/device/rss/rss.html.rss"],["Retail","https://www.cnbc.com/id/10000116/device/rss/rss.html.rss"],["Travel","https://www.cnbc.com/id/10000739/device/rss/rss.html.rss"],["Small Business","https://www.cnbc.com/id/44877279/device/rss/rss.html.rss"],["Investing","https://www.cnbc.com/id/15839069/device/rss/rss.html.rss"],["Financial Advisors","https://www.cnbc.com/id/100646281/device/rss/rss.html.rss"],["Personal Finance","https://www.cnbc.com/id/21324812/device/rss/rss.html.rss"],["Charting Asia","https://www.cnbc.com/id/23103686/device/rss/rss.html.rss"],["Funny Business","https://www.cnbc.com/id/17646093/device/rss/rss.html.rss"],["Market Insider","https://www.cnbc.com/id/20409666/device/rss/rss.html.rss"],["NetNet","https://www.cnbc.com/id/38818154/device/rss/rss.html.rss"],["Trader Talk","https://www.cnbc.com/id/20398120/device/rss/rss.html.rss"],["Buffett Watch","https://www.cnbc.com/id/19206666/device/rss/rss.html.rss"],["Top Video","https://www.cnbc.com/id/15839263/device/rss/rss.html.rss"],["Digital Workshop","https://www.cnbc.com/id/100616801/device/rss/rss.html.rss"],["Latest Video","https://www.cnbc.com/id/100004038/device/rss/rss.html.rss"],["CEO Interviews","https://www.cnbc.com/id/100004032/device/rss/rss.html.rss"],["Analyst Interviews","https://www.cnbc.com/id/100004033/device/rss/rss.html.rss"],["Must Watch","https://www.cnbc.com/id/101014894/device/rss/rss.html.rss"],["Squawk Box","https://www.cnbc.com/id/15838368/device/rss/rss.html.rss"],["Squawk on the Street","https://www.cnbc.com/id/15838381/device/rss/rss.html.rss"],["Power Lunch","https://www.cnbc.com/id/15838342/device/rss/rss.html.rss"],["Street Signs ","https://www.cnbc.com/id/15838408/device/rss/rss.html.rss"],["Options Action","https://www.cnbc.com/id/28282083/device/rss/rss.html.rss"],["Closing Bell","https://www.cnbc.com/id/15838421/device/rss/rss.html.rss"],["Fast Money","https://www.cnbc.com/id/15838499/device/rss/rss.html.rss"],["Mad Money","https://www.cnbc.com/id/15838459/device/rss/rss.html.rss"],["Kudlow Report","https://www.cnbc.com/id/15838446/device/rss/rss.html.rss"],["Futures Now","https://www.cnbc.com/id/48227449/device/rss/rss.html.rss"],["Suze Orman","https://www.cnbc.com/id/15838523/device/rss/rss.html.rss"],["Capital Connection","https://www.cnbc.com/id/17501773/device/rss/rss.html.rss"],["Squawk Box Europe","https://www.cnbc.com/id/15838652/device/rss/rss.html.rss"],["Worldwide Exchange","https://www.cnbc.com/id/15838355/device/rss/rss.html.rss"],["European Closing Bell","https://www.cnbc.com/id/15838629/device/rss/rss.html.rss"],["Squawk Box Asia","https://www.cnbc.com/id/15838831/device/rss/rss.html.rss"],["The Call","https://www.cnbc.com/id/37447855/device/rss/rss.html.rss"]]
        },
        /*{
          name: '',
          items: [
            '', '',
            '', '',
          ]
        },*/
      ]


      $scope.selectSuggestion = (url)=> $scope.feed.new_feed_url = url;


      $scope.addFeed = async (e) => {

        try {

          let url = $scope.feed.new_feed_url;
          let regexp = $scope.feed.use_regexp ? $scope.feed.new_feed_regexp : ''
          if (!url || $scope.processing) return false

          $scope.newFeedRedirect = false
          $scope.processing = true


          if(!$scope.feed.new_feed_url.match(/^https?:/)){
            url = $scope.feed.new_feed_url = "http://"+$scope.feed.new_feed_url;
          }

          await permissions.request(url);

          //check for redirect
          /*
          let test = await permissions.testURL(url)
          if(test && test !== true ){
            // redirect
            $timeout(()=>{
              $scope.feed.new_feed_url = test
              $scope.feed.step = 'new'
              $scope.newFeedRedirect = test
            })
            return
          }*/

          let feed = new Feed({url, regexp})
          let data = await feed.getXML();

          if(data.error){
            //try to find any link in possible html page
            let resp = await fetch(url, {headers:{Accept: 'application/rss+xml, application/xhtml+xml, text/html'}}).then(async(r) => await r.text())

            let dom = ( (dom, content) => (
              (dom.innerHTML = content), dom
            ))(document.createElement('html'), resp)

            let types = ['application/rss+xml', 'application/atom+xml', 'application/rdf+xml', 'application/rss', 'application/atom', 'application/rdf', 'text/rss+xml', 'text/atom+xml', 'text/rdf+xml', 'text/rss', 'text/atom', 'text/rdf' ]
            let link = dom.querySelector(`link[type="${types.join('.rss"],link[type="')}.rss"]`)
            if(link){
              feed.url = new URL(link.getAttribute('href'), url).href; //to absolute
              data = await feed.getXML();
              data.title = data.title || dom.querySelector('title').innerText;
            }

            if(data.error) throw "no_feed_data";
          }

          Feeds.insert(data).then(feed => {

            if (!Folders.getById(Settings.folder).isSystem) {
              feed.folderId = Settings.folder;
            }
            $rootScope.editFeed(feed);

            $scope.processing = false
            $scope.$apply()
          })



        }catch(e){
          if(!['no_permissions_granted', 'no_feed_data'].includes(e)){
            //todo report
          }

          $scope.$apply(()=>{
            $scope.processing = false
            $scope.feed.step = e == 'no_permissions_granted' ? "no_perm" : "error"
          })
        }


      }



      $scope.saveFeed = async () => {
        let {item, fields} = $scope.feed


        if (item.url != fields.url || item.isBroken) {

          try {
            await permissions.request(fields.url)
            //passed
            //item.fetch()
          }catch(e){
            console.log(e)
            alert('No permission given, url was not updated.')
            fields.url = item.url
          }

        }

        item.setTitle(fields.title)
        item.setRegexp(fields.regexp)
        item.setUrl(fields.url)
        item.setFolderId(fields.folderId)
        item.setExtractText(fields.extractText)

        //Settings.set("folder", item.folderId); //todo enable?
      }


      $scope.remove = (feed) => {
        //removePermission(feed.url) //todo check if still present
        Feeds.remove(feed)
      }

      //todo rewite _name
      $scope.editingFolder = {}
      $scope.editFolder = (folder) => {
        folder._name = folder.name
        $scope.editingFolder = folder
        $("#editFolderInput").focus()
      }

      $scope.updateFolder = () => {
        if ($scope.editingFolder._name) {
          if ($scope.editingFolder.id) {
            $scope.editingFolder.setName($scope.editingFolder._name)
          } else {
            Folders.add($scope.editingFolder._name)
              .then((folder) => {
                $scope.feed.fields.folderId = folder.id
                $scope.$apply()
              })
          }
        }

        $scope.editingFolder = {}
      }

      $scope.removeFolder = (folder) => {
        if ($scope.feed.fields.folderId == folder.id) {
          $scope.feed.fields.folderId = 'unsorted'
        }
        Folders.remove(folder)
      }

      $scope.updatePermissions = async () => {
        await permissions.request($scope.feed.item.noPerms)
        $scope.feed.item.diagnose()
        $scope.feed.item.fetch()//todo check
      }


      //open  modal
      $scope.$watch('feed.step', (newVal,oldVal) => {

        if(oldVal || !newVal) return;

        $("#feedModal").modal('show')
          .off('hidden.bs.modal')
          .one('shown.bs.modal', (e) => $(e.target).find("input").first().focus())
          .one('hidden.bs.modal', () => {
            $scope.$apply(() => {
              $scope.feed.step = null;
            })
          })

      }, true)


    }
  }))

export default angular