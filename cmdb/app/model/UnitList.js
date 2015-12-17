define(['collection','Unit'],function (MyCollection,Unit) {
	var UnitList=MyCollection.extend({
		model:Unit,
		url:'/cmdbAPI/unit/list'
	})
	return UnitList;
})