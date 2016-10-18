angular.module('settings', [])
  .service('Settings', ['$rootScope', 'Storage', '$http', ($scope, Storage, $http)->


    _defaults = {
      unread: 1
      folder: -1
      full_title: 0
      update_each: 10
    };

    _settings = Storage.read('settings') || {}

    #make sure that we have updated version
    (_settings[k] = v if _settings[k] is undefined) for k,v of _defaults
    #remove old vars
    delete _settings[old_setting_var] for old_setting_var in ['unreaded']



    for own prop of _settings
      @[prop] = _settings[prop]
    @save = ->
      Storage.write('settings', _settings)

    @set = (key, value)->
      _settings[key] = value
      @[key] = value
      @save()

    @reset = =>
      return unless confirm('Are you sure?')
      _settings = $.extend({}, _defaults)
      for own prop of _settings
        @[prop] = _settings[prop]
      @save()

    @




  ])