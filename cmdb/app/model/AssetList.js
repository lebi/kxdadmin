define(['collection','Asset'],function (MyCollection,Asset) {
	var AssetList=MyCollection.extend({
		model:Asset,
		url:'/cmdbAPI/asset/list'
	})
	return AssetList;
})