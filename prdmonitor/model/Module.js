define(['model'],function (MyModel) {
	var Module=MyModel.extend({
		urlRoot:"/demo/module",
		defaults:{
			"monitors":new Array(),
			"note":null,
			"id":null,
			'chart':'yes',
			'pid':null,
			"pos":null
		}
	})
	return Module;
})