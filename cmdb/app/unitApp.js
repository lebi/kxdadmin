require.config({
	paths:{
		jquery:'../../lib/jquery-1.11.3.min',
		underscore:'../../lib/underscore-min',
		backbone:'../../lib/backbone',
		cookie:'../../lib/jquery.cookie',
		bootstrap:'../../lib/bootstrap.min',
		model:'../../js/base-model',
		collection:'../../js/base-collection',
		Unit:'model/Unit',
		UnitList:'model/UnitList',
		AssetType:'model/AssetType',
		AssetTypeList:'model/AssetTypeList',
		Asset:'model/Asset',
		AssetList:'model/AssetList',
		ColumnMap:'model/ColumnMap',
		AssetView:'view/AssetView',
		UnitAssetView:'view/UnitAssetView',
		UnitNavView:'view/UnitNavView',
		UnitDetailView:'view/UnitDetailView',
		UnitEditView:'view/UnitEditView',
		UnitRouter:'router/UnitRouter'
	},
	shim : {  
    	bootstrap : {  
        	deps : ['jquery'],  
            exports :'bs'  
    	}
    } 
})

define(['jquery','underscore','backbone','cookie','bootstrap','UnitRouter'],
	function ($,_,Backbone,cookie,bootstrap,UnitRouter) {
	$('.nav-menu').load('nav.html',function () {
		$($('.nav-menu a').get(1)).addClass('active');
	});

	new UnitRouter();
	Backbone.history.start();
})

