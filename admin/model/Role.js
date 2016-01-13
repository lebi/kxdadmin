define(['model'],function (MyModel) {
	var Role=MyModel.extend({
		urlRoot:'/webserviceAPI/admin/role',
		defaults:{
			'name':null,
			'id':null,
			'permits':null
		}
	})
	return Role;
})