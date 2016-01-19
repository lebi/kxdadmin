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
		util:'../js/util',
		DrilldownView:'../view/DrilldownView'
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

define(['jquery','underscore','backbone','cookie','bootstrap','collection','TimePicker','util','DrilldownView'],
	function ($,_,Backbone,cookie,bootstrap,MyCollection,TimePicker,util,DrilldownView) {
	$("#warpper-top").load("wrapper-top.html",function () {
		$($(".top-navbar .nav li").get(3)).addClass('active');
	});
	var page=new DrilldownView();
})