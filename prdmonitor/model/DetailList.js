define(['collection','Detail'],function (MyCollection,Detail) {
	var DetailList=MyCollection.extend({
		model:Detail,
		url:'/demo/monitor/detail/services'
	})
	return DetailList;
})