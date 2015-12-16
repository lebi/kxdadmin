define(['collection','OperationType'],function (MyCollection,OperationType) {
	var OperationTypeList=MyCollection.extend({
		model:OperationType,
		url:'/cmdbAPI/ops/type/list'
	})
	return OperationTypeList;
})