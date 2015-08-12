var BodyView=Backbone.View.extend({
	el:$('body'),
	events:{
		'click .page-button li':'changeTarget',
		'click .page-button li[target=page-detail]':'renderDetail',
		'click .page-button li[target=service-status]':'renderServices',
		'click .page-button li[target=alert-history]':'renderHistory',
		'click .page-button li[target=page-trends]':'renderTrends',
		'click .page-button li[target=page-report]':'renderReport',
		'click .page-button li[target=notification-history]':'renderNotification',
	},
	initialize:function (){
		this.serviceid=$.cookie('serviceid');
		this.model=new Host();
		var self=this;
		this.model.fetch({data:{serviceid:this.serviceid}})
		.done(function () {
			var temp=_.template($('#title-temp').html());
			$('.page-title').empty();
			$('.page-title').append(temp({monitor:self.model}));
			self.renderDetail();
		})
	},
	changeTarget:function (dom) {
		var target=$(dom.target).closest('li').attr('target');
		$(dom.target).closest('ul').find('.active').removeClass('active');
		$(dom.target).closest('li').addClass('active');
	},
	renderDetail:function () {
		$('.page-block').hide();
		$('.page-detail').remove();
		this.detail=new HostDetail({id:this.model.get('id')});
		var self=this;
		this.detail.fetch()
		.done(function () {
			var temp=_.template($('#detail-temp').html());
			$('.page-container').append(temp({detail:self.detail}));
		})
	},
	renderServices:function () {
		$('.page-block').hide();
		$('.page-detail').remove();
		$.getJSON('/demo/monitor/host/services',{id:this.model.get('id')},function (services) {
			var length=services.length;
			_.each(services,function (service) {
				$.getJSON('/demo/monitor/detail/'+service.id,function (detail) {
					var detailMod=new Detail(detail);
					var serviceMod=new Service(service);

				})
			})
			$('.page-detail').show();
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
