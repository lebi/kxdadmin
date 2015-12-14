define(['collection','AssetType'],function (MyCollection,AssetType) {
	var AssetTypeList=MyCollection.extend({
		model:AssetType,
		url:'/cmdbAPI/type/list'
	})
	return AssetTypeList;
})