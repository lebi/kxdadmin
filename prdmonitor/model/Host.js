define(['model'],function (MyModel) {
	var Host=MyModel.extend({
		url:'/demo/monitor/host',
		defaults:{
			'id':null,
			'name':null,
			'address':null,
			'status':null
		}
	})
	return Host;
})