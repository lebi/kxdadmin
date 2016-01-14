define(['collection','Permit'],function (MyCollection,Permit) {
	var PermitList=MyCollection.extend({
		model:Permit,
		url:'/webserviceAPI/admin/permit/list'
	})
	return PermitList;
})