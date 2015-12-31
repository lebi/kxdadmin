define(['model'],function (MyModel) {
	var ChartDetail=MyModel.extend({
		urlRoot:'/demo/chart/detail',
		defaults:{
			'chartData':null,
			'begin':null,
			'end':null,
			'id':null,
			'reg':null,
			'parameters':null,
			'parametersCal':null,
			'dataType':null
		}
	})
	return ChartDetail;
})