define(['model'],function (MyModel) {
	var RegModel=MyModel.extend({
		url:'/demo/chart/reg',
		defaults:{
			id:null,
			objectId:null,
			host:null,
			service:null,
			perfdata:null,
			output:null,
			dataType:null,
			reg:null,
			parameters:null,
			parametersCal:null
		}
	})
	return RegModel;
})