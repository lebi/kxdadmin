define(['model'],function (MyModel) {
	var AssetType=MyModel.extend({
		defaults:{
			name:null,
			id:null,
			code:null,
			operations:[],
			properties:[],
			showColumn:{}
		},
		urlRoot:'/cmdbAPI/type'
	})
	return AssetType;
})