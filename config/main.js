require.config({
	paths:{
		jquery:'../lib/jquery-1.11.3.min',
		underscore:'../lib/underscore-min',
		backbone:'../lib/backbone',
		cookie:'../lib/jquery.cookie',
		bootstrap:'../lib/bootstrap.min',
		tool:'tool',
		setup:'setup',
		model:'base-model',
		collection:'base-collection',
		body:'app/config-body',
		commit:'app/commit',
		indexdb:'app/indexdb',
		router:'app/router',
		navComponent:'app/nav-component',
		navConflict:'app/nav-conflict',
		navFile:'app/nav-file',
		nav:'app/nav-right',
		wrapper:'app/wrapper',
		wrapperComponent:'app/wrapper-component',
		wrapperConflict:'app/wrapper-conflict',
		wrapperDiff:'app/wrapper-diff',
		wrapperEditor:'app/wrapper-editor',
		wrapperReader:'app/wrapper-reader',
	}
})

require(['underscore','backbone','bootstrap','cookie','tool','setup','indexdb','body','router'],
	function (_,Backbone,bootstrap,cookie,tool,setup,DBManager,BodyView,AppRouter) {
	DBManager.init(function() {
		var app_router = new AppRouter();
			Backbone.history.start();
			BodyView.body=new BodyView();
	});
})