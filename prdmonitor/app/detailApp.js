

require.config({
	paths:{
		jquery:'../../lib/jquery-1.11.3.min',
		underscore:'../../lib/underscore-min',
		backbone:'../../lib/backbone',
		cookie:'../../lib/jquery.cookie',
		bootstrap:'../../lib/bootstrap.min',
		model:'../../js/base-model',
		collection:'../../js/base-collection',
		util:'../js/util',
		highcharts:'../../lib/highcharts',
		TimePicker:'../../lib/bootstrap-datetimepicker',
		Service:'../model/Service',
		Detail:'../model/Detail',
		ChartDetail:'../model/ChartDetail',
		DetailView:'../view/DetailView'
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

define(['jquery','underscore','backbone','cookie','bootstrap','DetailView'],
	function ($,_,Backbone,cookie,bootstrap,DetailView) {

	$("#warpper-top").load("wrapper-top.html",function () {
		$($(".top-navbar .nav li").get(1)).addClass('active');
	});
	var view=new DetailView();
});