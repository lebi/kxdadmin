    var DBManager=(function () {
        this.manager={};
        var request;

        manager.getOne=function(path,success,obj) {
            var transaction=manager.db.transaction(['fileStore'],'readwrite');
            var objectstore=transaction.objectStore('fileStore');
            var request=objectstore.get(path);
            request.onerror=function (event) {
                console.log('get error');
                console.log(event.target);
            }
            request.onsuccess=function (event) {
                if(success)
                    success.call(obj,event.srcElement.result);
            }
        }

        manager.getAmbiguous=function (path,success,obj) {
            var transaction=manager.db.transaction(['fileStore'],'readwrite');
            var objectstore=transaction.objectStore('fileStore');
            var request=objectstore.openCursor();
            var result;
            request.onerror=function (event) {
                console.log('get cursor error');
                console.log(event.target);
            }
            request.onsuccess=function (event) {
                var cursor=event.srcElement.result;
                if(cursor){
                    var file=cursor.value;
                    var reg=new RegExp(path);
                    if(file.path.match(reg)){
                        if(!result) result={};
                        result[file.path]=file;
                    }
                    cursor.continue();
                }else{
                    if(success)
                        success.call(obj,result);
                }
            }
        }

        manager.getAll=function (success,obj) {
            var transaction=manager.db.transaction(['fileStore'],'readwrite');
            var objectstore=transaction.objectStore('fileStore');
            var request=objectstore.openCursor();
            var result;
            request.onerror=function (event) {
                console.log('get cursor error');
                console.log(event.target);
            }
            request.onsuccess=function (event) {
                var cursor=event.srcElement.result;
                if(cursor){
                    var file=cursor.value;
                    if(!result) result={};
                    result[file.path]=file;
                    cursor.continue();
                }else{
                    if(success)
                        success.call(obj,result);
                }
            }
        }

        manager.deleteAmbiguous=function (path,success,obj) {
            var transaction=manager.db.transaction(['fileStore']);
            var objectstore=transaction.objectStore('fileStore');
            var request=objectstore.openCursor();
            request.onsuccess=function (event) {
                var cursor=event.srcElement.result;
                if(cursor){
                    var file=cursor.value;
                    var reg=new RegExp(path);
                    console.log(file.path);
                    if(reg.test(file.path)){
                        manager.delete(file.path);
                    }
                    cursor.continue();
                }else{
                    if(success)
                        success.call(obj);
                }
            }
            request.onerror=function (event) {
                console.log('get cursor error');
                console.log(event.target);
            }
        }    

        manager.add=function (file,success,obj) {
            if(_check(file)){
                var transaction=manager.db.transaction(['fileStore'],'readwrite');
                var objectstore=transaction.objectStore('fileStore');
                var request=objectstore.add(file);
                request.onerror=function (event) {
                    console.log('add error');
                    console.log(request.error.name);
                }
                request.onsuccess=function (event) {
                    if(success)
                        success.call(obj);
                }
            }
        }

        manager.delete=function (path,success,obj) {
            var transaction=manager.db.transaction(['fileStore'],'readwrite');
            var objectstore=transaction.objectStore('fileStore');
            var request=objectstore.delete(path);
            request.onerror=function (event) {
                console.log('delete error');
                console.log(request)
            }
            request.onsuccess=function (event) {
                if(success)
                    success.call(obj);
            }
        }

        manager.update=function (file,success,obj) {
            if(_check(file)){
                var transaction=manager.db.transaction(['fileStore'],'readwrite');
                var objectstore=transaction.objectStore('fileStore');
                var request=objectstore.put(file);
                request.onerror=function (event) {
                    console.log('update error');
                    console.log(request);
                }
                request.onsuccess=function (event) {
                    if(success)
                        success.call(obj);
                }
            }
        }

        manager.addExist=function (file,success,obj) {
            if(_check(file)){
                var transaction=manager.db.transaction(['fileStore'],'readwrite');
                var objectstore=transaction.objectStore('fileStore');
                var request=objectstore.add(file);
                request.onerror=function (event) {
                    if(request.error.name=='ConstraintError'){
                        manager.update(file,success,obj);
                    }else{
                        console.log('add error');
                        console.log(request.error.name);
                    }
                }
                request.onsuccess=function (event) {
                    if(success)
                        success.call(obj);
                }
            }
        }

        /*
        action:null
        comment:null
        content: null
        date: null
        kind: null
        path: null

        */
        function _check(file) {
            if(isNaN(file.resolve))
                file.resolve=0;
            if(file.path&&file.action&&file.date&&!isNaN(file.kind))return true;
            console.log(file);
            throw Error('file format error');
        }

        manager.init=function(callback) {
            request=indexedDB.open("fileCache",1);

            request.onerror = function(event) {
            };

            request.onsuccess=function (event) {
                manager.db=request.result;
                callback();
            }

            request.onupgradeneeded=function (event) {
                manager.db=event.target.result;
                var store=manager.db.createObjectStore('fileStore',{keyPath:'path'});
                callback();
            }

        }
        return {
            manager:manager
        }
    })()