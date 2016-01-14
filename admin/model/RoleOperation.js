define(['model'],function (MyModel) {
	var RoleOperation=MyModel.extend({
		urlRoot:'/webserviceAPI/admin/role/operation',
		defaults:{
			'role':null,
			'id':null,
			'operation':null
		}
	})
	return RoleOperation;
})