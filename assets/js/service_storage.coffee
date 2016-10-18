angular.module('storage', [])
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