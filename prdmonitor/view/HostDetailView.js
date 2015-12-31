define(['jquery','underscore','backbone','cookie','bootstrap','Host','HostDetail','util','DetailList'],
	function ($,_,Backbone,cookie,bootstrap,Host,HostDetail,util,DetailList) {

	var HostDetailView=Backbone.View.extend({
		el:$('body'),
		events:{
			'click .page-button li':'changeTarget',
			'click .service-status table a':'jumpToDetail'
		},
		initialize:function (){
			this.serviceid=$.cookie('serviceid');
			this.model=new Host();
			this.target='page-detail';
			var self=this;
			this.model.fetch({data:{serviceid:this.serviceid}})
			.done(function () {
				var temp=_.template($('#title-temp').html());
				$('.page-title').empty();
				$('.page-title').append(temp({monitor:self.model}));
				self.renderDetail();
			})
			setInterval(function () {
				self.render();
			},10000);
		},
		changeTarget:function (dom) {
			this.target=$(dom.target).closest('li').attr('target');
			$(dom.target).closest('ul').find('.active').removeClass('active');
			$(dom.target).closest('li').addClass('active');
			this.render();
		},
		render:function () {
			console.log('render');
			switch(this.target){
				case 'page-detail':
					this.renderDetail();
					break;
				case 'service-status':
					this.renderServices();
					break;
				case 'alert-history':
					this.renderHistory();
					break;
				case 'page-trends':
					this.renderTrends();
					break;
				case 'page-report':
					this.renderReport();
					break;
				case 'notification-history':
					this.renderNotification();
					break;
			}
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
			$('.service-status').remove();
			var detailList=new DetailList();
			detailList.fetch({data:{id:this.model.get('id')}})
			.done(function () {
				var temp=_.template($('#services-temp').html());
				$('.page-container').append(temp({detailList:detailList}));
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
		},
		jumpToDetail:function (dom) {
			dom=dom.target;
			var serviceid=$(dom).closest('tr').attr('serviceid');
			$.cookie("serviceid",serviceid);
			window.location.href="detail.html";
		}
	})
	return HostDetailView;
})