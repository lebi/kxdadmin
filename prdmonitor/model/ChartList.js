define(['collection','Chart'],function (MyCollection,Chart) {
	var ChartList=MyCollection.extend({
		url:'/demo/chart/list',
		model:Chart
	})
	return ChartList;
})