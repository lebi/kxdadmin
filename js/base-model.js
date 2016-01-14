define(['jquery','underscore','backbone'],function($,_,Backbone){
	var MyModel=Backbone.Model.extend({
		set:function (models, options) {
			if(models.errorMsg)return;
			if(!(models.errorMsg||models.result))
				Backbone.Model.prototype.set.call(this,models,options);
			else if(!models.errorMsg)
				Backbone.Model.prototype.set.call(this,models.result,options);
			return this;
		}
	})
	return MyModel;
})