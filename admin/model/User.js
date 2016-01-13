define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	var User=MyModel.extend({
		urlRoot:'/webserviceAPI/admin/user',
		defaults:{
			'username':null,
			'id':null,
			'password':null
		}
	});
	return User;
})