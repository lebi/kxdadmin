define(['underscore','backbone','model'],function (_,Backbone,MyModel) {
	var AssetType=MyModel.extend({
		defaults:{
			name:null,
			id:null,
			code:null,
			operations:null,
			extendType:null,
			extendCode:null
		}
	})
	return AssetType;
})