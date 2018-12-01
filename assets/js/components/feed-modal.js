//sergerusso 2018
import Feeds from '../model/feed/feeds.js'
import Feed from '../model/feed/feed.js'
import Settings from '../model/settings.js'
import Folders from '../model/folder/folders.js'

import app from '../core/ng-module.js'

let template = `
<div class="modal fade" id="feedModal" tabindex="-1" role="dialog" aria-labelledby="feedModalLabel" >
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

                            <label>URL:</label>
                            <input class='form-control' name="feed_url" ng-model='feed.new_feed_url' type="text" placeholder="https://..."/>
                            <div class="text-right">
                                <small>
                                    <i>
                                        rss link can also be automatically extracted from a site if present
                                    </i>
                                </small>
                            </div>

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
                        <h4 class="modal-title">Edit Feed</h4>
                    </div>
                    <div class="modal-body">
                        <p>
                            Name: <input class='form-control' ng-model="feed.fields.title" type="text"/><br/>
                            Url: <input class='form-control' ng-model="feed.fields.url" type="text"/>
                            
                            <label class="checkbox" style="font-weight: normal !important;">
                              <input type="checkbox" ng-model="feed.fields.extractText"> 
                              Extract main content 
                              <i class="fa fa-question-circle" 
                                tooltip 
                                data-placement="bottom" 
                                data-html="true"
                                data-original-title="By default FeedBundle loads full site when browsing, you can switch this option to load only main content.<br/>It might not work properly with some sites.">
                               </i>
                            </label>
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
                        <button class="btn btn-danger" type="button" style="float:left" data-dismiss="modal" ng-click='remove(feed.item)'>Delete</button>
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
                            No appropriate source found. Try to use direct link to RSS/ATOM feed.
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
                                  
                                  if you have the right link and still get this error.
                                
                            </report-button>
                        </i></small>
                      
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-default" ng-click="feed.step = 'add'">Back</button>
                        <button class="btn btn-default" data-dismiss="modal" aria-hidden="true">Close</button>
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
      // same as '=customer'
      feed: '=',
    },
    controller: function($scope, $rootScope){



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
          name: 'Yahoo! News',
          items: [
            ['Latest News & Headlines', 'https://www.yahoo.com/news/rss'],
            ['Business Finance, Stock Market', 'https://finance.yahoo.com/news/rssindex'],
            ['Sports, Scores, Standings', 'https://sports.yahoo.com/cycling/rss.xml'],
            ['Entertainment', 'https://www.yahoo.com/entertainment/rss'],
            ['Lifestyle', 'https://www.yahoo.com/lifestyle/rss'],
          ]
        },

        {
          name: 'CNN',
          items: [
            ['Top Stories', 'http://rss.cnn.com/rss/cnn_topstories.rss'],
            ['World', 'http://rss.cnn.com/rss/cnn_world.rss'],
            ['U.S.', 'http://rss.cnn.com/rss/cnn_us.rss'],
            ['Business (CNNMoney.com)', 'http://rss.cnn.com/rss/money_latest.rss'],
            ['Politics', 'http://rss.cnn.com/rss/cnn_allpolitics.rss'],
            ['Technology', 'http://rss.cnn.com/rss/cnn_tech.rss'],
            ['Health', 'http://rss.cnn.com/rss/cnn_health.rss'],
            ['Entertainment', 'http://rss.cnn.com/rss/cnn_showbiz.rss'],
            ['Travel', 'http://rss.cnn.com/rss/cnn_travel.rss'],
            ['Video', 'http://rss.cnn.com/rss/cnn_freevideo.rss'],
            ['CNN 10', 'http://rss.cnn.com/services/podcasting/cnn10/rss.xml'],
            ['Most Recent', 'http://rss.cnn.com/rss/cnn_latest.rss'],
            ['CNN Underscored', 'http://rss.cnn.com/cnn-underscored.rss'],
          ]
        },
        {
          name: ' Fox News',
          //JSON.stringify([...$0.querySelectorAll("a")].map( i => [i.innerText, "http:"+i.dataset.url]))
          items: [["Latest Headlines","http://feeds.foxnews.com/foxnews/latest"],["Most Popular","http://feeds.foxnews.com/foxnews/most-popular"],["Entertainment","http://feeds.foxnews.com/foxnews/entertainment"],["Health","http://feeds.foxnews.com/foxnews/health"],["Lifestyle","http://feeds.foxnews.com/foxnews/section/lifestyle"],["Opinion","http://feeds.foxnews.com/foxnews/opinion"],["Politics","http://feeds.foxnews.com/foxnews/politics"],["Science","http://feeds.foxnews.com/foxnews/science"],["Sports","http://feeds.foxnews.com/foxnews/sports"],["Tech","http://feeds.foxnews.com/foxnews/tech"],["Travel","http://feeds.foxnews.com/foxnews/internal/travel/mixed"],["U.S.","http://feeds.foxnews.com/foxnews/national"],["Video","http://feeds.foxnews.com/foxnews/video"],["World","http://feeds.foxnews.com/foxnews/world"]]
        },
        {
          name: 'HuffingtonPost',
          //JSON.stringify([...$0.querySelectorAll("a")].map( i => [i.innerText, i.href]))
          items: [["Asian Voices","https://www.huffingtonpost.com/section/asian-voices/feed"],["Black Voices","https://www.huffingtonpost.com/section/black-voices/feed"],["Books","https://www.huffingtonpost.com/section/books/feed"],["Business","https://www.huffingtonpost.com/section/business/feed"],["Celebrity","https://www.huffingtonpost.com/section/celebrity/feed"],["College","https://www.huffingtonpost.com/section/college/feed"],["Comedy","https://www.huffingtonpost.com/section/comedy/feed"],["Crime","https://www.huffingtonpost.com/section/crime/feed"],["Culture & Arts","https://www.huffingtonpost.com/section/arts/feed"],["Divorce","https://www.huffingtonpost.com/section/divorce/feed"],["Education","https://www.huffingtonpost.com/section/education/feed"],["Entertainment","https://www.huffingtonpost.com/section/entertainment/feed"],["Environment","https://www.huffingtonpost.com/section/green/feed"],["Food & Drink","https://www.huffingtonpost.com/section/taste/feed"],["Health","https://www.huffingtonpost.com/section/health/feed"],["Home & Living","https://www.huffingtonpost.com/section/huffpost-home/feed"],["HuffPost Code","https://www.huffingtonpost.com/section/huffpost-code/feed"],["HuffPost Personal","https://www.huffingtonpost.com/section/huffpost-personal/feed"],["Impact","https://www.huffingtonpost.com/section/impact/feed"],["Latino Voices","https://www.huffingtonpost.com/section/latino-voices/feed"],["Media","https://www.huffingtonpost.com/section/media/feed"],["Money","https://www.huffingtonpost.com/section/money/feed"],["OWN","https://www.huffingtonpost.com/section/own/feed"],["Opinion","https://www.huffingtonpost.com/section/opinion/feed"],["Parenting","https://www.huffingtonpost.com/section/parents/feed"],["Politics","https://www.huffingtonpost.com/section/politics/feed"],["Post 50","https://www.huffingtonpost.com/section/fifty/feed"],["Queer Voices","https://www.huffingtonpost.com/section/queer-voices/feed"],["Relationships","https://www.huffingtonpost.com/section/relationships/feed"],["Religion","https://www.huffingtonpost.com/section/religion/feed"],["Science","https://www.huffingtonpost.com/section/science/feed"],["Sports","https://www.huffingtonpost.com/section/sports/feed"],["Style & Beauty","https://www.huffingtonpost.com/section/style/feed"],["TV & Film","https://www.huffingtonpost.com/section/tv/feed"],["Tech","https://www.huffingtonpost.com/section/technology/feed"],["Teen","https://www.huffingtonpost.com/section/teen/feed"],["Travel","https://www.huffingtonpost.com/section/travel/feed"],["U.S. News","https://www.huffingtonpost.com/section/us-news/feed"],["Videos","https://www.huffingtonpost.com/section/video/feed"],["Weddings","https://www.huffingtonpost.com/section/weddings/feed"],["Weird News","https://www.huffingtonpost.com/section/weird-news/feed"],["Wellness","https://www.huffingtonpost.com/section/healthy-living/feed"],["Women","https://www.huffingtonpost.com/section/women/feed"],["World News","https://www.huffingtonpost.com/section/world-news/feed"]]
        },
        {
          name: 'Washington Post',
          //JSON.stringify([...$0.querySelectorAll("b > a.rss")].map( i => [i.innerText, i.href]))
          items: [["Politics","http://feeds.washingtonpost.com/rss/politics"],["Opinions","http://feeds.washingtonpost.com/rss/opinions"],["Local","http://feeds.washingtonpost.com/rss/local"],["Sports","http://feeds.washingtonpost.com/rss/sports"],["National","http://feeds.washingtonpost.com/rss/national"],["World","http://feeds.washingtonpost.com/rss/world"],["Business","http://feeds.washingtonpost.com/rss/business"],["Lifestyle","http://feeds.washingtonpost.com/rss/lifestyle"],["Entertainment","http://feeds.washingtonpost.com/rss/entertainment"]]
        },
        {
          name: 'The Guardian',
          items: [["World news","https://www.theguardian.com/world/rss"],["UK news","https://www.theguardian.com/uk-news/rss"],["Science","https://www.theguardian.com/science/rss"],["Cities","https://www.theguardian.com/cities/rss"],["Global development","https://www.theguardian.com/global-development/rss"],["Football","https://www.theguardian.com/football/rss"],["Tech","https://www.theguardian.com/uk/technology/rss"],["Business","https://www.theguardian.com/uk/business/rss"],["Environment","https://www.theguardian.com/uk/environment/rss"],["Obituaries","https://www.theguardian.com/tone/obituaries/rss"], ['Sports','https://www.theguardian.com/sport/rss'], ['Culture','https://www.theguardian.com/culture/rss'], ['LifeStyle','https://www.theguardian.com/lifeandstyle/rss']]
        },
        {
          name: 'WSJ',
          items: [["Opinion","http://www.wsj.com/xml/rss/3_7041.xml"],["World News","http://www.wsj.com/xml/rss/3_7085.xml"],["U.S. Business","http://www.wsj.com/xml/rss/3_7014.xml"],["Markets News","http://www.wsj.com/xml/rss/3_7031.xml"],["Technology: What's News","http://www.wsj.com/xml/rss/3_7455.xml"],["Lifestyle","http://www.wsj.com/xml/rss/3_7201.xml"]]
        },
        {
          name: 'ABCNews',
          items: [["Top Stories","http://feeds.abcnews.com/abcnews/topstories"],["World Headlines","http://feeds.abcnews.com/abcnews/internationalheadlines"],["US Headlines","http://feeds.abcnews.com/abcnews/usheadlines"],["Politics Headlines","http://feeds.abcnews.com/abcnews/politicsheadlines"],["The Blotter from Brian Ross","http://feeds.abcnews.com/abcnews/blotterheadlines"],["Cuomo on the Case","http://feeds.abcnews.com/abcnews/thelawheadlines"],["Money Headlines","http://feeds.abcnews.com/abcnews/moneyheadlines"],["Technology Headlines","http://feeds.abcnews.com/abcnews/technologyheadlines"],["Health Headlines","http://feeds.abcnews.com/abcnews/healthheadlines"],["Entertainment Headlines","http://feeds.abcnews.com/abcnews/entertainmentheadlines"],["Travel Headlines","http://feeds.abcnews.com/abcnews/travelheadlines"],["ESPN Sports","http://feeds.abcnews.com/abcnews/sportsheadlines"],["World News Headlines","http://feeds.abcnews.com/abcnews/worldnewsheadlines"],["20/20 Headlines","http://feeds.abcnews.com/abcnews/2020headlines"],["Primetime Headlines","http://feeds.abcnews.com/abcnews/primetimeheadlines"],["Nightline Headlines","http://feeds.abcnews.com/abcnews/nightlineheadlines"],["Good Morning America Headlines","http://feeds.abcnews.com/abcnews/gmaheadlines"],["This Week Headlines","http://feeds.abcnews.com/abcnews/thisweekheadlines"]]
        },{
          name: 'CNBC',
          items: [["Top News","https://www.cnbc.com/id/100003114/device/rss/rss.html"],["World News","https://www.cnbc.com/id/100727362/device/rss/rss.html"],["US News","https://www.cnbc.com/id/15837362/device/rss/rss.html"],["Asia News","https://www.cnbc.com/id/19832390/device/rss/rss.html"],["Europe News","https://www.cnbc.com/id/19794221/device/rss/rss.html"],["Business","https://www.cnbc.com/id/10001147/device/rss/rss.html"],["Earnings","https://www.cnbc.com/id/15839135/device/rss/rss.html"],["Commentary","https://www.cnbc.com/id/100370673/device/rss/rss.html"],["Economy","https://www.cnbc.com/id/20910258/device/rss/rss.html"],["Finance","https://www.cnbc.com/id/10000664/device/rss/rss.html"],["Technology","https://www.cnbc.com/id/19854910/device/rss/rss.html"],["Politics","https://www.cnbc.com/id/10000113/device/rss/rss.html"],["Health Care","https://www.cnbc.com/id/10000108/device/rss/rss.html"],["Real Estate","https://www.cnbc.com/id/10000115/device/rss/rss.html"],["Wealth","https://www.cnbc.com/id/10001054/device/rss/rss.html"],["Autos","https://www.cnbc.com/id/10000101/device/rss/rss.html"],["Energy ","https://www.cnbc.com/id/19836768/device/rss/rss.html"],["Media","https://www.cnbc.com/id/10000110/device/rss/rss.html"],["Retail","https://www.cnbc.com/id/10000116/device/rss/rss.html"],["Travel","https://www.cnbc.com/id/10000739/device/rss/rss.html"],["Small Business","https://www.cnbc.com/id/44877279/device/rss/rss.html"],["Investing","https://www.cnbc.com/id/15839069/device/rss/rss.html"],["Financial Advisors","https://www.cnbc.com/id/100646281/device/rss/rss.html"],["Personal Finance","https://www.cnbc.com/id/21324812/device/rss/rss.html"],["Charting Asia","https://www.cnbc.com/id/23103686/device/rss/rss.html"],["Funny Business","https://www.cnbc.com/id/17646093/device/rss/rss.html"],["Market Insider","https://www.cnbc.com/id/20409666/device/rss/rss.html"],["NetNet","https://www.cnbc.com/id/38818154/device/rss/rss.html"],["Trader Talk","https://www.cnbc.com/id/20398120/device/rss/rss.html"],["Buffett Watch","https://www.cnbc.com/id/19206666/device/rss/rss.html"],["Top Video","https://www.cnbc.com/id/15839263/device/rss/rss.html"],["Digital Workshop","https://www.cnbc.com/id/100616801/device/rss/rss.html"],["Latest Video","https://www.cnbc.com/id/100004038/device/rss/rss.html"],["CEO Interviews","https://www.cnbc.com/id/100004032/device/rss/rss.html"],["Analyst Interviews","https://www.cnbc.com/id/100004033/device/rss/rss.html"],["Must Watch","https://www.cnbc.com/id/101014894/device/rss/rss.html"],["Squawk Box","https://www.cnbc.com/id/15838368/device/rss/rss.html"],["Squawk on the Street","https://www.cnbc.com/id/15838381/device/rss/rss.html"],["Power Lunch","https://www.cnbc.com/id/15838342/device/rss/rss.html"],["Street Signs ","https://www.cnbc.com/id/15838408/device/rss/rss.html"],["Options Action","https://www.cnbc.com/id/28282083/device/rss/rss.html"],["Closing Bell","https://www.cnbc.com/id/15838421/device/rss/rss.html"],["Fast Money","https://www.cnbc.com/id/15838499/device/rss/rss.html"],["Mad Money","https://www.cnbc.com/id/15838459/device/rss/rss.html"],["Kudlow Report","https://www.cnbc.com/id/15838446/device/rss/rss.html"],["Futures Now","https://www.cnbc.com/id/48227449/device/rss/rss.html"],["Suze Orman","https://www.cnbc.com/id/15838523/device/rss/rss.html"],["Capital Connection","https://www.cnbc.com/id/17501773/device/rss/rss.html"],["Squawk Box Europe","https://www.cnbc.com/id/15838652/device/rss/rss.html"],["Worldwide Exchange","https://www.cnbc.com/id/15838355/device/rss/rss.html"],["European Closing Bell","https://www.cnbc.com/id/15838629/device/rss/rss.html"],["Squawk Box Asia","https://www.cnbc.com/id/15838831/device/rss/rss.html"],["The Call","https://www.cnbc.com/id/37447855/device/rss/rss.html"]]
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
          if (!url || $scope.processing) return false;


          if(!$scope.feed.new_feed_url.match(/^https?:/)){
            url = $scope.feed.new_feed_url = "http://"+$scope.feed.new_feed_url;
          }

          await requestPermission(url);

          $scope.$apply(() => $scope.processing = true)


          let resp = await fetch(url, {headers:{Accept: 'application/rss+xml, application/xhtml+xml, text/html'}}).then(async(r) => await r.text()),
              dom = ( (dom, content) => (
                (dom.innerHTML = content), dom
              ))(document.createElement('html'), resp),

              types = [
                'application/rss+xml',
                'application/atom+xml',
                'application/rdf+xml',
                'application/rss',
                'application/atom',
                'application/rdf',
                'text/rss+xml',
                'text/atom+xml',
                'text/rdf+xml',
                'text/rss',
                'text/atom',
                'text/rdf'
              ],
              link = dom.querySelector(`link[type="${types.join('"],link[type="')}"]`),
              feed = new Feed({url}),
              data;


          if(link){
            feed.url = new URL(link.getAttribute('href'), url).href; //to absolute
          }

          data = await feed.getXML();

          if(data.error){
            throw "No feed data";
          }

          data.title = data.title || dom.querySelector('title').innerText;

          Feeds.insert(data).then(feed => {

            if (!Folders.getById(Settings.folder).isSystem) {
              feed.folderId = Settings.folder;
            }
            $rootScope.editFeed(feed);

            $scope.processing = false
            $scope.$apply()
          })



        }catch(e){
          console.error(e)
          $scope.$apply(()=>{
            $scope.processing = false
            $scope.feed.step = "error"
            //todo allow to send report
          })
        }


      }



      $scope.saveFeed = () => {
        let {item, fields} = $scope.feed


        if (item.url != fields.url) {
          removePermission(item.url)
          requestPermission(fields.url)//todo wait promise
          console.log('req')
        }

        item.setTitle(fields.title)
        item.setUrl(fields.url)
        item.setFolderId(fields.folderId)
        item.setExtractText(fields.extractText)

        Settings.set("folder", item.folderId);
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