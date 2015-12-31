define(['collection','Module'],function (MyCollection,Module) {
	var ModuleList=MyCollection.extend({
		model:Module,
		url:"/demo/module/list",
		initialize:function () {
		}
	})
	return ModuleList;
})