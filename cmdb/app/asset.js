require.config({
	paths:{
		jquery:'../../lib/jquery-1.11.3.min',
		underscore:'../../lib/underscore-min',
		backbone:'../../lib/backbone',
		cookie:'../../lib/jquery.cookie',
		bootstrap:'../../lib/bootstrap.min',
		model:'../../js/base-model',
		collection:'../../js/base-collection',
	}
})

define(['underscore','backbone','cookie'],function (_,Backbone,cookie) {
	var AssetView=Backbone.View.extend({
		el:$('.content'),
		template:_.template($('#asset-info-temp').html()),
		initialize:function () {
			this.render()
		},
		render:function () {
			this.$el.empty()
			this.$el.append(this.template());
		}
	})

	var AssetDetailView=Backbone.View.extend({
		el:$('.content'),
		template:_.template($('#asset-detail-temp').html()),
		initialize:function () {
			this.render()
		},
		render:function () {
			this.$el.empty()
			this.$el.append(this.template());
		}
	})

	var AssetEditView=Backbone.View.extend({
		el:$('.content'),
		template:_.template($('#asset-edit-temp').html()),
		initialize:function () {
			this.render()
		},
		render:function () {
			this.$el.empty()
			this.$el.append(this.template());
		}
	})

	var AssetRouter=Backbone.Router.extend({
		routes:{
			'':'info',
			'detail':'detail',
			'edit':'edit'
		},
		detail:function () {
			if(detail)
				detail.render()
			else
				detail=new AssetDetailView();
		},
		info:function () {
			if(asset)
				asset.render()
			else
				asset=new AssetView();
		},
		edit:function (argument) {
			if(edit)
				edit.render()
			else
				edit=new AssetEditView();
		}
	})
	var asset;
	var router=new AssetRouter();
	Backbone.history.start();
	var detail;
	var edit;
})