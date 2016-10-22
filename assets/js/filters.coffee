angular
  .module('filters', [])
  .filter 'filter_news', [()->
    (feeds, feed)->

      result = []
      $.each feeds, -> result.push @ if feed.expanded || feed.isComposite

      result


  ]