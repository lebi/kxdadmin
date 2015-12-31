//********************************************************************************************************************//
//														2015.12.31
//													edited by Huang Yan
//
//
//********************************************************************************************************************
require.config({
	paths:{
		jquery:'../../lib/jquery-1.11.3.min',
		underscore:'../../lib/underscore-min',
		backbone:'../../lib/backbone',
		cookie:'../../lib/jquery.cookie',
		bootstrap:'../../lib/bootstrap.min',
    	highcharts:'../../lib/highcharts',
		model:'../../js/base-model',
		collection:'../../js/base-collection',
		util:'../js/util',
		HostList:'../model/HostList',
		ServiceList:'../model/ServiceList',
		Chart:'../model/Chart',
		ChartList:'../model/ChartList',
		Project:'../model/Project',
		ProjectList:'../model/ProjectList',
		Module:'../model/Module',
		ModuleList:'../model/ModuleList',
		ModuleView:'../view/ModuleView',
		ChartView:'../view/ChartView',
		EditModalView:'../view/EditModalView',
		ProjectView:'../view/ProjectView'
	},
	shim : {  
    	bootstrap : {  
        	deps : ['jquery'],  
            exports :'bs'  
    	}
    }
})

define(['jquery','underscore','backbone','cookie','bootstrap','EditModalView','ProjectView'],
	function ($,_,Backbone,cookie,bootstrap,EditModalView,ProjectView) {
	$("#warpper-top").load("wrapper-top.html",function () {
		$($(".top-navbar .nav li").get(0)).addClass('active');
	});
	var projectView=new ProjectView();
	projectView.setModal(new EditModalView());

})