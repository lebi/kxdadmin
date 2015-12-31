define(['collection','RegModel'],function (MyCollection,RegModel) {
	var RegList=MyCollection.extend({
		model:RegModel,
		url:'/demo/chart/reg/list'
	})
	return RegList;
})