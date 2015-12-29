define(['jquery','underscore','backbone','AssetTypeList','AssetList','AssetView','ColumnMap'],
	function ($,_,Backbone,AssetTypeList,AssetList,AssetView,ColumnMap) {

	/*	@Variables: unitDetail:和detailView的detail相绑定，当detailView的值改变，就会触发chooseChange。
	*				typeList:资产类型列表。
	*				assetList:搜索到的资产列表。
	*				search:保存用于搜索的关键字。unitDetail改变，会改变它的unitId。
	*					  （初始化他的typeId和unitId，否则为null，不能成功fetch）
	*/
	var UnitAssetView=AssetView.extend({
		events:{
			'click .pagination a':'page',
			'click .remove-asset':'remove',
			'change #asset #type-select':'bindType',
			'change #asset .matcher':'bindValue',
			'change #asset #key-select':'bindKey',
		},
		el:$('.manage-wrapper'),
		template:_.template($('#asset-temp').html()),
		initialize:function (unitDetail,active) {
			this.active=active;
			this.unitDetail=unitDetail;
			this.unitDetail.on('chooseChange',this.doChange,this);

			this.typeList=new AssetTypeList();
			this.typeList.on('sync',this.render,this);
			this.typeList.fetch();
			
			this.assetList=new AssetList();
			this.assetList.on('sync',this.render,this);

			this.search={};
			_.extend(this.search,Backbone.Events);
			this.search.model={key:'name',type:0,page:1,matcher:'',extend:false,unit:unitDetail.get('id')};
			this.search.on('change',this.doFetch,this);

			this.showColumn=null;
			this.doFetch();
		},
		doChange:function () {
			this.search.model.unit=this.unitDetail.get('id');
			this.search.model.page=1;
			this.search.trigger('change');
		},
		doFetch:function () {
			if(this.active.now!='asset')return;
			this.assetList.fetch({data:this.search.model});
		},
		render:function () {
			if(this.active.now!='asset')return;
			$('.manage-wrapper').empty();
			$('.manage-wrapper').append(this.template({
				typeList:this.typeList,
				search:this.search.model,
				assetList:this.assetList,
				showColumn:this.showColumn,
				columnMap:ColumnMap.map,
				columns:_.keys(ColumnMap.priority),
				defaults:_.keys(ColumnMap.defaults)
			}));
		}
	})
	return UnitAssetView;
})