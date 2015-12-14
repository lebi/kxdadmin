define(['underscore','backbone','cookie'],function (_,Backbone,cookie) {
	var UnitView=Backbone.View.extend({
		el:$('body'),
		events:{
			'click .manage-tab>a':'switchManage'
		},
		initialize:function(){
			this.nav=new UnitNavView();
			this.detail=new UnitDetailView();
			$('.manage-tab>a[manage=asset]').addClass('active');
			UnitView.manage=new AssetView();
			new UnitRouter();
		}
	})
	UnitView.manage=null;

	var UnitNavView=Backbone.View.extend({
		el:$('.unit-nav'),
		template:_.template($('#unit-nav-temp').html()),
		events:{
			'click .tree-icon':'toggle'
		},
		initialize:function () {
			this.render();
		},
		render:function () {
			this.$el.append(this.template());
		},
		toggle:function () {
			var parent=$(event.target).closest('.unit-li');

			if(parent.hasClass('active'))
				parent.removeClass('active');
			else
				parent.addClass('active');
		}
	})

	var UnitDetailView=Backbone.View.extend({
		el:$('.unit-detail'),
		template:_.template($('#unit-detail-temp').html()),
		initialize:function () {
			this.render();
		},
		render:function () {
			this.$el.append(this.template());
		}
	})

	var UnitEditView=Backbone.View.extend({
		el:$('.manage-wrapper'),
		events:{
		},
		template:_.template($('#unit-edit-temp').html()),
		initialize:function () {
			this.render();
		},
		render:function () {
			$('.manage-wrapper').empty();
			$('.manage-wrapper').append(this.template());
			// this.$el=$('.unit-manage');
			// this.delegateEvents();
		}
	})

	var AssetView=Backbone.View.extend({
		el:$('.manage-wrapper'),
		template:_.template($('#asset-temp').html()),
		initialize:function () {
			this.render();
		},
		render:function () {
			$('.manage-wrapper').empty();
			$('.manage-wrapper').append(this.template());
			// this.$el=$('#asset');
			// this.delegateEvents();
		}
	})

	var UnitRouter=Backbone.Router.extend({
		routes:{
			'asset':'asset',
			'edit':'edit',
			'add':'add'
		},
		asset:function () {
			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=asset]').addClass('active');
			if(UnitView.manage instanceof UnitEditView)
				this.editTemp=UnitView.manage;

			if(this.assetTemp)
				UnitView.manage=this.assetTemp;
			else
				UnitView.manage=new AssetView();
			
			// console.log(UnitView.manage)
			UnitView.manage.render();
		},
		edit:function () {
			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=unit]').addClass('active');
			if(UnitView.manage instanceof AssetView)
				this.assetTemp=UnitView.manage;

			if(this.editTemp)
				UnitView.manage=this.editTemp;
			else
				UnitView.manage=new UnitEditView();
			
			// console.log(UnitView.manage)
			UnitView.manage.render();
		}
	})

	return UnitView;
})