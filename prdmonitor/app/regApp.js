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
		RegModel:'../model/RegModel',
		RegList:'../model/RegList',
		HostList:'../model/HostList',
		ServiceList:'../model/ServiceList',
		util:'../js/util',
		RegView:'../view/RegView',
		RegSetView:'../view/RegSetView'
	},
	shim:{
		bootstrap : {
			deps : ['jquery'],
			exports :'bs'
		}
	}
})

define(['jquery','underscore','backbone','cookie','bootstrap','RegSetView'],
	function ($,_,Backbone,cookie,bootstrap,RegSetView) {

	$("#warpper-top").load("wrapper-top.html",function () {
		$($(".top-navbar .nav li").get(2)).addClass('active');
	});
	var view=new RegSetView();
})