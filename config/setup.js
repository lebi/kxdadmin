$(function () {
    $.ajaxSetup({
        complete:function (result) {
        	var obj=result.responseJSON;
        	if(!obj)return;
            if(obj.errorMsg=='NOT_LOGIN')
                window.location.href='/';
            // console.log(this.url);
            // console.log(this.type);
            if(obj.errorMsg=='NO_PERMISSION')
                alert('没有权限，请联系管理员');
        }
    })
})