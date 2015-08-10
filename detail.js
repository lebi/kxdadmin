var NotificationView=Backbone.View.extend({
	el:$('.notification-history')
})

var ReportView=Backbone.View.extend({
	el:$('.page-report')
})

var TrendsView=Backbone.View.extend({
	el:$('.page-trends')
})

var AlertView=Backbone.View.extend({
	el:$('.alert-history')
})

var DetailView=Backbone.View.extend({
	el:$('.page-detail')
})

var BodyView=Backbone.View.extend({
	el:$('body'),
	events:{
		'click .page-button li':'changeTarget'
	},
	initialize:function (){
		$('.page-block').hide();
		$($('.page-block').get(0)).show();
	},
	changeTarget:function (dom) {
		var target=$(dom.target).closest('li').attr('target');
		$(dom.target).closest('ul').find('.active').removeClass('active');
		$(dom.target).closest('li').addClass('active');
		$('.page-block').hide();
		$('.'+target).show();
	}
})


$(function (){
	$("#warpper-top").load("wrapper-top.html",function () {
		console.log($(".top-navbar .nav li").get(0));
		$($(".top-navbar .nav li").get(1)).addClass('active');
	});
	var view=new BodyView();
})
