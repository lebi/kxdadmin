define(['jquery','underscore','backbone','MainAssetView','AssetDetailView','UnitTreeView','AssetEditView','AssetAddView'],
	function ($,_,Backbone,MainAssetView,AssetDetailView,UnitTreeView,AssetEditView,AssetAddView) {
	var AssetRouter=Backbone.Router.extend({
		routes:{
			'':'info',
			'detail':'detail',
			'edit':'edit',
			'add':'add',
		},
		detail:function (id) {
			if(!detail){
				detail=new AssetDetailView();
			}
			detail.changeModel(id);
		},
		info:function () {
			asset.doFetch();
		},
		edit:function (id) {
			if(!edit){
				edit=new AssetEditView();
				edit.setUnit(unit);
			}
			edit.changeModel(id);
		},
		add:function () {
			if(!add){
				add=new AssetAddView();
				add.setUnit(unit);
			}
			add.changeModel();
		}
	})
	var asset=new MainAssetView();
	var unit=new UnitTreeView();
	var detail;
	var add;
	var edit;
	return AssetRouter;
})