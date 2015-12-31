

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
		Detail:'../model/Detail',
		Host:'../model/Host',
		HostDetail:'../model/HostDetail',
		DetailList:'../model/DetailList',
		HostDetailView:'../view/HostDetailView',
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

define(['jquery','underscore','backbone','cookie','bootstrap','HostDetailView'],
	function ($,_,Backbone,cookie,bootstrap,HostDetailView) {

	$("#warpper-top").load("wrapper-top.html",function () {
		$($(".top-navbar .nav li").get(1)).addClass('active');
	});
	var view=new HostDetailView();
});