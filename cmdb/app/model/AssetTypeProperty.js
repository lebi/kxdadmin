define(['underscore','backbone','model'],function (_,Backbone,MyModel) {
	var AssetTypeProperty=MyModel.extend({
		defaults:{
			name:null,
			code:null,
			id:null,
			description:null,
			type:null
		},
		urlRoot:'/cmdbAPI/type/property'
	})
	return AssetTypeProperty;
})