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
		url:'/webserviceAPI/list/type'
	})
	
	return TypeList;
})