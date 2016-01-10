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
String.prototype.endWith = function(str) {
    var reg=new RegExp(str+'$');
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
