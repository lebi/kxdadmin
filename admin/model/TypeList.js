define(['model','collection'],function (MyModel,MyCollection) {
	var AssetType=MyModel.extend({
		defaults:{
			name:'',
			id:null,
			operations:[],
		}
	})

	var TypeList=MyCollection.extend({
		model:AssetType,
		url:'/webserviceAPI/list/type',
		set:function (models,options) {
			MyCollection.prototype.set.call(this,models,options);
			var self=this;
		},
	})
	
	return TypeList;
})