

var BodyView=Backbone.View.extend({
	el:$('body'),
	events:{
		'click .page-button li':'changeTarget',
		'click .page-button li[target=page-detail]':'renderDetail',
		'click .page-button li[target=alert-history]':'renderHistory',
		'click .page-button li[target=page-trends]':'renderTrends',
		'click .page-button li[target=page-report]':'renderReport',
		'click .page-button li[target=notification-history]':'renderNotification',
	},
	initialize:function (){
		this.model=new Service({id:$.cookie('serviceid')});
		var self=this;
		this.model.fetch()
		.done(function () {
			var temp=_.template($('#title-temp').html());
			$('.page-title').empty();
			$('.page-title').append(temp({monitor:self.model}));
		})
		this.renderDetail();
	},
	changeTarget:function (dom) {
		var target=$(dom.target).closest('li').attr('target');
		$(dom.target).closest('ul').find('.active').removeClass('active');
		$(dom.target).closest('li').addClass('active');
	},
	renderDetail:function () {
		$('.page-block').hide();
		$('.page-detail').remove();
		this.detail=new Detail({id:this.model.get('id')});
		var self=this;
		this.detail.fetch()
		.done(function () {
			var temp=_.template($('#detail-temp').html());
			$('.page-container').append(temp({detail:self.detail}));
		})
	},
	renderHistory:function() {
		$('.page-block').hide();
		$('.alert-history').show();
	},
	renderTrends:function () {
		$('.page-block').hide();
		$('.page-trends').show();
	},
	renderReport:function () {
		$('.page-block').hide();
		$('.page-report').show();
	},
	renderNotification:function () {
		$('.page-block').hide();
		$('.notification-history').show();
	}
})


$(function (){
	$("#warpper-top").load("wrapper-top.html",function () {
		console.log($(".top-navbar .nav li").get(0));
		$($(".top-navbar .nav li").get(1)).addClass('active');
	});
	var view=new BodyView();
})
