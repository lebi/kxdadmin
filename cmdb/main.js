require.config({
	paths:{
		jquery:'../lib/jquery-1.11.3.min',
		underscore:'../lib/underscore-min',
		backbone:'../lib/backbone',
		cookie:'../lib/jquery.cookie',
		bootstrap:'../lib/bootstrap.min',
		model:'../js/base-model',
		collection:'../js/base-collection',
		unit:'app/unit'
	}
})

require(['unit'],function (UnitView) {
	new UnitView();
	Backbone.history.start();
})