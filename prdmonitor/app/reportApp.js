require.config({
	paths:{
		jquery:'../../lib/jquery-1.11.3.min',
		underscore:'../../lib/underscore-min',
		backbone:'../../lib/backbone',
		cookie:'../../lib/jquery.cookie',
		bootstrap:'../../lib/bootstrap.min',
		model:'../../js/base-model',
		highcharts:'../../lib/highcharts',
		collection:'../../js/base-collection',
		TimePicker:'../../lib/bootstrap-datetimepicker',
		Report:'../model/Report',
		util:'../js/util',
		ReportView:'../view/ReportView'
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

define(['jquery','underscore','backbone','cookie','bootstrap','Report','collection','TimePicker','util','ReportView'],
	function ($,_,Backbone,cookie,bootstrap,Report,MyCollection,TimePicker,util,ReportView) {
	$("#warpper-top").load("wrapper-top.html",function () {
		$($(".top-navbar .nav li").get(3)).addClass('active');
	});
	var page=new ReportView();
})