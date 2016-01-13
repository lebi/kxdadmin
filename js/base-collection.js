define(['jquery','underscore','backbone'],function($,_,Backbone){
	var MyCollection=Backbone.Collection.extend({
		set:function (models, options) {
			if(models.errorMsg)return;
			if(!(models.errorMsg||models.result))
				Backbone.Collection.prototype.set.call(this,models,options);
			else if(!models.errorMsg)
				Backbone.Collection.prototype.set.call(this,models.result,options);
		}
	})
	return MyCollection;
})