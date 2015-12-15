define(['underscore','backbone','model'],function (_,Backbone,MyModel) {
	var AssetType=MyModel.extend({
		defaults:{
			name:null,
			id:null,
			code:null,
			operations:[],
			properties:[]
		},
		urlRoot:'/cmdbAPI/type'
	})
	return AssetType;
})