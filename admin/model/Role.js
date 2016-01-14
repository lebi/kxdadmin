define(['model'],function (MyModel) {
	var Role=MyModel.extend({
		urlRoot:'/webserviceAPI/admin/role',
		defaults:{
			'name':null,
			'code':null,
			'id':null,
			'operations':null
		}
	})
	return Role;
})