# Created by Serge P <serge.rsb@gmail.com> on 10/18/16.

angular.module('feedBundle').service 'Folders', ($rootScope, Folder, db, Settings)->

  #todo remove All feed and bookmars folders

  @sys_folders = [
    new Folder(_id:"all", name:'All feeds')
    new Folder(_id:"unsorted", name:'Unsorted')
    new Folder(_id:"bookmarks", name:'Bookmarks')  #todo implement
  ]


  @items = @sys_folders.slice(0)

  @add = (name)->
    return unless name

    db.folders.query(((doc)-> emit(doc.name)), key:name, include_docs:true).then (result)=>
      if result.rows.length
        return new Folder result.rows[0].doc
      else if @getByName name  #todo move to top
        return @getByName name

      #create new
      id = (Math.max (parseInt(folder.id) or 0 for folder in @items)...)+1

      json =
        _id: id.toString(),
        name: name


      db.folders.put(json).catch (err)->console.log 'Error at folders.add', err

      folder = new Folder json

      @items.push folder
      $rootScope.$apply()
      folder

  @remove = (folder)->
    return unless confirm('Are you sure?')

    $.each folder.getFeeds(), ->
      @setFolder null

    db.folders.get(folder.id).then (doc)=>
      db.folders.remove(doc)
      @get()

  @get = ->
    db.folders.allDocs(include_docs:true).then (result)=>
      @items = @sys_folders.slice(0)
      result.rows.forEach (item)=>
        @items.push new Folder item.doc

      $rootScope.$apply()
      @items

  @getById = (id)->
    @items.find (folder)-> folder.id == id

  @getByName = (name)->
    @items.find (folder)-> folder.name == name

  @getSelected = -> @getById Settings.folder


