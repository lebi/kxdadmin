define([],function () {
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
    RegExp.prototype.calculate=function (data,rule) {
        if(rule==null||data==null)
            return null;
        if(this==null)
            return null;
        var res=this.exec(data);
        if(res==null)
            return null;
        var evalStr="";
        var temp=-1;
        var exp=/^\$(\w+)/;
        for(var i=0;i<rule.length;i++){
            if(rule.charAt(i)=='$'){
                var exe=exp.exec(rule.substr(i));
                if(exe==null)
                    return null;
                evalStr+=res[exe[1]];
                i+=exp.exec(rule.substr(i))[1].length;
            }
            else evalStr+=rule.charAt(i);
        }
        return eval(evalStr);
    }
    return {}
})