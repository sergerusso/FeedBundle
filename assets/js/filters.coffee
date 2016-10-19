angular
  .module('filters', [])
  .filter('available_folders', [()->
    (folders, to_hide)->
      without = [-1, 1]

      without = to_hide if(to_hide)

      _.filter folders, (i)-> without.indexOf(i.id) == -1

  ])
  .filter 'visible_news', [()->
    (feeds, expanded = false)->

      result = []
      $.each feeds, -> result.push @ if expanded

      result


  ]