
import Settings from './model/settings.js'

//todo refactor all this

angular
  .module('feedBundle.directives', [])
  .directive('toggleSidebar', [()=>(
    (scope, elm, attrs)=> {

      let $sidebar = $(".sidebar:visible"),
        $viewport = $('.viewport'),
        $btn = $(".btn-settings:visible"),
        sidebar_width

      elm.on('click', () => {
        if (scope.sidebar_expanded) {
          sidebar_width = $sidebar.width()
          $sidebar.animate({right: -sidebar_width})
          $viewport.animate({right: 0})
          $btn.animate({right: $btn.width() / 2})
          scope.sidebar_expanded = false
        } else {
          $sidebar.animate({right: 0})
          $viewport.animate({right: sidebar_width})
          $btn.animate({right: sidebar_width + $btn.width() / 2})
          scope.sidebar_expanded = true
        }
        scope.$apply()
      })
    }
  )])
  .directive('viewFrame', [()=>(
    (scope, elm, attrs)=> {

      let loading_limit = 30000

      attrs.$observe('src', ()=> {
        clearInterval(window.frameLoaderInsperctor)
        if (!attrs.src) return;
        scope.frame_loading = true
        scope.frame_loading_long = false
        let start = (new Date()).getTime()
        window.frameLoaderInsperctor = setInterval(() => {
          if ((new Date()).getTime() - start >= loading_limit) {
            clearTimeout(window.frameLoaderInsperctor)
            scope.$apply(() => scope.frame_loading_long = true)
          }
        }, 2000);
      })

      scope.$on('destroy', ()=> clearInterval(window.frameLoaderInsperctor))

      elm.on('load', ()=> {
        scope.frame_loading = false

        if (window.require) {
          $(elm[0].contentWindow.document).find("a").on('click', () => {
            if (this.href.indexOf('http') != 0) return;
            require('nw.gui').Shell.openExternal(this.href)
            return false
          })
        }

        scope.$apply()
      })
    }
  )])
  .directive('ngAutofocus', [()=>(
    (scope, elm, attrs)=> {
      elm.focus()
    }
  )])
  .directive('disableSelect', ['$location', ($location)=>(
    (scope, elm, attrs)=> {
      elm.on("selectstart", (e) => e.preventDefault())
    }
  )])
  .directive('showTools', ['$location', ($location)=>(
    (scope, elm, attrs)=> {

      elm.on("click", (e) => {

        let $par = elm.closest('.dropdown')
        if ($par.is('.open'))
          scope.$apply(() => $location.path("/settings/"))


      });
    }
  )])
  .directive('hotkeys', [()=>(
    (scope, elm, attrs)=> {
      let keyCodes = {
        72: 'h',
        77: 'm',
        83: 's'
      }


      $('body').on("keydown", (e) => {
        if (!e.ctrlKey) return;

        let action = keyCodes[e.keyCode]

        switch (action) {
          case 'h':
            Settings.set('unread', !Settings.unread);
            break; //read items
          case 'm':
            scope.collapseAll();
            break;  //collapse items
          case 's':
            $(".toggle_sidebar").trigger('click');
            break; //sidebar
        }

        e.preventDefault()
        scope.$apply()
      })
    }
  )])
  .directive('folderList', [()=>(
    (scope, elm, attrs)=> {
      elm.find('.title').on('click', () => elm.find('.inner').slideToggle());

      let timeout = null
      elm.on('mouseenter', () => clearTimeout(timeout))
      elm.on('mouseleave', () => {
        timeout = setTimeout(() => {
          elm.find('.inner').slideUp()
        }, 300);
      });
    }
  )])
  .directive('clearView', [()=>(
    (scope, elm, attrs)=> $(".modal-backdrop").remove()
  )])
  .directive('fbSwitcher', [()=>(


    (scope, elm, attrs)=> {
      let $btn = $(`
               <div class="btn-group swither">
               <button class="btn btn-default on">on</button>
               <button class="btn btn-default off">off</button>
               </div>
        `),
        $btn_on = $btn.children('.on'),
        $btn_off = $btn.children('.off'),
        $btns = $btn.children('.off,.on');


      elm.replaceWith($btn)
      $btns.on('click', () => {
        Settings.set(attrs.name, !Settings[attrs.name])
        scope.$digest()
      })

      scope.$watch('Settings.' + attrs.name, (v) => {
        $btns.removeClass('btn-primary active').removeAttr('disabled')
        if (attrs.reverse != undefined) v = !v
        if (v) {
          $btn_on.attr('disabled', 'disabled')
          $btn_on.addClass('active')
        } else {
          $btn_off.attr('disabled', 'disabled')
          $btn_off.addClass('active')
        }
      }, true)
    }
  )])
  .directive("postRepeatDirective", ["$timeout", "$log", ($timeout, $log, TimeTracker) =>(
    (scope, element, attrs) => {

      if (scope.$first) {
        window.start_date = (new Date()).getTime();
      } else if (scope.$last) {
        $timeout(() => {
          console.log
          "## DOM rendering list took: " + ((new Date()).getTime() - window.start_date) + " ms"
        })
      }
    }

  )])

  .directive("browserLink", [()=>(
    (scope, elm, attrs)=> {
      elm.attr('target', '_blank')
      elm.on('click', (e) => {
        require('nw.gui').Shell.openExternal(this.href)
        e.preventDefault()
      })
    }
  )])

  .directive("ngClickNoProp", [()=>(
    (scope, elm, attrs)=> {

      elm.on('click', (e)=>{

        scope.$apply(()=> scope.$eval(attrs.ngClickNoProp))

        e.stopPropagation()
        e.preventDefault()
      })
    }

  )])

  .directive("importUpload", [()=>(
    (scope, elm, attrs)=> {

      elm.on('change', (e) => {

        scope.importFile(e.target)
        //angular.element(this).scope().importFile(this)

      })
    }
  )])
  .directive("dblclickRead", [()=>(
    (scope, elm, attrs)=> {
      elm.on('dblclick', () => {
        scope.feed.markRead()
        scope.$apply()
      })
    }
  )])

  .filter('filter_news', [()=>(
    (feeds, feed)=> (
      feeds.filter(el => feed.expanded || feed.isComposite)
    )
  )])


export default angular