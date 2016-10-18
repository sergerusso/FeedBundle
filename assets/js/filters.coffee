angular
  .module('filters', [])
  .filter('available_folders', [()->
    (folders, to_hide)->
      without = [-1, 1]

      without = to_hide if(to_hide)

      _.filter folders, (i)-> without.indexOf(i.id) == -1

  ])
  .filter('feed_search', [()->
    (feeds, name = "")->
      name = name.toLowerCase()
      _.filter feeds, (i)-> i.title.toLowerCase().indexOf(name) > -1

  ])
  .filter 'visible_news', [()->
    (feeds, collapsed = false)->

      result = []
      $.each feeds, ->
        result.push @ unless collapsed

      result


  ]