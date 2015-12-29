require.config({
	paths:{
		jquery:'../../lib/jquery-1.11.3.min',
		underscore:'../../lib/underscore-min',
		backbone:'../../lib/backbone',
		cookie:'../../lib/jquery.cookie',
		bootstrap:'../../lib/bootstrap.min',
		model:'../../js/base-model',
		collection:'../../js/base-collection',
		Operation:'model/Operation',
		OperationList:'model/OperationList',
		OperationType:'model/OperationType',
		OperationTypeList:'model/OperationTypeList',
		OperationNavView:'view/OperationNavView',
		OperationEditView:'view/OperationEditView',
		OperationDetailView:'view/OperationDetailView',
		OperationRouter:'router/OperationRouter'
	},
	shim : {  
    	bootstrap : {  
        	deps : ['jquery'],  
            exports :'bs'  
    	}
    } 
})

define(['jquery','underscore','backbone','bootstrap','OperationRouter'],
	function ($,_,Backbone,bootstrap,OperationRouter) {
	$('.nav-menu').load('nav.html',function () {
		$($('.nav-menu a').get(2)).addClass('active');
	});

	var router=new OperationRouter();
	Backbone.history.start();

})