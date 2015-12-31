define(['model'],function (MyModel) {
	var Service=MyModel.extend({
		urlRoot:'/demo/monitor',
		defaults:{
			'id':null,
			'host':null,
			'item':null,
			'address':null,
			'status':null
		}
	})	
	return Service;
})