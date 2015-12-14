var MyCollection=Backbone.Collection.extend({
	set:function (models, options) {
		if(models.errorMsg)return;
		if(!(models.errorMsg||models.result))
			Backbone.Collection.prototype.set.call(this,models,options);
		else if(!models.errorMsg)
			Backbone.Collection.prototype.set.call(this,models.result,options);
	}
})

var MyModel=Backbone.Model.extend({
	set:function (models, options) {
		if(models.errorMsg)return;
		if(!(models.errorMsg||models.result))
			Backbone.Model.prototype.set.call(this,models,options);
		else if(!models.errorMsg)
			Backbone.Model.prototype.set.call(this,models.result,options);
	}
})

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