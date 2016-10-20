angular.module('feedBundle')
.service('Settings', ['$rootScope', 'Storage', '$http', ($scope, Storage, $http)->

  _defaults = {
    unread: 1
    folder: "all"
    full_title: 0
    update_each: 10
  };

  _settings = Storage.read('settings') || {}

  for own prop of _settings
    @[prop] = _settings[prop]


  @save = ->
    Storage.write('settings', _settings)

  @set = (key, value)->
    _settings[key] = value
    @[key] = value
    @save()

  @reset = (force)=>
    return if !force && !confirm('Are you sure?')
    _settings = $.extend({}, _defaults)
    for own prop of _settings
      @[prop] = _settings[prop]
    @save()

  @


])
.factory('Storage', ['$rootScope', ($rootScope)->

  {
    prefix: 'fb_',
    read: (key)->
      data = localStorage.getItem(@prefix+key);
      try
        JSON.parse(data);
      catch error
        data

    write: (key, val)->
      val = angular.toJson(val) if typeof val == "object"
      localStorage.setItem(@prefix+key, val);

  }
])