angular
  .module('filters', [])
  .filter 'visible_news', [()->
    (feeds, expanded = false)->

      result = []
      $.each feeds, -> result.push @ if expanded

      result


  ]