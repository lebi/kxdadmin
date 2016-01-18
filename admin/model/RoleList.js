define(['collection','Role'],function (MyCollection,Role) {
	var RoleList=MyCollection.extend({
		model:Role,
		url:'/webserviceAPI/admin/role/list'
	})
	return RoleList;
})