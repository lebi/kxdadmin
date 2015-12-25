define(['underscore','backbone','model'],function (_,Backbone,MyModel) {
	var AssetTypeShow=MyModel.extend({
		defaults:{
			id:null,
			typeId:null,
			basic:'',
			extend:''
		},
		urlRoot:'/cmdbAPI/type/show'
	})
	return AssetTypeShow;
})