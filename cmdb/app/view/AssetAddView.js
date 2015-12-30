define(['jquery','underscore','backbone','AssetTypeList','Asset','AssetType','AssetEditView'],
	function ($,_,Backbone,AssetTypeList,Asset,AssetType,AssetEditView) {

	/*
	*	添加资产，编辑信息。
	*/
	var AssetAddView=AssetEditView.extend({
		el:$('.content'),
		template:_.template($('#asset-add-temp').html()),
		events:{
			'change .asset-add input':'bindValue',
			'change .asset-add select':'bindType',
			'click .asset-add #save':'save',
			'click .asset-add #unit':'unitShow'
		},
		initialize:function () {
			this.asset=new Asset();
			this.assetType=new AssetType();

			this.typeList=new AssetTypeList();
			this.typeList.on('sync',this.render,this);
			this.typeList.fetch();
		},
		//由router调用，选择添加资产，创建新的资产模型
		changeModel:function () {
			this.asset=new Asset();
			this.asset.on('myupdate',this.render,this);
			this.render();
		},
		render:function () {
			this.$el.empty();
			this.$el.append(this.template({
				asset:this.asset.attributes,
				typeList:this.typeList
			}));
			$('.datetimepicker').remove();
			$(".form_datetime").datetimepicker({
	        	format: "yyyy-mm-dd",
	        	autoclose:true,
	        	startView: 4, 
	        	minView: 2,
	        });
		},
		bindType:function(){
			var tid=$(event.target).val();
			if(tid!=0){
				this.assetType.set('id',tid);
				var self=this;
				this.assetType.fetch().done(function () {
					self.setAssetType(self.asset,self.assetType.toJSON());
					self.asset.set('typeDetail',self.assetType.toJSON());
					self.asset.trigger('myupdate');
				})
			}
		}
	})
	return AssetAddView;
})