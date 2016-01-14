define(['jquery','underscore','backbone'],function($,_,Backbone){
	var MyCollection=Backbone.Collection.extend({
		set:function (models, options) {
			if(models.errorMsg)return;
			if(!(models.errorMsg||models.result))
				Backbone.Collection.prototype.set.call(this,models,options);
			else if(!models.errorMsg)
				Backbone.Collection.prototype.set.call(this,models.result,options);
		},
		//每次fetch都会触发update事件
		fetch:function (options) {
      		options = _.extend({parse: true}, options);
			var success = options.success;
		    var collection = this;
		    options.success = function(resp) {
		        if (success) success.call(options.context, collection, resp, options);
		        collection.trigger('update');
		    };
		    return Backbone.Collection.prototype.fetch.call(this,options);
		}
	})
	return MyCollection;
})