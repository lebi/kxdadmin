define(['model'],function (MyModel) {
	var Permit=MyModel.extend({
		urlRoot:'/webserviceAPI/admin/permit',
		defaults:{
			'id':null,
			'user':null,
			'role':null,
			'unit':null,
			'username':'',
			'rolename':'',
			'unitname':''
		}
	});
	return Permit;
})