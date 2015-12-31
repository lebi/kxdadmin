define(['model'],function (MyModel) {
	var Report=MyModel.extend({
		defaults:{
			'name':null,
			'id':null,
			'hostname':null,
			'num':null,
			'state':null
		}
	})
	return Report;
})