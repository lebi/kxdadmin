define(['collection','Operation'],function (MyCollection,Operation) {
	var OperationList=MyCollection.extend({
		model:Operation,
		url:'/cmdbAPI/ops/list'
	})
	return OperationList;
})