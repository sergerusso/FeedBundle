angular
  .module('feedBundle.directives', [])
  .directive('toggleSidebar', [()->
    (scope, elm, attrs)->

      $sidebar = $(".sidebar:visible")
      $viewport = $('.viewport')
      $btn = $(".btn-settings:visible")
      @sidebar_width

      elm.on 'click',  =>
        if scope.sidebar_expanded
          @sidebar_width = $sidebar.width()
          $sidebar.animate({right: -@sidebar_width})
          $viewport.animate({right: 0})
          $btn.animate({right: $btn.width()/2})
          scope.sidebar_expanded = false
        else
          $sidebar.animate({right: 0})
          $viewport.animate({right: @sidebar_width})
          $btn.animate({right: @sidebar_width + $btn.width()/2})
          scope.sidebar_expanded = true

        scope.$apply()

  ])
  .directive('viewFrame', [()->
    (scope, elm, attrs)->

      loading_limit = 30000

      attrs.$observe 'src', ->
        clearInterval window.frameLoaderInsperctor
        return unless attrs.src
        scope.frame_loading = true
        scope.frame_loading_long = false
        start = (new Date()).getTime()
        window.frameLoaderInsperctor = setInterval ->
          if (new Date()).getTime() - start >= loading_limit
            clearTimeout window.frameLoaderInsperctor
            scope.$apply ->
              scope.frame_loading_long = true
        , 2000

      scope.$on 'destroy', ->
        clearInterval window.frameLoaderInsperctor

      elm.on 'load', ()->
        scope.frame_loading = false

        $(elm[0].contentWindow.document).find("a").on 'click', ->
          return if this.href.indexOf('http') != 0
          require('nw.gui').Shell.openExternal( this.href )
          return false

        scope.$apply()
  ])
  .directive('ngAutofocus', [()->
    (scope, elm, attrs)->
      elm.focus()
  ])
  .directive('disableSelect', ['$location', ($location)->
    (scope, elm, attrs)->

      elm.on "selectstart", (e)->
        e.preventDefault()
  ])
  .directive('showTools', ['$location', ($location)->
    (scope, elm, attrs)->

      elm.on "click", (e)->
        $par = elm.closest '.dropdown'
        if $par.is '.open'
          scope.$apply ->
            $location.path( "/settings/" )

          false

  ])
  .directive('hotkeys', ['Settings', (Settings)->
    (scope, elm, attrs)->
      keyCodes =
        72: 'h'
        77: 'm'
        83: 's'


      $('body').on "keydown", (e) ->
        return unless e.ctrlKey
        action = keyCodes[e.keyCode]

        switch action
          when 'h' then Settings.set('unread', !Settings.unread) #read items
          when 'm' then scope.collapseAll() #collapse items
          when 's' then $(".toggle_sidebar").trigger('click') #sidebar

        e.preventDefault()
        scope.$apply()
  ])
  .directive('folderList', [ ()->
    (scope, elm, attrs)->
      elm.find('.title').on 'click', ->
        elm.find('.inner').slideToggle()

      timeout = null
      elm.on 'mouseenter', -> clearTimeout timeout
      elm.on 'mouseleave', ->
        timeout = setTimeout ->
          elm.find('.inner').slideUp()
        , 300
  ])
  .directive('clearView', [ ()->
    (scope, elm, attrs)->
      $(".modal-backdrop").remove();
  ])
  .directive('fbSwitcher', ['Settings', (Settings)->


    (scope, elm, attrs)->
      $btn = $ """
               <div class="btn-group swither">
               <button class="btn btn-default on">on</button>
               <button class="btn btn-default off">off</button>
               </div>
               """
      $btn_on = $btn.children('.on')
      $btn_off = $btn.children('.off')
      $btns = $btn.children('.off,.on')


      elm.replaceWith($btn)
      $btns.on 'click', ->
        Settings.set(attrs.name, !Settings[attrs.name])
        scope.$digest()

      scope.$watch 'Settings.'+attrs.name, (v)->
        $btns.removeClass('btn-primary active').removeAttr('disabled')
        v = !v if attrs.reverse != undefined
        if v
          $btn_on.attr('disabled', 'disabled')
          $btn_on.addClass('active')
        else
          $btn_off.attr('disabled', 'disabled')
          $btn_off.addClass('active')
      ,true


  ])
  .directive "postRepeatDirective", ["$timeout", "$log", ($timeout, $log, TimeTracker) ->
    (scope, element, attrs) ->

      if scope.$first
        window.start_date = (new Date()).getTime();
      else if scope.$last
        $timeout ->
          console.log "## DOM rendering list took: " + ((new Date()).getTime() - window.start_date) + " ms"

  ]

  .directive "browserLink", ->
    (scope, elm, attrs)->
      elm.attr('target', '_blank')
      elm.on 'click', (e)->
        require('nw.gui').Shell.openExternal( this.href )
        e.preventDefault()

  .directive "ngClickNoProp", ->
    (scope, elm, attrs)->

      elm.on 'click', (e)->

        scope.$apply -> scope.$eval(attrs.ngClickNoProp)

        e.stopPropagation()
        e.preventDefault()
