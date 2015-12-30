define(['jquery','underscore','backbone','Asset'],
	function ($,_,Backbone,Asset) {
	/*
	*	显示资产的详细信息
	*/
	var AssetDetailView=Backbone.View.extend({
		el:$('.content'),
		template:_.template($('#asset-detail-temp').html()),
		initialize:function () {
			this.asset=new Asset();
			this.asset.on('sync',this.render,this);
		},
		//由router调用，当选择的资产改变时，更新资产模型
		changeModel:function (id) {
			this.asset.set('id',id);
			this.asset.fetch();
		},
		render:function () {
			console.log('detail');
			this.$el.empty()
			this.$el.append(this.template({asset:this.asset.attributes}));
		}
	})
	return AssetDetailView;
})