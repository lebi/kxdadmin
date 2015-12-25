define(['backbone'],function(Backbone){
	var MyModel=Backbone.Model.extend({
		set:function (models, options) {
			if(models.errorMsg)return;
			// console.log(models);
			if(!(models.errorMsg||models.result))
				Backbone.Model.prototype.set.call(this,models,options);
			else if(!models.errorMsg)
				Backbone.Model.prototype.set.call(this,models.result,options);
			return this;
		}
	})
	return MyModel;
})