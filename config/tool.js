Date.prototype.pattern=function(fmt) {           
    var o = {           
    "M+" : this.getMonth()+1, //月份           
    "d+" : this.getDate(), //日           
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时           
    "H+" : this.getHours(), //小时           
    "m+" : this.getMinutes(), //分           
    "s+" : this.getSeconds(), //秒           
    "q+" : Math.floor((this.getMonth()+3)/3), //季度           
    "S" : this.getMilliseconds() //毫秒           
    };           
    var week = {           
    "0" : "/u65e5",           
    "1" : "/u4e00",           
    "2" : "/u4e8c",           
    "3" : "/u4e09",           
    "4" : "/u56db",           
    "5" : "/u4e94",           
    "6" : "/u516d"          
    };           
    if(/(y+)/.test(fmt)){           
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));           
    }           
    if(/(E+)/.test(fmt)){           
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);           
    }           
    for(var k in o){           
        if(new RegExp("("+ k +")").test(fmt)){           
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));           
        }           
    }           
    return fmt;           
}

Date.prototype.nextweek=function () {
    return new Date(this.getTime()+7*24*60*60*1000);
}

Date.prototype.nextday=function () {
    return new Date(this.getTime()+24*60*60*1000);
}

Date.prototype.nextmonth=function () {
    var result=new Date(this.getTime());
    if(result.getMonth==11){
        result.setMonth(0);
        result.setFullYear(result.getFullYear()+1);
    }else
        result.setMonth(result.getMonth()+1);
    return result;
}

Date.prototype.nextyear=function () {
    var result=new Date(this.getTime());
    result.setFullYear(result.getFullYear()+1);
    return result;
}

Date.prototype.beforemonth=function () {
    var result=new Date(this.getTime());
    if(result.getMonth==0){
        result.setMonth(11);
        result.setFullYear(result.getFullYear()-11);
    }else
        result.setMonth(result.getMonth()-1);
    return result;
}

Date.prototype.beforeyear=function () {
    var result=new Date(this.getTime());
    result.setFullYear(result.getFullYear()-1);
    return result;
}

Date.prototype.beforeweek=function () {
    return new Date(this.getTime()-7*24*60*60*1000);
}

Date.prototype.beforeday=function () {
    return new Date(this.getTime()-24*60*60*1000);
}

String.prototype.startWith = function(str) {
    var reg=new RegExp('^'+str);
    return reg.test(this);
};
String.prototype.parent=function (str) {
    var arr=this.split('/');
    var res=arr[0];
    for(var i=1;i<arr.length-1;i++){
        res+='/'+arr[i];
    }
    return res;
}
Array.prototype.peek = function() {
    return this[this.length-1];
};

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