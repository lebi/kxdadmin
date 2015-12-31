define(['model'],function (MyModel) {
	var Chart=MyModel.extend({
		urlRoot:'/demo/chart',
		defaults:{
			'id':null,
			'host':null,
			'item':null,
			'chartData':null,
			'reg':null,
			'parameters':null,
			'parametersCal':null,
			'dataType':null
		}
	})
	return Chart;
})