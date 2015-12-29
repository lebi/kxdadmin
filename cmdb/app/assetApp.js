require.config({
	paths:{
		jquery:'../../lib/jquery-1.11.3.min',
		underscore:'../../lib/underscore-min',
		backbone:'../../lib/backbone',
		cookie:'../../lib/jquery.cookie',
		bootstrap:'../../lib/bootstrap.min',
		model:'../../js/base-model',
		collection:'../../js/base-collection',
		jqueryform:'../../lib/jquery.form.min',
		Unit:'model/Unit',
		UnitList:'model/UnitList',
		AssetType:'model/AssetType',
		AssetTypeList:'model/AssetTypeList',
		Asset:'model/Asset',
		AssetList:'model/AssetList',
		AssetTypeShow:'model/AssetTypeShow',
		ColumnMap:'model/ColumnMap',
		TimePicker:'../../lib/bootstrap-datetimepicker',
		AssetView:'view/AssetView',
		MainAssetView:'view/MainAssetView',
		AssetDetailView:'view/AssetDetailView',
		AssetEditView:'view/AssetEditView',
		AssetAddView:'view/AssetAddView',
		UnitTreeView:'view/UnitTreeView',
		AssetRouter:'router/AssetRouter',
	},
	shim : {  
    	bootstrap : {  
        	deps : ['jquery'],  
            exports :'bs'  
    	},
    	TimePicker:{
        	deps : ['bootstrap'],  
            exports :'$.fn.datepicker'
    	}  
    } 
})

define(['jquery','underscore','backbone','cookie','bootstrap','AssetRouter'],
	function ($,_,Backbone,cookie,bootstrap,AssetRouter) {

	$('.nav-menu').load('nav.html',function () {
		$($('.nav-menu a').get(0)).addClass('active');
	});
	var router=new AssetRouter();
	Backbone.history.start();
})