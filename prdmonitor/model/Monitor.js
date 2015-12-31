define(['model'],function (MyModel) {
	var Monitor=MyModel.extend({
		defaults:{
			"id":null,
			"host":'localhost',
			"item":null,
			"status":null,
			'output':''
		}
	})
	return Monitor;
})